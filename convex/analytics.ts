import { query } from "./_generated/server";
import { v } from "convex/values";
import { findById } from "./_helpers";

// ==================== STORE ANALYTICS ====================

export const getStoreAnalytics = query({
  args: {
    storeUrl: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, { storeUrl, days = 30 }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_url", (q) => q.eq("url", storeUrl))
      .first();
    if (!store) throw new Error("Store not found");

    const daysAgo = Date.now() - days * 24 * 60 * 60 * 1000;
    const allGroups = await ctx.db
      .query("orderGroups")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    const groups = allGroups.filter((g) => g.createdAt >= daysAgo);

    const revenueMap = new Map<string, number>();
    const ordersMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    const productStatsMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    const categorySalesMap = new Map<string, number>();

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItems = 0;

    for (const group of groups) {
      const dateStr = new Date(group.createdAt).toISOString().split("T")[0];
      const order = await findById(ctx, "orders", group.orderId);
      const isPaid = order?.paymentStatus === "Paid";

      if (isPaid) {
        revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + group.total);
        totalRevenue += group.total;
      }

      ordersMap.set(dateStr, (ordersMap.get(dateStr) || 0) + 1);
      totalOrders++;
      statusMap.set(group.status, (statusMap.get(group.status) || 0) + 1);

      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order_group_id", (q) =>
          q.eq("orderGroupId", group.prismaId)
        )
        .collect();

      totalItems += items.length;
      for (const item of items) {
        const existingProd = productStatsMap.get(item.productId) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        existingProd.quantity += item.quantity;
        existingProd.revenue += item.totalPrice;
        productStatsMap.set(item.productId, existingProd);

        const product = await findById(ctx, "products", item.productId);
        const category = product
          ? await findById(ctx, "categories", product.categoryId)
          : null;
        const catName = category?.name || "Uncategorized";
        categorySalesMap.set(
          catName,
          (categorySalesMap.get(catName) || 0) + item.totalPrice
        );
      }
    }

    const graphData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      graphData.push({
        date: dateStr,
        revenue: revenueMap.get(dateStr) || 0,
        orders: ordersMap.get(dateStr) || 0,
      });
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const ordersByStatus = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count })
    );
    const topProducts = Array.from(productStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const salesByCategory = Array.from(categorySalesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      graphData,
      totalRevenue,
      totalOrders,
      totalItems,
      avgOrderValue,
      ordersByStatus,
      topProducts,
      salesByCategory,
    };
  },
});
