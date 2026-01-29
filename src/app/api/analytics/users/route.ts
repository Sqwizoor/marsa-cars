
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Cache for 5 minutes
export const revalidate = 300 

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    // Convert '7d' -> '-7d' for PostHog API
    const dateFrom = `-${range}`
    
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '301224'

    if (!personalApiKey) {
        return NextResponse.json({ 
            error: 'Configuration missing', 
            details: 'POSTHOG_PERSONAL_API_KEY missing' 
        })
    }

    const headers = {
        'Authorization': `Bearer ${personalApiKey}`,
        'Content-Type': 'application/json'
    }

    // Define PostHog API URLs
    // 1. Daily Trend (Access & Usage)
    const trendUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview"}]&display=ActionsLineGraph&date_from=${dateFrom}`
    
    // 2. Unique Visitors (DAU)
    const visitorsUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview","math":"dau"}]&display=ActionsLineGraph&date_from=${dateFrom}`

    // 3. Top Pages
    const topPagesUrl = `https://us.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview"}]&breakdown=$current_url&limit=10&date_from=${dateFrom}`

    // Parallel Fetch (Fast)
    const [trendRes, visitorsRes, topPagesRes, signupsDB] = await Promise.all([
        fetch(trendUrl, { headers, next: { revalidate: 300 } }),
        fetch(visitorsUrl, { headers, next: { revalidate: 300 } }),
        fetch(topPagesUrl, { headers, next: { revalidate: 300 } }),
        // Get real signups from DB
        db.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: new Date(Date.now() - (parseInt(range) * 24 * 60 * 60 * 1000))
                }
            },
            _count: { id: true }
        })
    ])

    if (!trendRes.ok) {
        throw new Error(`PostHog Trend API Error: ${trendRes.status}`)
    }

    const pageviewData = await trendRes.json()
    const visitorData = await visitorsRes.json()
    const topPagesData = await topPagesRes.json()

    // Process PostHog Data
    // They return { result: [{ data: [], labels: [], days: [] }] }
    const dates = pageviewData.result?.[0]?.labels || []
    const pageviewsRaw = pageviewData.result?.[0]?.data || []
    const visitorsRaw = visitorData.result?.[0]?.data || []

    // Process Signups
    const signupMap = new Map<string, number>()
    signupsDB.forEach(s => {
        const d = new Date(s.createdAt).toISOString().split('T')[0]
        signupMap.set(d, (signupMap.get(d) || 0) + s._count.id)
    })

    // Combine into Daily Metrics
    const dailyMetrics = dates.map((label: string, i: number) => {
        // Calculate date object for chart sorting/display
        // PostHog labels are usually "6-Feb", need ISO for mapping matches if needed
        // We assume index mapping matches reverse chronological or chronological order provided by API
        // Typically PostHog returns chronological.
        
        // Reconstruct date string for DB lookup (approximate logic: today - offset)
        const d = new Date()
        const dayOffset = dates.length - 1 - i
        d.setDate(d.getDate() - dayOffset)
        const isoDate = d.toISOString().split('T')[0]

        const pageviews = pageviewsRaw[i] || 0
        const visitors = visitorsRaw[i] || 0
        
        return {
            date: isoDate, // e.g. "2024-02-06"
            label: label,  // e.g. "6 Feb"
            pageviews,
            visitors,
            sessions: Math.ceil(visitors * 1.0), // Simplified session estimate
            signups: signupMap.get(isoDate) || 0
        }
    })

    // Calculate Totals using PostHog's "count" property which is often the aggregate
    interface DailyMetric { pageviews: number; visitors: number; }
    const totalPageviews = pageviewData.result?.[0]?.count || dailyMetrics.reduce((a: number, b: DailyMetric) => a + b.pageviews, 0)
    const totalVisitors = visitorData.result?.[0]?.count || dailyMetrics.reduce((a: number, b: DailyMetric) => a + b.visitors, 0) // Sum of DAU
    
    interface SignupRecord { _count: { id: number } }
    const totalSignups = signupsDB.reduce((a: number, b: SignupRecord) => a + b._count.id, 0)
    const totalSessions = Math.ceil(totalPageviews / 2.5) // Estimate

    // Top Pages
    const topPages = topPagesData.result?.map((item: any) => ({
        url: item.label,
        views: item.count || (Array.isArray(item.data) ? item.data.reduce((a: number, b: number) => a + b, 0) : 0)
    })).sort((a: any, b: any) => b.views - a.views).slice(0, 10) || []

    const daysCount = dates.length || 1

    return NextResponse.json({
        dailyMetrics,
        totals: {
            pageviews: totalPageviews,
            visitors: totalVisitors,
            signups: totalSignups,
            sessions: totalSessions
        },
        averages: {
            pageviewsPerDay: Math.round(totalPageviews / daysCount),
            visitorsPerDay: Math.round(totalVisitors / daysCount),
            pageviewsPerSession: totalSessions > 0 ? parseFloat((totalPageviews / totalSessions).toFixed(1)) : 0
        },
        topPages,
        _source: 'PostHog Insights (Cached)'
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({
        dailyMetrics: [],
        totals: { pageviews:0, visitors:0, signups:0, sessions:0 },
        averages: { pageviewsPerDay:0, visitorsPerDay:0, pageviewsPerSession:0 },
        topPages: [],
        error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
