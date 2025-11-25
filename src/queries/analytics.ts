"use server"

import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export async function getStoreAnalytics(storeUrl: string, days: number = 30) {
  try {
    const user = await currentUser()
    if (!user) throw new Error("Unauthenticated")

    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    })

    if (!store) throw new Error("Store not found")

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - days)

    // Get all orders in range with full details
    const orders = await db.orderGroup.findMany({
      where: {
        storeId: store.id,
        createdAt: { gte: daysAgo },
      },
      include: {
        order: {
          select: {
            paymentStatus: true,
            createdAt: true,
          },
        },
        items: true,
      },
    })

    // Aggregate revenue by date
    const revenueMap = new Map<string, number>()
    const ordersMap = new Map<string, number>()
    const customersMap = new Map<string, Set<string>>()
    
    let totalRevenue = 0
    let totalOrders = 0
    let totalItems = 0

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      const isPaid = order.order.paymentStatus === "Paid"
      
      if (isPaid) {
        revenueMap.set(date, (revenueMap.get(date) || 0) + order.total)
        totalRevenue += order.total
      }
      
      ordersMap.set(date, (ordersMap.get(date) || 0) + 1)
      totalOrders++
      
      totalItems += order.items.length
    })

    // Build graph data
    const graphData = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      
      graphData.push({
        date: dateStr,
        revenue: revenueMap.get(dateStr) || 0,
        orders: ordersMap.get(dateStr) || 0,
      })
    }

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get order status breakdown
    const ordersByStatus = await db.orderGroup.groupBy({
      by: ['status'],
      where: {
        storeId: store.id,
        createdAt: { gte: daysAgo },
      },
      _count: true,
    })

    // Get top products
    const topProducts = await db.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        orderGroup: {
          storeId: store.id,
          createdAt: { gte: daysAgo },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 5,
    })

    // Get sales by category
    // Since we can't easily group by relation in Prisma, we fetch items and aggregate manually
    const itemsWithCategory = await db.orderItem.findMany({
      where: {
        orderGroup: {
          storeId: store.id,
          createdAt: { gte: daysAgo },
        },
      },
      select: {
        totalPrice: true,
        product: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const categoryMap = new Map<string, number>()
    itemsWithCategory.forEach(item => {
      const categoryName = item.product?.category?.name || "Uncategorized"
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + item.totalPrice)
    })

    const salesByCategory = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      graphData,
      totalRevenue,
      totalOrders,
      totalItems,
      avgOrderValue,
      ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count })),
      topProducts: topProducts.map(p => ({
        name: p.name,
        quantity: p._sum.quantity || 0,
        revenue: p._sum.totalPrice || 0,
      })),
      salesByCategory,
    }
  } catch (error) {
    console.error("Error fetching store analytics:", error)
    throw error
  }
}
