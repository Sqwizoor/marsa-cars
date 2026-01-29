"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Users, Store, BarChart3, Car } from "lucide-react"
import { DateRangeSelector, DateRange } from "@/components/dashboard/analytics/date-range-selector"
import { RevenueLineChart } from "@/components/dashboard/analytics/revenue-line-chart"
import { OrdersBarChart } from "@/components/dashboard/analytics/orders-bar-chart"
import { OrderStatusPieChart } from "@/components/dashboard/analytics/order-status-pie-chart"
import { TopProductsChart } from "@/components/dashboard/analytics/top-products-chart"
import RevenueChart from "@/components/dashboard/admin/revenue-chart"
import { ProductAnalyticsDashboard } from "@/components/analytics/ProductAnalyticsDashboard"
import { CarAnalyticsDashboard } from "@/components/analytics/CarAnalyticsDashboard"
import { formatCurrencyZAR } from "@/lib/utils"

interface AdminAnalyticsClientProps {
  initialData: any
}

const getDaysFromRange = (range: DateRange): number => {
  switch (range) {
    case "7d": return 7
    case "30d": return 30
    case "90d": return 90
    case "6m": return 180
    case "1y": return 365
    case "all": return 999999
    default: return 30
  }
}

export default function AdminAnalyticsClient({ initialData }: AdminAnalyticsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = React.useState<DateRange>((searchParams.get("range") as DateRange) || "30d")
  const [data, setData] = React.useState(initialData)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const days = getDaysFromRange(dateRange)
        const response = await fetch(`/api/analytics/admin?days=${days}`)
        const newData = await response.json()
        setData(newData)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    router.push(`?range=${dateRange}`, { scroll: false })
  }, [dateRange, router])

  const revenueGrowthPercent = data.revenueGrowth || 0
  const isPositiveGrowth = revenueGrowthPercent >= 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {loading && (
        <div className="text-center text-muted-foreground">Loading analytics...</div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Insights
          </TabsTrigger>
          <TabsTrigger value="cars" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Car Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrencyZAR(data.totalRevenue || 0)}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {isPositiveGrowth ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={isPositiveGrowth ? "text-green-500" : "text-red-500"}>
                    {Math.abs(revenueGrowthPercent).toFixed(1)}%
                  </span>
                  <span>vs previous period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Platform-wide orders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrencyZAR(data.avgOrderValue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per order
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalStores || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seller stores
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Products listed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts - Row 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart data={data.graphData || []} />
            <RevenueLineChart data={data.graphData || []} />
          </div>

          {/* Charts - Row 2 */}
          <div className="grid gap-4 md:grid-cols-2">
            <OrdersBarChart data={data.graphData || []} />
            {data.ordersByStatus && data.ordersByStatus.length > 0 && (
              <OrderStatusPieChart data={data.ordersByStatus} />
            )}
          </div>

          {/* Charts - Row 3 */}
          {data.topProducts && data.topProducts.length > 0 && (
            <TopProductsChart data={data.topProducts} />
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <CarAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
