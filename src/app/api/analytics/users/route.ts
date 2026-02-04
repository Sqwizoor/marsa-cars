import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { unstable_cache } from 'next/cache'

// Define interfaces for better type safety
interface DailyMetric {
  pageviews: number
  visitors: Set<string>
  sessions: Set<string>
  signups: number
}

interface AnalyticsResult {
  dailyMetrics: any[]
  totals: {
    pageviews: number
    visitors: number
    signups: number
    sessions: number
  }
  averages: {
    pageviewsPerDay: number
    visitorsPerDay: number
    pageviewsPerSession: number
  }
  topPages: { url: string; views: number }[]
  _source: string
  _debug: any
}

// Cached data fetcher
// Revalidates every 10 minutes (600 seconds) to reduce load significantly
const getCachedAnalytics = unstable_cache(
  async (
    projectId: string,
    personalApiKey: string,
    startIso: string,
    days: number
  ) => {
    const startDate = new Date(startIso)
    const endDate = new Date() // Current time for DB query
    
    // 1. Get signups from database (can be heavy, so we cache it)
    // We fetch signups created after the start date
    const signupsPromise = db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: { id: true }
    })

    // 2. Fetch Events from PostHog
    // Using a higher limit to capture more data, though moving to Trends API is recommended for scaling
    const eventsUrl = `https://us.posthog.com/api/projects/${projectId}/events/?after=${startDate.toISOString()}&limit=5000`
    
    const posthogPromise = fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json'
      },
      // cache: 'no-store' is implicit for fetch inside unstable_cache unless we specify next: { revalidate }
      // but unstable_cache handles the caching of the *result*, so we want fresh data here when the cache function actually runs.
      cache: 'no-store' 
    })

    const [signups, response] = await Promise.all([signupsPromise, posthogPromise])

    // Process Signups
    const signupsByDate = new Map<string, number>()
    signups.forEach(s => {
      const dateStr = new Date(s.createdAt).toISOString().split('T')[0]
      signupsByDate.set(dateStr, (signupsByDate.get(dateStr) || 0) + s._count.id)
    })

    if (!response.ok) {
        throw new Error(`PostHog API Error: ${response.status}`)
    }

    const data = await response.json()
    const allEvents = data.results || []

    // Initialize daily metrics
    const metricsMap = new Map<string, DailyMetric>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      metricsMap.set(dateStr, { 
        pageviews: 0, 
        visitors: new Set(), 
        sessions: new Set(),
        signups: signupsByDate.get(dateStr) || 0
      })
    }

    // Process Events
    const urlCounts = new Map<string, number>()
    const allVisitors = new Set<string>()
    const allSessions = new Set<string>()
    let totalPageviews = 0

    allEvents.forEach((event: any) => {
      // Extract date
      let eventDate: string | null = null
      if (event.timestamp) {
        const eventTime = new Date(event.timestamp)
        eventDate = eventTime.toISOString().split('T')[0]
      }
      
      if (event.distinct_id) allVisitors.add(event.distinct_id)
      if (event.properties?.$session_id) allSessions.add(event.properties.$session_id)
      
      if (event.event === '$pageview') {
        totalPageviews++
        
        if (eventDate && metricsMap.has(eventDate)) {
          const metric = metricsMap.get(eventDate)!
          metric.pageviews++
          if (event.distinct_id) metric.visitors.add(event.distinct_id)
          if (event.properties?.$session_id) metric.sessions.add(event.properties.$session_id)
        }
        
        const url = event.properties?.$pathname || event.properties?.$current_url || '/'
        const cleanUrl = url.split('?')[0]
        urlCounts.set(cleanUrl, (urlCounts.get(cleanUrl) || 0) + 1)
      }
    })

    // Serialization for Cache: Convert Sets to numbers
    const dailyMetrics = Array.from(metricsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, m]) => ({
        date,
        pageviews: m.pageviews,
        visitors: m.visitors.size,
        sessions: m.sessions.size > 0 ? m.sessions.size : (m.visitors.size > 0 ? Math.ceil(m.visitors.size * 1.1) : 0),
        signups: m.signups
      }))

    const totalSignups = dailyMetrics.reduce((sum, d) => sum + d.signups, 0)
    
    // Top pages
    const topPages = Array.from(urlCounts.entries())
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    const result: AnalyticsResult = {
      dailyMetrics,
      totals: {
        pageviews: totalPageviews,
        visitors: allVisitors.size,
        signups: totalSignups,
        sessions: allSessions.size
      },
      averages: {
        pageviewsPerDay: Math.round(totalPageviews / days),
        visitorsPerDay: Math.round(allVisitors.size / days),
        pageviewsPerSession: allSessions.size > 0 ? parseFloat((totalPageviews / allSessions.size).toFixed(1)) : 0
      },
      topPages,
      _source: 'Real PostHog (Cached)',
      _debug: {
        totalEvents: allEvents.length,
        daysInRange: days,
      }
    }
    
    return result
  },
  ['analytics-data-main-v2'],
  { revalidate: 600, tags: ['analytics'] } // Cache for 10 minutes
)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorizgited' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 7
    
    // Normalize date to ensure cache key stability for the same day
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '301224'
    
    if (!personalApiKey) {
      return NextResponse.json({ error: 'POSTHOG_PERSONAL_API_KEY not configured' }, { status: 500 })
    }

    // Call cached function
    const data = await getCachedAnalytics(
      projectId,
      personalApiKey,
      startDate.toISOString(),
      days
    )

    return NextResponse.json(data)

  } catch (error) {
    console.error('Analytics Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      dailyMetrics: [],
      totals: { pageviews: 0, visitors: 0, signups: 0, sessions: 0 },
      averages: { pageviewsPerDay: 0, visitorsPerDay: 0, pageviewsPerSession: 0 },
      topPages: []
    }, { status: 500 })
  }
}
