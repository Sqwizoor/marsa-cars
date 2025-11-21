import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    })

    if (dbUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")

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
          items: {
            include: {
              product: true,
            },
          },
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
        const existing = productSales.get(item.productId) || { name: item.product.title, quantity: 0, revenue: 0 }
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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
