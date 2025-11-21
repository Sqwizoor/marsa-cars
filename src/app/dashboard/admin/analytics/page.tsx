import AdminAnalyticsClient from "./client"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  // Admin access is already checked in the layout
  const { range } = await searchParams
  
  const getDaysFromRange = (range?: string): number => {
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

  const days = getDaysFromRange(range)

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch analytics data
  const [orderGroups, products, stores, users] = await Promise.all([
    db.orderGroup.findMany({
      where: {
        createdAt: {
          gte: days === 999999 ? undefined : startDate,
        },
      },
      include: {
        items: true,
        order: {
          select: {
            paymentStatus: true,
          },
        },
      },
    }),
    db.product.count(),
    db.store.count(),
    db.user.count(),
  ])

  // Calculate revenue by date
  const revenueByDate = new Map<string, number>()
  const ordersByDate = new Map<string, number>()
  let totalRevenue = 0
  let totalOrders = 0
  const ordersByStatus = new Map<string, number>()
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()

  orderGroups.forEach((orderGroup) => {
    const dateKey = orderGroup.createdAt.toISOString().split("T")[0]
    const orderRevenue = orderGroup.total

    // Revenue by date
    revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + orderRevenue)
    
    // Orders by date
    ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + 1)

    // Total revenue
    totalRevenue += orderRevenue
    totalOrders++

    // Orders by status
    ordersByStatus.set(orderGroup.status, (ordersByStatus.get(orderGroup.status) || 0) + 1)

    // Product sales
    orderGroup.items.forEach((item) => {
      const existing = productSales.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.totalPrice
      productSales.set(item.productId, existing)
    })
  })

  // Calculate previous period for growth
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - days)
  const previousOrderGroups = await db.orderGroup.findMany({
    where: {
      createdAt: {
        gte: previousStartDate,
        lt: startDate,
      },
    },
  })

  let previousRevenue = 0
  previousOrderGroups.forEach((orderGroup) => {
    previousRevenue += orderGroup.total
  })

  const revenueGrowth = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0

  // Format data
  const graphData = Array.from(revenueByDate.entries())
    .map(([date, revenue]) => ({
      date,
      revenue,
      orders: ordersByDate.get(date) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const ordersByStatusData = Array.from(ordersByStatus.entries()).map(([status, count]) => ({
    status,
    count,
  }))

  const topProducts = Array.from(productSales.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const initialData = {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalProducts: products,
    totalStores: stores,
    totalUsers: users,
    graphData,
    ordersByStatus: ordersByStatusData,
    topProducts,
    revenueGrowth,
  }

  return <AdminAnalyticsClient initialData={initialData} />
}

