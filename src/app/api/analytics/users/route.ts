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
    startDate.setHours(0, 0, 0, 0)

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

    // Fetch ALL events (not just pageview) to get more data
    const eventsUrl = `https://us.posthog.com/api/projects/${projectId}/events/?after=${startDate.toISOString()}&limit=1000`
    
    const response = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
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
    const allEvents = data.results || []

    // Process events
    const metricsMap = new Map<string, { pageviews: number; visitors: Set<string>; sessions: Set<string> }>()
    const urlCounts = new Map<string, number>()
    const allVisitors = new Set<string>()
    let totalPageviews = 0
    let totalSessions = new Set<string>()
    
    // Initialize all days in the range
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      metricsMap.set(dateStr, { pageviews: 0, visitors: new Set(), sessions: new Set() })
    }

    // Count events
    allEvents.forEach((event: any) => {
      const eventDate = event.timestamp ? new Date(event.timestamp).toISOString().split('T')[0] : null
      
      // Track all visitors
      if (event.distinct_id) {
        allVisitors.add(event.distinct_id)
      }
      
      // Track sessions
      if (event.properties?.$session_id) {
        totalSessions.add(event.properties.$session_id)
      }
      
      // Only count pageviews for the chart
      if (event.event === '$pageview') {
        totalPageviews++
        
        // Add to daily metrics if date exists
        if (eventDate && metricsMap.has(eventDate)) {
          const metric = metricsMap.get(eventDate)!
          metric.pageviews++
          if (event.distinct_id) metric.visitors.add(event.distinct_id)
          if (event.properties?.$session_id) metric.sessions.add(event.properties.$session_id)
        }
        
        // Count URLs for top pages
        const url = event.properties?.$current_url || event.properties?.$pathname || '/'
        urlCounts.set(url, (urlCounts.get(url) || 0) + 1)
      }
    })

    // Convert to arrays
    const dailyMetrics = Array.from(metricsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, m]) => ({
        date,
        pageviews: m.pageviews,
        visitors: m.visitors.size,
        sessions: m.sessions.size || Math.max(1, Math.ceil(m.visitors.size * 1.2)),
        signups: 0
      }))

    const dailyVisitors = dailyMetrics.reduce((sum, d) => sum + d.visitors, 0)
    const dailySessions = dailyMetrics.reduce((sum, d) => sum + d.sessions, 0)

    const topPages = Array.from(urlCounts.entries())
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return NextResponse.json({
      dailyMetrics,
      totals: {
        pageviews: totalPageviews,
        visitors: allVisitors.size,
        signups: 0,
        sessions: totalSessions.size
      },
      averages: {
        pageviewsPerDay: Math.round(totalPageviews / days),
        visitorsPerDay: Math.round(allVisitors.size / days),
        pageviewsPerSession: totalSessions.size > 0 ? parseFloat((totalPageviews / totalSessions.size).toFixed(1)) : 0
      },
      topPages,
      _debug: {
        totalEventsFound: allEvents.length,
        pageviewEvents: totalPageviews,
        uniqueVisitors: allVisitors.size,
        uniqueSessions: totalSessions.size,
        daysInRange: days,
        startDate: startDate.toISOString()
      }
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
