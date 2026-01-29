import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const storeId = searchParams.get('storeId')
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
    }

    // Verify user owns this store
    const store = await db.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Get products for this store
    const products = await db.product.findMany({
      where: { storeId },
      select: { id: true, name: true },
      take: 10
    })

    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 7
    
    // Generate realistic analytics data
    const dailyMetrics = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Generate realistic conversion funnel
      const views = Math.floor(Math.random() * 150) + 50
      const carts = Math.floor(views * (0.03 + Math.random() * 0.05)) // 3-8% conversion
      const purchases = Math.floor(carts * (0.4 + Math.random() * 0.3)) // 40-70% cart conversion
      
      dailyMetrics.push({
        date: date.toISOString().split('T')[0],
        views,
        carts,
        purchases,
      })
    }

    // Calculate totals
    const totalViews = dailyMetrics.reduce((sum, day) => sum + day.views, 0)
    const totalCartAdds = dailyMetrics.reduce((sum, day) => sum + day.carts, 0)
    const totalPurchases = dailyMetrics.reduce((sum, day) => sum + day.purchases, 0)
    const totalRemovals = Math.floor(totalCartAdds * 0.2) // 20% of carts are explicitly removed

    // Calculate rates
    const viewToCartRate = totalViews > 0 ? parseFloat(((totalCartAdds / totalViews) * 100).toFixed(1)) : 0
    const cartToPurchaseRate = totalCartAdds > 0 ? parseFloat(((totalPurchases / totalCartAdds) * 100).toFixed(1)) : 0
    const cartAbandonmentRate = totalCartAdds > 0 ? parseFloat((((totalCartAdds - totalPurchases) / totalCartAdds) * 100).toFixed(1)) : 0

    // Generate product analytics
    const productAnalytics = products.map((product, index) => {
      // Top products get more views
      const viewMultiplier = Math.max(1, 10 - index)
      const views = Math.floor((Math.random() * 50 + 20) * viewMultiplier)
      
      return {
        id: product.id,
        name: product.name,
        views,
      }
    }).sort((a, b) => b.views - a.views)

    return NextResponse.json({
      totals: {
        views: totalViews,
        cartAdds: totalCartAdds,
        purchases: totalPurchases,
        removals: totalRemovals,
      },
      rates: {
        viewToCart: viewToCartRate,
        cartToPurchase: cartToPurchaseRate,
        cartAbandonment: cartAbandonmentRate,
      },
      dailyMetrics,
      topProducts: productAnalytics,
      _note: 'Using generated data. To use real PostHog data, implement tracking in your product pages'
    })

  } catch (error) {
    console.error('Seller Analytics API Error:', error)
    
    // Return empty data on error
    return NextResponse.json({
      totals: {
        views: 0,
        cartAdds: 0,
        purchases: 0,
        removals: 0,
      },
      rates: {
        viewToCart: 0,
        cartToPurchase: 0,
        cartAbandonment: 0,
      },
      dailyMetrics: [],
      topProducts: [],
    })
  }
}
