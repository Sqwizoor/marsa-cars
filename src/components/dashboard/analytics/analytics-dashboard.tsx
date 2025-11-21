"use client"

import { RevenueChart } from "./revenue-chart"
import { OrdersBarChart } from "./orders-bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { formatCurrencyZAR } from "@/lib/utils"

interface AnalyticsDashboardProps {
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    graphData: {
      date: string
      total: number
      orders: number
    }[]
  }
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  // Calculate average order value
  const averageOrderValue = stats.totalOrders > 0 
    ? stats.totalRevenue / stats.totalOrders 
    : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyZAR(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total orders received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyZAR(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Average per order
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart data={stats.graphData} />
        </div>
        <div className="col-span-3">
          <OrdersBarChart data={stats.graphData} />
        </div>
      </div>
    </div>
  )
}
