'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { Eye, ShoppingCart, TrendingUp, TrendingDown, ShoppingBag, XCircle, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface AnalyticsData {
  totals: {
    views: number
    cartAdds: number
    purchases: number
    removals: number
  }
  rates: {
    viewToCart: number
    cartToPurchase: number
    cartAbandonment: number
  }
  dailyMetrics: Array<{
    date: string
    views: number
    carts: number
    purchases: number
  }>
  topProducts: Array<{
    id: string
    name: string
    views: number
  }>
}

interface Props {
  storeId: string
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

export function SellerAnalyticsDashboard({ storeId }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, storeId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/seller?storeId=${storeId}&range=${timeRange}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch seller analytics:', error)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = data.dailyMetrics.map(item => ({
    ...item,
    date: formatDate(item.date)
  }))

  // Funnel data for conversion
  const funnelData = [
    { name: 'Views', value: data.totals.views, color: '#3b82f6' },
    { name: 'Cart Adds', value: data.totals.cartAdds, color: '#f97316' },
    { name: 'Purchases', value: data.totals.purchases, color: '#10b981' },
  ]

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
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.totals.views.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total product impressions
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Additions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.totals.cartAdds.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.rates.viewToCart}% of views
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.totals.purchases.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.rates.cartToPurchase}% conversion
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Abandonment</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.rates.cartAbandonment}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.totals.cartAdds - data.totals.purchases} abandoned carts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rates */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">View → Cart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-orange-600">{data.rates.viewToCart}%</div>
              {data.rates.viewToCart >= 3 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.rates.viewToCart >= 3 ? 'Good conversion!' : 'Room for improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cart → Purchase Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-green-600">{data.rates.cartToPurchase}%</div>
              {data.rates.cartToPurchase >= 50 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.rates.cartToPurchase >= 50 ? 'Excellent!' : 'Focus on checkout'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-blue-600">
                {data.totals.views > 0 ? ((data.totals.purchases / data.totals.views) * 100).toFixed(1) : 0}%
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Views to purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Traffic Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Customer journey from view to purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <CardDescription>Views, cart adds, and purchases over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Views"
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="carts" 
                  stroke="#f97316" 
                  strokeWidth={2} 
                  name="Cart Adds"
                  dot={{ fill: '#f97316' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Purchases"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Your most viewed products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div className="text-lg font-bold text-blue-600">{product.views.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="text-purple-900">💡 Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {data.rates.viewToCart < 3 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <strong className="text-yellow-900">Improve product appeal:</strong>
                <span className="text-yellow-700"> Your view-to-cart rate is low. Consider better product images, clearer descriptions, and competitive pricing.</span>
              </div>
            )}
            {data.rates.cartAbandonment > 50 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <strong className="text-red-900">Reduce cart abandonment:</strong>
                <span className="text-red-700"> {data.rates.cartAbandonment}% of carts are abandoned. Simplify checkout, offer free shipping, or send cart reminder emails.</span>
              </div>
            )}
            {data.rates.cartToPurchase >= 50 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <strong className="text-green-900">Great conversion rate!</strong>
                <span className="text-green-700"> Your cart-to-purchase rate is excellent at {data.rates.cartToPurchase}%. Keep up the good work!</span>
              </div>
            )}
            {data.totals.views < 100 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <strong className="text-blue-900">Increase visibility:</strong>
                <span className="text-blue-700"> Focus on marketing to get more product views. Consider SEO, social media, or running promotions.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
