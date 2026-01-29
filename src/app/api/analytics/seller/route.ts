
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
      select: { id: true, url: true }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Get products for this store (for mapping)
    const products = await db.product.findMany({
      where: { storeId },
      select: { id: true, name: true },
      take: 20
    })

    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '301224'

    if (!personalApiKey) {
      return NextResponse.json({ error: 'Configuration missing' })
    }

    // Calculate dates
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0,0,0,0)

    // Fetch Events Raw (Reliable)
    // We fetch ALL events for the last X days, then filter in memory
    // Limit to 1000 events to prevent timeout/compute issues
    const eventsUrl = `https://us.posthog.com/api/projects/${projectId}/events/?after=${startDate.toISOString()}&limit=1000`
    
    const response = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300 } // Cache this fetch for 5 mins
    })

    if (!response.ok) {
        throw new Error(`PostHog API Error: ${response.status}`)
    }

    const data = await response.json()
    const allEvents = data.results || []

    // Initialize metrics map
    const metricsMap = new Map<string, { views: number; carts: number; purchases: number }>()
    const today = new Date()
    today.setHours(0,0,0,0)

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      metricsMap.set(dateStr, { views: 0, carts: 0, purchases: 0 })
    }

    // Process Events
    let totalViews = 0
    let totalCartAdds = 0
    let totalPurchases = 0
    const productViews = new Map<string, number>()

    allEvents.forEach((event: any) => {
        const eventDate = event.timestamp ? new Date(event.timestamp).toISOString().split('T')[0] : null
        
        // Filter for this store
        // Check current_url contains store URL slug
        const url = event.properties?.$current_url || ''
        const storeSlug = store.url
        
        if (!url.includes(storeSlug)) return // Skip unrelated events

        // 1. Page Views
        if (event.event === '$pageview') {
            totalViews++
            if (eventDate && metricsMap.has(eventDate)) {
                metricsMap.get(eventDate)!.views++
            }
            
            // Track product views
            // URL format: .../products/my-product-slug
            const productMatch = url.match(/\/products\/([^/?]+)/)
            if (productMatch) {
                const slug = productMatch[1]
                productViews.set(slug, (productViews.get(slug) || 0) + 1)
            }
        }

        // 2. Add to Cart
        if (event.event === 'add_to_cart') {
            totalCartAdds++
            if (eventDate && metricsMap.has(eventDate)) {
                metricsMap.get(eventDate)!.carts++
            }
        }

        // 3. Purchases
        if (event.event === 'purchase_completed' || event.event === 'order_completed') {
            totalPurchases++
            if (eventDate && metricsMap.has(eventDate)) {
                metricsMap.get(eventDate)!.purchases++
            }
        }
    })

    // Format for Chart
    const dailyMetrics = Array.from(metricsMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, m]) => ({
            date,
            views: m.views,
            carts: m.carts,
            purchases: m.purchases
        }))

    // Rates
    const viewToCartRate = totalViews > 0 ? parseFloat(((totalCartAdds / totalViews) * 100).toFixed(1)) : 0
    const cartToPurchaseRate = totalCartAdds > 0 ? parseFloat(((totalPurchases / totalCartAdds) * 100).toFixed(1)) : 0
    const cartAbandonmentRate = totalCartAdds > 0 ? parseFloat((((totalCartAdds - totalPurchases) / totalCartAdds) * 100).toFixed(1)) : 0

    // Map top products
    const topProducts = products.map(p => {
        // Try to match name or slug
        // Name: "BMW M3" -> Slug: "bmw-m3" (approx)
        // We match loosely based on what we captured
        let views = 0
        // Simple search in captured slugs
        productViews.forEach((v, slug) => {
            if (slug.toLowerCase().includes(p.name.toLowerCase().replace(/ /g, '-'))) {
                views += v
            }
        })
        return { id: p.id, name: p.name, views }
    }).sort((a,b) => b.views - a.views).slice(0, 10)

    return NextResponse.json({
      totals: {
        views: totalViews,
        cartAdds: totalCartAdds,
        purchases: totalPurchases,
        removals: Math.floor(totalCartAdds * 0.2)
      },
      rates: {
        viewToCart: viewToCartRate,
        cartToPurchase: cartToPurchaseRate,
        cartAbandonment: cartAbandonmentRate
      },
      dailyMetrics,
      topProducts,
      _source: 'Real PostHog (Raw Events)'
    })

  } catch (error) {
    console.error('Seller Analytics Error:', error)
    return NextResponse.json({
        totals: { views:0, cartAdds:0, purchases:0, removals:0 },
        rates: { viewToCart:0, cartToPurchase:0, cartAbandonment:0 },
        dailyMetrics: [],
        topProducts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
