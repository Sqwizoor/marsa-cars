'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Car, Eye, MessageSquare, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CarMetrics {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  views: number
  inquiries: number
  conversionRate: number
  sponsoredViews?: number
  sponsoredClicks?: number
  image?: string
}

interface AnalyticsData {
  topCars: CarMetrics[]
  totalViews: number
  totalInquiries: number
  totalListings: number
  avgInquiriesPerCar: number
  makePerformance: { make: string; views: number; inquiries: number }[]
}

export function CarAnalyticsDashboard({ sellerId }: { sellerId?: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, sellerId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const url = sellerId 
        ? `/api/analytics/cars?range=${timeRange}&sellerId=${sellerId}`
        : `/api/analytics/cars?range=${timeRange}`
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch car analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div>No data available</div>

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Car listing views</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.totalInquiries.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">From potential buyers</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Car className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.totalListings.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Currently for sale</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Inquiries/Car</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.avgInquiriesPerCar.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Engagement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            {sellerId ? 'Your Top Performing Cars' : 'Top Performing Cars'}
          </CardTitle>
          <CardDescription>Cars with the highest views and inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCars.slice(0, 10).map((car, index) => (
              <div
                key={car.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                {car.image && (
                  <img src={car.image} alt={car.title} className="w-20 h-16 object-cover rounded-md" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{car.title}</h4>
                  <p className="text-sm text-gray-500">
                    {car.make} {car.model} ({car.year})
                  </p>
                  <p className="text-sm font-medium text-orange-600">R{car.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{car.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{car.inquiries.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Inquiries</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{car.conversionRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Conv. Rate</div>
                  </div>
                  {car.sponsoredViews !== undefined && (
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{car.sponsoredViews.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Sponsored Views</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Views by Make */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Make</CardTitle>
            <CardDescription>Views by car manufacturer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.makePerformance.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="make" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#ff6b35" name="Views" radius={[8, 8, 0, 0]} />
                <Bar dataKey="inquiries" fill="#4dabf7" name="Inquiries" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Top Cars by Engagement</CardTitle>
            <CardDescription>Views vs Inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.topCars.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#ff6b35" strokeWidth={2} name="Views" />
                <Line type="monotone" dataKey="inquiries" stroke="#4dabf7" strokeWidth={2} name="Inquiries" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
