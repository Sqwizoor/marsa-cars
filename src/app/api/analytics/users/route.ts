import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const POSTHOG_API = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_KEY?.split('_')?.[1] || ''

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
      'Content-Type': 'application/json'
    }

    // Get pageviews (website visitors)
    const pageviewsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: '$pageview', 
          name: '$pageview', 
          type: 'events'
        }],
        date_from: startDate.toISOString().split('T')[0],
        interval: 'day',
      })
    })

    // Get unique visitors
    const uniqueVisitorsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: '$pageview', 
          name: '$pageview', 
          type: 'events',
          math: 'dau' // Daily Active Users
        }],
        date_from: startDate.toISOString().split('T')[0],
        interval: 'day',
      })
    })

    // Get user identification events (sign ups)
    const signupsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: '$identify', 
          name: '$identify', 
          type: 'events'
        }],
        date_from: startDate.toISOString().split('T')[0],
        interval: 'day',
      })
    })

    // Get session data
    const sessionsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: '$pageview', 
          name: '$pageview', 
          type: 'events',
          math: 'unique_session'
        }],
        date_from: startDate.toISOString().split('T')[0],
        interval: 'day',
      })
    })

    // Process responses
    const pageviewsData = await pageviewsResponse.json()
    const uniqueVisitorsData = await uniqueVisitorsResponse.json()
    const signupsData = await signupsResponse.json()
    const sessionsData = await sessionsResponse.json()

    // Format data for charts
    const formatDailyData = (data: any, metricName: string) => {
      if (!data?.result?.[0]?.data) return []
      
      const dates = data.result[0].labels || []
      const values = data.result[0].data || []
      
      return dates.map((date: string, index: number) => ({
        date,
        [metricName]: values[index] || 0
      }))
    }

    const pageviewsByDay = formatDailyData(pageviewsData, 'pageviews')
    const uniqueVisitorsByDay = formatDailyData(uniqueVisitorsData, 'visitors')
    const signupsByDay = formatDailyData(signupsData, 'signups')
    const sessionsByDay = formatDailyData(sessionsData, 'sessions')

    // Merge all data by date
    const dailyMetrics = pageviewsByDay.map((item: any) => {
      const date = item.date
      const visitors = uniqueVisitorsByDay.find((v: any) => v.date === date)
      const signups = signupsByDay.find((s: any) => s.date === date)
      const sessions = sessionsByDay.find((s: any) => s.date === date)
      
      return {
        date,
        pageviews: item.pageviews || 0,
        visitors: visitors?.visitors || 0,
        signups: signups?.signups || 0,
        sessions: sessions?.sessions || 0,
      }
    })

    // Calculate totals
    const totalPageviews = dailyMetrics.reduce((sum: number, day: any) => sum + day.pageviews, 0)
    const totalVisitors = dailyMetrics.reduce((sum: number, day: any) => sum + day.visitors, 0)
    const totalSignups = dailyMetrics.reduce((sum: number, day: any) => sum + day.signups, 0)
    const totalSessions = dailyMetrics.reduce((sum: number, day: any) => sum + day.sessions, 0)

    // Calculate averages
    const avgPageviewsPerDay = Math.round(totalPageviews / days)
    const avgVisitorsPerDay = Math.round(totalVisitors / days)
    const avgPageviewsPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : 0

    // Top pages (get from PostHog)
    const topPagesResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: '$pageview', 
          name: '$pageview', 
          type: 'events'
        }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: '$current_url',
      })
    })

    const topPagesData = await topPagesResponse.json()
    const topPages = topPagesData?.result?.slice(0, 10).map((page: any) => ({
      url: page.breakdown_value || page.label || 'Unknown',
      views: page.count || page.data?.reduce((sum: number, val: number) => sum + val, 0) || 0
    })) || []

    return NextResponse.json({
      dailyMetrics,
      totals: {
        pageviews: totalPageviews,
        visitors: totalVisitors,
        signups: totalSignups,
        sessions: totalSessions,
      },
      averages: {
        pageviewsPerDay: avgPageviewsPerDay,
        visitorsPerDay: avgVisitorsPerDay,
        pageviewsPerSession: avgPageviewsPerSession,
      },
      topPages,
    })

  } catch (error) {
    console.error('User Analytics API Error:', error)
    
    // Return mock data for development
    return NextResponse.json({
      dailyMetrics: [],
      totals: {
        pageviews: 0,
        visitors: 0,
        signups: 0,
        sessions: 0,
      },
      averages: {
        pageviewsPerDay: 0,
        visitorsPerDay: 0,
        pageviewsPerSession: 0,
      },
      topPages: [],
    })
  }
}
