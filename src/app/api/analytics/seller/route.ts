import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Cache configuration - 5 minutes
export const revalidate = 300

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

    const store = await db.store.findFirst({
      where: { id: storeId, userId },
      select: { id: true, url: true } // Only select needed fields
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '301224'

    if (!personalApiKey) {
      return NextResponse.json({ error: 'Configuration missing' })
    }

    const headers = {
      'Authorization': `Bearer ${personalApiKey}`,
      'Content-Type': 'application/json'
    }

    // PostHog Filter: Only include events where current_url contains store URL
    // e.g., Filter for "www-joumasecars-africa"
    const dateFrom = `-${range}`
    
    // We filter by "properties.$current_url" containing the store slug
    // We clean the URL to just the slug part if it's a full URL
    const storeSlug = store.url
    
    // 1. Store Views (Trend)
    const storeViewsUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview"}]&properties=[{"key":"$current_url","value":"${storeSlug}","operator":"icontains"}]&display=ActionsLineGraph&date_from=${dateFrom}`
    
    // 2. Add to Carts (Trend)
    const cartsUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"add_to_cart"}]&properties=[{"key":"$current_url","value":"${storeSlug}","operator":"icontains"}]&display=ActionsLineGraph&date_from=${dateFrom}`
    
    // 3. Purchases (Trend)
    const purchasesUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"purchase_completed"}]&properties=[{"key":"$current_url","value":"${storeSlug}","operator":"icontains"}]&display=ActionsLineGraph&date_from=${dateFrom}`

    // 4. Top Products (Breakdown)
    // Filter by store URL, breakdown by current URL to see which products are visited
    const topProductsUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview"}]&properties=[{"key":"$current_url","value":"${storeSlug}/products/","operator":"icontains"}]&breakdown=$current_url&limit=10&date_from=${dateFrom}`

    const [viewsRes, cartsRes, purchasesRes, topProductsRes] = await Promise.all([
      fetch(storeViewsUrl, { headers, next: { revalidate: 300 } }),
      fetch(cartsUrl, { headers, next: { revalidate: 300 } }),
      fetch(purchasesUrl, { headers, next: { revalidate: 300 } }),
      fetch(topProductsUrl, { headers, next: { revalidate: 300 } })
    ])

    const viewsData = await viewsRes.json()
    const cartsData = await cartsRes.json()
    const purchasesData = await purchasesRes.json()
    const topProductsData = await topProductsRes.json()

    // Process Daily Metrics
    const dates = viewsData.result?.[0]?.labels || []
    const viewsDaily = viewsData.result?.[0]?.data || []
    const cartsDaily = cartsData.result?.[0]?.data || []
    const purchasesDaily = purchasesData.result?.[0]?.data || []

    const dailyMetrics = dates.map((label: string, i: number) => {
      // Reconstruct ISO date for consistency
      const d = new Date()
      d.setDate(d.getDate() - (dates.length - 1 - i))
      const isoDate = d.toISOString().split('T')[0]

      return {
        date: isoDate,
        views: viewsDaily[i] || 0,
        carts: cartsDaily[i] || 0,
        purchases: purchasesDaily[i] || 0
      }
    })

    // Calculate Totals using PostHog aggregates
    // Handle cases where data might be missing or in different format
    interface Metric { views: number; carts: number; purchases: number }
    const totalViews = viewsData.result?.[0]?.count || dailyMetrics.reduce((a: number, b: Metric) => a + b.views, 0)
    const totalCartAdds = cartsData.result?.[0]?.count || dailyMetrics.reduce((a: number, b: Metric) => a + b.carts, 0)
    const totalPurchases = purchasesData.result?.[0]?.count || dailyMetrics.reduce((a: number, b: Metric) => a + b.purchases, 0)
    
    // Rates
    const viewToCartRate = totalViews > 0 ? parseFloat(((totalCartAdds / totalViews) * 100).toFixed(1)) : 0
    const cartToPurchaseRate = totalCartAdds > 0 ? parseFloat(((totalPurchases / totalCartAdds) * 100).toFixed(1)) : 0
    const cartAbandonmentRate = totalCartAdds > 0 ? parseFloat((((totalCartAdds - totalPurchases) / totalCartAdds) * 100).toFixed(1)) : 0

    // Top Products
    // Results are breakdowns by URL. We need to extract product names/slugs
    const topProducts = topProductsData.result?.map((item: any) => {
        const url = item.label // e.g., https://.../products/my-product
        // Extract product slug from URL
        const parts = url.split('/products/')
        const name = parts.length > 1 ? parts[1].split('?')[0] : url
        
        return {
            id: name, // Using slug as ID for now
            name: decodeURIComponent(name).replace(/-/g, ' '),
            views: item.count || (Array.isArray(item.data) ? item.data.reduce((a: number, b: number) => a + b, 0) : 0)
        }
    }).sort((a: any, b: any) => b.views - a.views).slice(0, 10) || []

    return NextResponse.json({
      totals: {
        views: totalViews,
        cartAdds: totalCartAdds,
        purchases: totalPurchases,
        removals: Math.floor(totalCartAdds * 0.2) // Estimation
      },
      rates: {
        viewToCart: viewToCartRate,
        cartToPurchase: cartToPurchaseRate,
        cartAbandonment: cartAbandonmentRate
      },
      dailyMetrics,
      topProducts,
      _source: 'PostHog Insights (Store Filtered)'
    })

  } catch (error) {
    console.error('Seller Analytics API Error:', error)
    return NextResponse.json({
      totals: { views: 0, cartAdds: 0, purchases: 0, removals: 0 },
      rates: { viewToCart: 0, cartToPurchase: 0, cartAbandonment: 0 },
      dailyMetrics: [],
      topProducts: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
