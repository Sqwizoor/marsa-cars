import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '301224'
    
    if (!personalApiKey) {
      return NextResponse.json({
        dailyMetrics: [],
        totals: { pageviews: 0, visitors: 0, signups: 0, sessions: 0 },
        averages: { pageviewsPerDay: 0, visitorsPerDay: 0, pageviewsPerSession: 0 },
        topPages: [],
        error: 'POSTHOG_PERSONAL_API_KEY not configured'
      })
    }

    // Fetch events from PostHog
    const eventsUrl = `https://us.posthog.com/api/projects/${projectId}/events/?event=$pageview&after=${startDate.toISOString()}&limit=1000`
    
    const response = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PostHog API Error:', response.status, errorText)
      return NextResponse.json({
        dailyMetrics: [],
        totals: { pageviews: 0, visitors: 0, signups: 0, sessions: 0 },
        averages: { pageviewsPerDay: 0, visitorsPerDay: 0, pageviewsPerSession: 0 },
        topPages: [],
        error: `PostHog API Error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    const events = data.results || []

    // Process events into daily metrics
    const metricsMap = new Map<string, { pageviews: number; visitors: Set<string>; sessions: Set<string> }>()
    const urlCounts = new Map<string, number>()
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      metricsMap.set(dateStr, { pageviews: 0, visitors: new Set(), sessions: new Set() })
    }

    // Count events
    events.forEach((event: any) => {
      const eventDate = event.timestamp ? new Date(event.timestamp).toISOString().split('T')[0] : null
      if (eventDate && metricsMap.has(eventDate)) {
        const metric = metricsMap.get(eventDate)!
        metric.pageviews++
        if (event.distinct_id) metric.visitors.add(event.distinct_id)
        if (event.properties?.$session_id) metric.sessions.add(event.properties.$session_id)
      }
      
      // Count URLs
      const url = event.properties?.$current_url || event.properties?.$pathname
      if (url) {
        urlCounts.set(url, (urlCounts.get(url) || 0) + 1)
      }
    })

    // Convert to arrays
    const dailyMetrics = Array.from(metricsMap.entries()).map(([date, m]) => ({
      date,
      pageviews: m.pageviews,
      visitors: m.visitors.size,
      sessions: m.sessions.size || Math.ceil(m.visitors.size * 1.2),
      signups: 0
    }))

    const totalPageviews = dailyMetrics.reduce((sum, d) => sum + d.pageviews, 0)
    const totalVisitors = dailyMetrics.reduce((sum, d) => sum + d.visitors, 0)
    const totalSessions = dailyMetrics.reduce((sum, d) => sum + d.sessions, 0)

    const topPages = Array.from(urlCounts.entries())
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return NextResponse.json({
      dailyMetrics,
      totals: {
        pageviews: totalPageviews,
        visitors: totalVisitors,
        signups: 0,
        sessions: totalSessions
      },
      averages: {
        pageviewsPerDay: Math.round(totalPageviews / days),
        visitorsPerDay: Math.round(totalVisitors / days),
        pageviewsPerSession: totalSessions > 0 ? parseFloat((totalPageviews / totalSessions).toFixed(1)) : 0
      },
      topPages,
      _source: 'PostHog API',
      _eventsFound: events.length
    })

  } catch (error) {
    console.error('Analytics Error:', error)
    return NextResponse.json({
      dailyMetrics: [],
      totals: { pageviews: 0, visitors: 0, signups: 0, sessions: 0 },
      averages: { pageviewsPerDay: 0, visitorsPerDay: 0, pageviewsPerSession: 0 },
      topPages: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
