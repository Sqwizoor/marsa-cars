import { query } from "./_generated/server";
import { v } from "convex/values";
import { findById, toPrismaShape } from "./_helpers";

// ==================== ADMIN DASHBOARD & ORDERS ====================

export const getAdminDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).getTime();
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    ).getTime();

    const [users, orders, products, stores, orderGroups] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("stores").collect(),
      ctx.db.query("orderGroups").collect(),
    ]);

    const totalUsers = users.length;
    const newUsersToday = users.filter(
      (u) => u.createdAt >= startOfToday
    ).length;
    const newUsersThisMonth = users.filter(
      (u) => u.createdAt >= startOfMonth
    ).length;
    const newUsersLastMonth = users.filter(
      (u) => u.createdAt >= startOfLastMonth && u.createdAt <= endOfLastMonth
    ).length;

    const paidOrders = orders.filter((o) => o.paymentStatus === "Paid");
    const totalOrders = paidOrders.length;
    const ordersToday = paidOrders.filter(
      (o) => o.createdAt >= startOfToday
    ).length;
    const ordersThisMonth = paidOrders.filter(
      (o) => o.createdAt >= startOfMonth
    ).length;
    const ordersLastMonth = paidOrders.filter(
      (o) => o.createdAt >= startOfLastMonth && o.createdAt <= endOfLastMonth
    ).length;

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueToday = paidOrders
      .filter((o) => o.createdAt >= startOfToday)
      .reduce((sum, o) => sum + o.total, 0);
    const revenueThisMonth = paidOrders
      .filter((o) => o.createdAt >= startOfMonth)
      .reduce((sum, o) => sum + o.total, 0);
    const revenueLastMonth = paidOrders
      .filter(
        (o) => o.createdAt >= startOfLastMonth && o.createdAt <= endOfLastMonth
      )
      .reduce((sum, o) => sum + o.total, 0);

    const totalProducts = products.length;
    const productsThisMonth = products.filter(
      (p) => p.createdAt >= startOfMonth
    ).length;

    const totalStores = stores.length;
    const storesThisMonth = stores.filter(
      (s) => s.createdAt >= startOfMonth
    ).length;

    const pendingOrders = orderGroups.filter(
      (g) => g.status === "Pending" || g.status === "Processing"
    ).length;
    const completedOrders = orderGroups.filter(
      (g) => g.status === "Delivered"
    ).length;

    const userGrowth =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 0;
    const orderGrowth =
      ordersLastMonth > 0
        ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
        : 0;
    const revenueGrowth =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
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
        total: totalRevenue,
        today: revenueToday,
        thisMonth: revenueThisMonth,
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
  },
});

export const getRevenueChartData = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status", (q) => q.eq("paymentStatus", "Paid"))
      .collect();

    const recent = orders
      .filter((o) => o.createdAt >= thirtyDaysAgo)
      .sort((a, b) => a.createdAt - b.createdAt);

    const revenueByDate = new Map<string, number>();
    for (const order of recent) {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      revenueByDate.set(
        dateKey,
        (revenueByDate.get(dateKey) || 0) + order.total
      );
    }

    return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));
  },
});

export const getOrdersChartData = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_payment_status", (q) => q.eq("paymentStatus", "Paid"))
      .collect();

    const recent = orders
      .filter((o) => o.createdAt >= thirtyDaysAgo)
      .sort((a, b) => a.createdAt - b.createdAt);

    const ordersByDate = new Map<string, number>();
    for (const order of recent) {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + 1);
    }

    return Array.from(ordersByDate.entries()).map(([date, ordersCount]) => ({
      date,
      orders: ordersCount,
    }));
  },
});

export const getTopProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const products = await ctx.db.query("products").collect();
    products.sort((a, b) => b.sales - a.sales);
    return products.slice(0, limit).map((p) => ({
      id: p.prismaId,
      name: p.name,
      slug: p.slug,
      sales: p.sales,
      rating: p.rating,
    }));
  },
});

export const getTopStores = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const stores = await ctx.db.query("stores").collect();
    const withEarnings = await Promise.all(
      stores.map(async (store) => {
        const orderGroups = await ctx.db
          .query("orderGroups")
          .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
          .collect();
        const products = await ctx.db
          .query("products")
          .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
          .collect();
        const totalEarnings = orderGroups.reduce((sum, g) => sum + g.total, 0);
        return {
          id: store.prismaId,
          name: store.name,
          url: store.url,
          totalEarnings,
          _count: {
            products: products.length,
            followers: (store.followerIds || []).length,
          },
        };
      })
    );

    return withEarnings
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);
  },
});

async function enrichAdminOrder(ctx: any, order: any) {
  const user = await findById(ctx, "users", order.userId);
  const groupsRaw = await ctx.db
    .query("orderGroups")
    .withIndex("by_order_id", (q: any) => q.eq("orderId", order.prismaId))
    .collect();

  const groups = await Promise.all(
    groupsRaw.map(async (g: any) => {
      const store = await findById(ctx, "stores", g.storeId);
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order_group_id", (q: any) =>
          q.eq("orderGroupId", g.prismaId)
        )
        .collect();
      return {
        ...toPrismaShape(g)!,
        store: store
          ? { id: store.prismaId, name: store.name, url: store.url }
          : null,
        _count: { items: items.length },
      };
    })
  );

  const addr = await findById(
    ctx,
    "shippingAddresses",
    order.shippingAddressId
  );
  const country = addr
    ? await findById(ctx, "countries", addr.countryId)
    : null;

  return {
    ...toPrismaShape(order)!,
    user: user
      ? { id: user.prismaId, name: user.name, email: user.email }
      : { id: order.userId, name: "Customer", email: "" },
    groups,
    shippingAddress: addr
      ? {
          ...toPrismaShape(addr)!,
          country: country ? { name: country.name } : { name: "Unknown" },
        }
      : null,
  };
}

export const getAllAdminOrders = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    orders.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(orders.map((o) => enrichAdminOrder(ctx, o)));
  },
});

export const getAdminOrders = query({
  args: {
    status: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { status, page = 1, pageSize = 10, search = "" }
  ) => {
    let orders = await ctx.db.query("orders").collect();
    if (status) {
      orders = orders.filter((o) => o.paymentStatus === status);
    }

    orders.sort((a, b) => b.createdAt - a.createdAt);
    const enriched = await Promise.all(
      orders.map((o) => enrichAdminOrder(ctx, o))
    );

    const filtered = search.trim()
      ? enriched.filter((o) => {
          const s = search.toLowerCase();
          return (
            o.id.toLowerCase().includes(s) ||
            o.user.name.toLowerCase().includes(s) ||
            o.user.email.toLowerCase().includes(s)
          );
        })
      : enriched;

    const total = filtered.length;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      orders: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
});
