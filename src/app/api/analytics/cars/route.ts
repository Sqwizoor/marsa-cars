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
    const range = searchParams.get('range') || '30d'
    const sellerId = searchParams.get('sellerId')
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
      'Content-Type': 'application/json'
    }

    // Build filters for seller if provided
    const sellerFilter = sellerId ? { seller_id: sellerId } : {}

    // Get car views
    const viewsResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: 'car_viewed', 
          name: 'car_viewed', 
          type: 'events',
          properties: [sellerFilter]
        }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: 'car_id',
      })
    })

    // Get car inquiries
    const inquiriesResponse = await fetch(`${POSTHOG_API}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{ 
          id: 'car_inquiry_submitted', 
          name: 'car_inquiry_submitted', 
          type: 'events',
          properties: [sellerFilter]
        }],
        date_from: startDate.toISOString().split('T')[0],
        breakdown: 'car_id',
      })
    })

    // Process data
    const viewsData = await viewsResponse.json()
    const inquiriesData = await inquiriesResponse.json()

    const carMetrics = new Map()

    const processMetrics = (data: any, metricName: string) => {
      if (data?.result) {
        data.result.forEach((item: any) => {
          const carId = item.breakdown_value
          if (!carId) return

          if (!carMetrics.has(carId)) {
            carMetrics.set(carId, {
              id: carId,
              title: item.label || carId,
              make: '',
              model: '',
              year: 2024,
              price: 0,
              views: 0,
              inquiries: 0,
            })
          }

          const metric = carMetrics.get(carId)
          const count = item.count || item.data?.reduce((sum: number, val: number) => sum + val, 0) || 0
          
          if (metricName === 'views') metric.views = count
          if (metricName === 'inquiries') metric.inquiries = count
        })
      }
    }

    processMetrics(viewsData, 'views')
    processMetrics(inquiriesData, 'inquiries')

    // Convert to array and calculate conversion rates
    const cars = Array.from(carMetrics.values()).map(car => ({
      ...car,
      conversionRate: car.views > 0 ? (car.inquiries / car.views) * 100 : 0
    }))

    // Sort by views
    const topCars = cars.sort((a, b) => b.views - a.views)

    // Calculate totals
    const totalViews = cars.reduce((sum, c) => sum + c.views, 0)
    const totalInquiries = cars.reduce((sum, c) => sum + c.inquiries, 0)
    const totalListings = cars.length
    const avgInquiriesPerCar = totalListings > 0 ? totalInquiries / totalListings : 0

    // Make performance
    const makeMap = new Map()
    topCars.forEach(car => {
      if (!car.make) return
      if (!makeMap.has(car.make)) {
        makeMap.set(car.make, { make: car.make, views: 0, inquiries: 0 })
      }
      const makeData = makeMap.get(car.make)
      makeData.views += car.views
      makeData.inquiries += car.inquiries
    })
    
    const makePerformance = Array.from(makeMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return NextResponse.json({
      topCars: topCars.slice(0, 20),
      totalViews,
      totalInquiries,
      totalListings,
      avgInquiriesPerCar,
      makePerformance
    })

  } catch (error) {
    console.error('Car Analytics API Error:', error)
    
    // Return mock data
    return NextResponse.json({
      topCars: [],
      totalViews: 0,
      totalInquiries: 0,
      totalListings: 0,
      avgInquiriesPerCar: 0,
      makePerformance: []
    })
  }
}
