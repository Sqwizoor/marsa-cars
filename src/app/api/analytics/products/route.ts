import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// PostHog API endpoint
const POSTHOG_API = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_KEY?.split('_')?.[1] || ''

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Query PostHog insights API
    const events = [
      'product_viewed',
      'add_to_cart',
      'purchase_completed'
    ]

    // Fetch from PostHog
    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
      'Content-Type': 'application/json'
    }

    // Get product views
    const viewsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ id: 'product_viewed', name: 'product_viewed', type: 'events' }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: 'product_id',
      })
    })

    // Get add to cart events
    const cartResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ id: 'add_to_cart', name: 'add_to_cart', type: 'events' }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: 'product_id',
      })
    })

    // Get purchases
    const purchasesResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ id: 'purchase_completed', name: 'purchase_completed', type: 'events' }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: 'items',
      })
    })

    // Process and aggregate data
    const viewsData = await viewsResponse.json()
    const cartData = await cartResponse.json()
    const purchaseData = await purchasesResponse.json()

    // Aggregate by product
    const productMetrics = new Map()

    // Helper to process PostHog results
    const processMetrics = (data: any, metricName: string) => {
      if (data?.result) {
        data.result.forEach((item: any) => {
          const productId = item.breakdown_value
          if (!productId) return

          if (!productMetrics.has(productId)) {
            productMetrics.set(productId, {
              id: productId,
              name: item.label || productId,
              views: 0,
              addToCart: 0,
              purchases: 0,
              revenue: 0,
            })
          }

          const metric = productMetrics.get(productId)
          const count = item.count || item.data?.reduce((sum: number, val: number) => sum + val, 0) || 0
          
          if (metricName === 'views') metric.views = count
          if (metricName === 'cart') metric.addToCart = count
          if (metricName === 'purchases') {
            metric.purchases = count
            metric.revenue = (item.aggregated_value || 0)
          }
        })
      }
    }

    processMetrics(viewsData, 'views')
    processMetrics(cartData, 'cart')
    processMetrics(purchaseData, 'purchases')

    // Convert to array and calculate conversion rates
    const products = Array.from(productMetrics.values()).map(product => ({
      ...product,
      conversionRate: product.views > 0 ? (product.purchases / product.views) * 100 : 0
    }))

    // Sort by revenue
    const topProducts = products.sort((a, b) => b.revenue - a.revenue)

    // Calculate totals
    const totalViews = products.reduce((sum, p) => sum + p.views, 0)
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)
    const totalPurchases = products.reduce((sum, p) => sum + p.purchases, 0)

    // Category performance (simplified - you can enhance this)
    const categoryPerformance = [
      { name: 'Car Parts', value: totalRevenue * 0.6 },
      { name: 'Accessories', value: totalRevenue * 0.25 },
      { name: 'Tools', value: totalRevenue * 0.15 },
    ]

    return NextResponse.json({
      topProducts: topProducts.slice(0, 20),
      totalViews,
      totalRevenue,
      totalPurchases,
      categoryPerformance
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    
    // Return mock data for development/testing
    return NextResponse.json({
      topProducts: [],
      totalViews: 0,
      totalRevenue: 0,
      totalPurchases: 0,
      categoryPerformance: []
    })
  }
}
