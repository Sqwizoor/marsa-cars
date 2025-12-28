"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get admin dashboard statistics
 * @returns Dashboard statistics including users, orders, revenue, products, stores
 */
export const getAdminDashboardStats = async () => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Get current date ranges
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Parallel queries for efficiency
  const [
    totalUsers,
    newUsersToday,
    newUsersThisMonth,
    newUsersLastMonth,
    totalOrders,
    ordersToday,
    ordersThisMonth,
    ordersLastMonth,
    totalRevenue,
    revenueToday,
    revenueThisMonth,
    revenueLastMonth,
    totalProducts,
    productsThisMonth,
    totalStores,
    storesThisMonth,
    pendingOrders,
    completedOrders,
  ] = await Promise.all([
    // Users
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: startOfToday } } }),
    db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),

    // Orders
    db.order.count({ where: { paymentStatus: "Paid" } }),
    db.order.count({
      where: { paymentStatus: "Paid", createdAt: { gte: startOfToday } },
    }),
    db.order.count({
      where: { paymentStatus: "Paid", createdAt: { gte: startOfMonth } },
    }),
    db.order.count({
      where: {
        paymentStatus: "Paid",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),

    // Revenue
    db.order.aggregate({
      where: { paymentStatus: "Paid" },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { paymentStatus: "Paid", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { paymentStatus: "Paid", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: {
        paymentStatus: "Paid",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    }),

    // Products
    db.product.count(),
    db.product.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Stores
    db.store.count(),
    db.store.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Order statuses
    db.orderGroup.count({
      where: { status: { in: ["Pending", "Processing"] } },
    }),
    db.orderGroup.count({ where: { status: "Delivered" } }),
  ]);

  // Calculate growth percentages
  const userGrowth =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 0;

  const orderGrowth =
    ordersLastMonth > 0
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
      : 0;

  const revenueGrowth =
    (revenueLastMonth._sum?.total || 0) > 0
      ? (((revenueThisMonth._sum?.total || 0) -
          (revenueLastMonth._sum?.total || 0)) /
          (revenueLastMonth._sum?.total || 0)) *
        100
      : 0;

  return {
    users: {
      total: totalUsers,
      today: newUsersToday,
      thisMonth: newUsersThisMonth,
      growth: Math.round(userGrowth * 10) / 10,
    },
    orders: {
      total: totalOrders,
      today: ordersToday,
      thisMonth: ordersThisMonth,
      pending: pendingOrders,
      completed: completedOrders,
      growth: Math.round(orderGrowth * 10) / 10,
    },
    revenue: {
      total: totalRevenue._sum?.total || 0,
      today: revenueToday._sum?.total || 0,
      thisMonth: revenueThisMonth._sum?.total || 0,
      growth: Math.round(revenueGrowth * 10) / 10,
    },
    products: {
      total: totalProducts,
      thisMonth: productsThisMonth,
    },
    stores: {
      total: totalStores,
      thisMonth: storesThisMonth,
    },
  };
};

/**
 * Get revenue data for the last 30 days for chart
 */
export const getRevenueChartData = async () => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await db.order.findMany({
    where: {
      paymentStatus: "Paid",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date
  const revenueByDate = new Map<string, number>();

  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const current = revenueByDate.get(dateKey) || 0;
    revenueByDate.set(dateKey, current + order.total);
  });

  // Convert to array format for chart
  const chartData = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  return chartData;
};

/**
 * Get orders data for the last 30 days for chart
 */
export const getOrdersChartData = async () => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await db.order.findMany({
    where: {
      paymentStatus: "Paid",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date
  const ordersByDate = new Map<string, number>();

  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const current = ordersByDate.get(dateKey) || 0;
    ordersByDate.set(dateKey, current + 1);
  });

  // Convert to array format for chart
  const chartData = Array.from(ordersByDate.entries()).map(([date, orders]) => ({
    date,
    orders,
  }));

  return chartData;
};

/**
 * Get top selling products
 */
export const getTopProducts = async (limit: number = 5) => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const topProducts = await db.product.findMany({
    take: limit,
    orderBy: {
      sales: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sales: true,
      rating: true,
    },
  });

  return topProducts;
};

/**
 * Get top stores by revenue
 */
export const getTopStores = async (limit: number = 5) => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Get stores with their order groups to calculate earnings
  const stores = await db.store.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      orderGroups: {
        select: {
          total: true,
        },
      },
      _count: {
        select: {
          products: true,
          followers: true,
        },
      },
    },
  });

  // Calculate total earnings for each store
  const storesWithEarnings = stores.map((store) => ({
    id: store.id,
    name: store.name,
    url: store.url,
    totalEarnings: store.orderGroups.reduce((sum, group) => sum + group.total, 0),
    _count: store._count,
  }));

  // Sort by earnings and take top N
  const topStores = storesWithEarnings
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, limit);

  return topStores;
};
/**
 * Get all orders for admin view
 * @returns All orders with user, store, and item details
 */
export const getAllAdminOrders = async () => {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const orders = await db.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      groups: {
        include: {
          store: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
      shippingAddress: {
        include: {
          country: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};