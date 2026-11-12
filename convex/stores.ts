import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import { storeStatusValidator } from "./schema";

async function findStoreByUrlCaseInsensitive(ctx: any, storeUrl: string) {
  let normalized = storeUrl.trim();
  try {
    normalized = decodeURIComponent(normalized).trim();
  } catch {
    // ignore
  }
  const exact = await ctx.db
    .query("stores")
    .withIndex("by_url", (q: any) => q.eq("url", normalized))
    .first();
  if (exact) return exact;

  const lower = normalized.toLowerCase();
  const all = await ctx.db.query("stores").collect();
  return all.find((s: any) => s.url.toLowerCase() === lower) || null;
}

// ==================== STORES ====================

export const upsertStore = mutation({
  args: {
    id: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    email: v.string(),
    phone: v.string(),
    url: v.string(),
    logo: v.string(),
    cover: v.string(),
    status: v.optional(storeStatusValidator),
    featured: v.optional(v.boolean()),
    returnPolicy: v.optional(v.string()),
    defaultShippingService: v.optional(v.string()),
    defaultShippingFeePerItem: v.optional(v.number()),
    defaultShippingFeeForAdditionalItem: v.optional(v.number()),
    defaultShippingFeePerKg: v.optional(v.number()),
    defaultShippingFeeFixed: v.optional(v.number()),
    defaultDeliveryTimeMin: v.optional(v.number()),
    defaultDeliveryTimeMax: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const targetId = args.id || generateUuid();
    const now = Date.now();

    const allStores = await ctx.db.query("stores").collect();
    const conflict = allStores.find(
      (s) =>
        s.prismaId !== targetId &&
        (s.name === args.name ||
          s.email === args.email ||
          s.phone === args.phone ||
          s.url === args.url)
    );

    if (conflict) {
      if (conflict.name === args.name)
        return { error: "A store with the same name already exists" };
      if (conflict.email === args.email)
        return { error: "A store with the same email already exists" };
      if (conflict.phone === args.phone)
        return { error: "A store with the same phone number already exists" };
      if (conflict.url === args.url)
        return { error: "A store with the same URL already exists" };
    }

    const existing = await findById(ctx, "stores", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        email: args.email,
        phone: args.phone,
        url: args.url,
        logo: args.logo,
        cover: args.cover,
        status: args.status ?? existing.status,
        featured: args.featured ?? existing.featured,
        returnPolicy: args.returnPolicy ?? existing.returnPolicy,
        defaultShippingService:
          args.defaultShippingService ?? existing.defaultShippingService,
        defaultShippingFeePerItem:
          args.defaultShippingFeePerItem ?? existing.defaultShippingFeePerItem,
        defaultShippingFeeForAdditionalItem:
          args.defaultShippingFeeForAdditionalItem ??
          existing.defaultShippingFeeForAdditionalItem,
        defaultShippingFeePerKg:
          args.defaultShippingFeePerKg ?? existing.defaultShippingFeePerKg,
        defaultShippingFeeFixed:
          args.defaultShippingFeeFixed ?? existing.defaultShippingFeeFixed,
        defaultDeliveryTimeMin:
          args.defaultDeliveryTimeMin ?? existing.defaultDeliveryTimeMin,
        defaultDeliveryTimeMax:
          args.defaultDeliveryTimeMax ?? existing.defaultDeliveryTimeMax,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return { store: toPrismaShape(updated) };
    }

    const newId = await ctx.db.insert("stores", {
      prismaId: targetId,
      name: args.name,
      description: args.description,
      email: args.email,
      phone: args.phone,
      url: args.url,
      logo: args.logo,
      cover: args.cover,
      status: args.status || "PENDING",
      averageRating: 0,
      numReviews: 0,
      featured: args.featured || false,
      returnPolicy: args.returnPolicy || "Return in 30 days.",
      defaultShippingService:
        args.defaultShippingService || "International Delivery",
      defaultShippingFeePerItem: args.defaultShippingFeePerItem ?? 0,
      defaultShippingFeeForAdditionalItem:
        args.defaultShippingFeeForAdditionalItem ?? 0,
      defaultShippingFeePerKg: args.defaultShippingFeePerKg ?? 0,
      defaultShippingFeeFixed: args.defaultShippingFeeFixed ?? 0,
      defaultDeliveryTimeMin: args.defaultDeliveryTimeMin ?? 7,
      defaultDeliveryTimeMax: args.defaultDeliveryTimeMax ?? 31,
      userId: args.userId,
      memberIds: [],
      followerIds: [],
      createdAt: now,
      updatedAt: now,
    });

    const created = await ctx.db.get(newId);
    return { store: toPrismaShape(created) };
  },
});

export const getStoreDefaultShippingDetails = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store not found.");

    return {
      defaultShippingService: store.defaultShippingService,
      defaultShippingFeePerItem: store.defaultShippingFeePerItem,
      defaultShippingFeeForAdditionalItem:
        store.defaultShippingFeeForAdditionalItem,
      defaultShippingFeePerKg: store.defaultShippingFeePerKg,
      defaultShippingFeeFixed: store.defaultShippingFeeFixed,
      defaultDeliveryTimeMin: store.defaultDeliveryTimeMin,
      defaultDeliveryTimeMax: store.defaultDeliveryTimeMax,
      returnPolicy: store.returnPolicy,
    };
  },
});

export const updateStoreDefaultShippingDetails = mutation({
  args: {
    storeUrl: v.string(),
    details: v.object({
      defaultShippingService: v.string(),
      defaultShippingFeePerItem: v.number(),
      defaultShippingFeeForAdditionalItem: v.number(),
      defaultShippingFeePerKg: v.number(),
      defaultShippingFeeFixed: v.number(),
      defaultDeliveryTimeMin: v.number(),
      defaultDeliveryTimeMax: v.number(),
      returnPolicy: v.string(),
    }),
  },
  handler: async (ctx, { storeUrl, details }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store not found.");

    await ctx.db.patch(store._id, {
      ...details,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(store._id);
    return toPrismaShape(updated);
  },
});

export const getStoreShippingRates = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store could not be found.");

    const countries = await ctx.db.query("countries").collect();
    countries.sort((a, b) => a.name.localeCompare(b.name));

    const shippingRates = await ctx.db
      .query("shippingRates")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    const rateMap = new Map();
    shippingRates.forEach((rate) => {
      rateMap.set(rate.countryId, toPrismaShape(rate));
    });

    return countries.map((country) => ({
      countryId: country.prismaId,
      countryName: country.name,
      shippingRate: rateMap.get(country.prismaId) || null,
    }));
  },
});

export const upsertShippingRate = mutation({
  args: {
    storeUrl: v.string(),
    shippingRate: v.object({
      id: v.optional(v.string()),
      shippingService: v.string(),
      shippingFeePerItem: v.number(),
      shippingFeeForAdditionalItem: v.number(),
      shippingFeePerKg: v.number(),
      shippingFeeFixed: v.number(),
      deliveryTimeMin: v.number(),
      deliveryTimeMax: v.number(),
      returnPolicy: v.string(),
      countryId: v.string(),
    }),
  },
  handler: async (ctx, { storeUrl, shippingRate }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Please provide a valid store URL.");

    const targetId = shippingRate.id || generateUuid();
    const now = Date.now();
    const existing = await findById(ctx, "shippingRates", targetId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...shippingRate,
        storeId: store.prismaId,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("shippingRates", {
      prismaId: targetId,
      shippingService: shippingRate.shippingService,
      shippingFeePerItem: shippingRate.shippingFeePerItem,
      shippingFeeForAdditionalItem: shippingRate.shippingFeeForAdditionalItem,
      shippingFeePerKg: shippingRate.shippingFeePerKg,
      shippingFeeFixed: shippingRate.shippingFeeFixed,
      deliveryTimeMin: shippingRate.deliveryTimeMin,
      deliveryTimeMax: shippingRate.deliveryTimeMax,
      returnPolicy: shippingRate.returnPolicy,
      countryId: shippingRate.countryId,
      storeId: store.prismaId,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const getStoreOrders = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store not found.");

    const groups = await ctx.db
      .query("orderGroups")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();
    groups.sort((a, b) => b.updatedAt - a.updatedAt);

    return await Promise.all(
      groups.map(async (group) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order_group_id", (q) =>
            q.eq("orderGroupId", group.prismaId)
          )
          .collect();
        const coupon = group.couponId
          ? await findById(ctx, "coupons", group.couponId)
          : null;
        const order = await findById(ctx, "orders", group.orderId);
        let shippingAddress: any = null;
        let paymentDetails: any = null;

        if (order) {
          const addr = await findById(
            ctx,
            "shippingAddresses",
            order.shippingAddressId
          );
          if (addr) {
            const country = await findById(ctx, "countries", addr.countryId);
            const addrUser = await findById(ctx, "users", addr.userId);
            shippingAddress = {
              ...toPrismaShape(addr)!,
              country: toPrismaShape(country),
              user: addrUser ? { email: addrUser.email } : { email: "" },
            };
          }
          const payment = await ctx.db
            .query("paymentDetails")
            .withIndex("by_order_id", (q) => q.eq("orderId", order.prismaId))
            .first();
          paymentDetails = toPrismaShape(payment);
        }

        return {
          ...toPrismaShape(group)!,
          items: items.map((i) => toPrismaShape(i)!),
          coupon: toPrismaShape(coupon),
          order: order
            ? {
                paymentStatus: order.paymentStatus,
                shippingAddress,
                paymentDetails,
              }
            : null,
        };
      })
    );
  },
});

export const applySeller = mutation({
  args: {
    userId: v.string(),
    store: v.any(),
  },
  handler: async (ctx, { userId, store }) => {
    const now = Date.now();
    const existingApp = await ctx.db
      .query("storeApplications")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingApp) {
      await ctx.db.patch(existingApp._id, {
        data: store,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("storeApplications", {
        prismaId: generateUuid(),
        userId,
        data: store,
        createdAt: now,
        updatedAt: now,
      });
    }

    const allStores = await ctx.db.query("stores").collect();
    const conflict = allStores.find(
      (s) =>
        s.name === store.name ||
        s.email === store.email ||
        s.phone === store.phone ||
        s.url === store.url
    );

    if (conflict) {
      if (conflict.name === store.name)
        throw new Error("A store with the same name already exists");
      if (conflict.email === store.email)
        throw new Error("A store with the same email already exists");
      if (conflict.phone === store.phone)
        throw new Error("A store with the same phone number already exists");
      if (conflict.url === store.url)
        throw new Error("A store with the same URL already exists");
    }

    return { id: "draft", status: "PENDING" };
  },
});

export const getAllStores = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    stores.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      stores.map(async (store) => {
        const user = await findById(ctx, "users", store.userId);
        return {
          ...toPrismaShape(store)!,
          user: toPrismaShape(user),
        };
      })
    );
  },
});

export const updateStoreStatus = mutation({
  args: {
    storeId: v.string(),
    status: storeStatusValidator,
  },
  handler: async (ctx, { storeId, status }) => {
    const store = await findById(ctx, "stores", storeId);
    if (!store) throw new Error("Store not found !");

    const now = Date.now();
    await ctx.db.patch(store._id, {
      status,
      updatedAt: now,
    });

    if (store.status === "PENDING" && status === "ACTIVE") {
      const user = await findById(ctx, "users", store.userId);
      if (user) {
        await ctx.db.patch(user._id, {
          role: "SELLER",
          updatedAt: now,
        });
      }
    }

    return status;
  },
});

export const deleteStore = mutation({
  args: { storeId: v.string() },
  handler: async (ctx, { storeId }) => {
    const store = await findById(ctx, "stores", storeId);
    if (!store) throw new Error("Store not found.");

    const products = await ctx.db
      .query("products")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    for (const product of products) {
      const variants = await ctx.db
        .query("productVariants")
        .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
        .collect();

      for (const variant of variants) {
        const sizes = await ctx.db
          .query("sizes")
          .withIndex("by_variant_id", (q) =>
            q.eq("productVariantId", variant.prismaId)
          )
          .collect();
        for (const s of sizes) await ctx.db.delete(s._id);

        const images = await ctx.db
          .query("productVariantImages")
          .withIndex("by_variant_id", (q) =>
            q.eq("productVariantId", variant.prismaId)
          )
          .collect();
        for (const img of images) await ctx.db.delete(img._id);

        const colors = await ctx.db
          .query("colors")
          .withIndex("by_variant_id", (q) =>
            q.eq("productVariantId", variant.prismaId)
          )
          .collect();
        for (const c of colors) await ctx.db.delete(c._id);

        const vSpecs = await ctx.db
          .query("specs")
          .withIndex("by_variant_id", (q) =>
            q.eq("variantId", variant.prismaId)
          )
          .collect();
        for (const sp of vSpecs) await ctx.db.delete(sp._id);

        await ctx.db.delete(variant._id);
      }

      const questions = await ctx.db
        .query("questions")
        .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
        .collect();
      for (const q of questions) await ctx.db.delete(q._id);

      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
        .collect();
      for (const r of reviews) await ctx.db.delete(r._id);

      const pSpecs = await ctx.db
        .query("specs")
        .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
        .collect();
      for (const sp of pSpecs) await ctx.db.delete(sp._id);

      await ctx.db.delete(product._id);
    }

    const shape = toPrismaShape(store);
    await ctx.db.delete(store._id);
    return shape;
  },
});

export const getStorePageDetails = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store || store.status !== "ACTIVE") {
      throw new Error(`Store with URL "${storeUrl}" not found.`);
    }
    return {
      id: store.prismaId,
      name: store.name,
      description: store.description,
      logo: store.logo,
      cover: store.cover,
      averageRating: store.averageRating,
      numReviews: store.numReviews,
    };
  },
});

export const getStoreDashboardStats = query({
  args: { storeUrl: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { storeUrl, days = 30 }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store not found.");

    const orderGroups = await ctx.db
      .query("orderGroups")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    const products = await ctx.db
      .query("products")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    let totalRevenue = 0;
    const now = Date.now();
    const daysAgo = now - days * 24 * 60 * 60 * 1000;
    const prevStart = now - days * 2 * 24 * 60 * 60 * 1000;
    let prevRevenue = 0;

    const graphDataMap = new Map<string, { total: number; orders: number }>();
    const statusCounts: Record<string, number> = {};

    for (const group of orderGroups) {
      statusCounts[group.status] = (statusCounts[group.status] || 0) + 1;
      const order = await findById(ctx, "orders", group.orderId);
      const isPaid = order?.paymentStatus === "Paid";

      if (isPaid) {
        totalRevenue += group.total;
        if (group.createdAt >= daysAgo) {
          const dateStr = new Date(group.createdAt).toISOString().split("T")[0];
          const cur = graphDataMap.get(dateStr) || { total: 0, orders: 0 };
          graphDataMap.set(dateStr, {
            total: cur.total + group.total,
            orders: cur.orders + 1,
          });
        } else if (group.createdAt >= prevStart && group.createdAt < daysAgo) {
          prevRevenue += group.total;
        }
      }
    }

    const sortedGroups = [...orderGroups]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    const recentOrders = await Promise.all(
      sortedGroups.map(async (g) => {
        const order = await findById(ctx, "orders", g.orderId);
        const user = order ? await findById(ctx, "users", order.userId) : null;
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order_group_id", (q) => q.eq("orderGroupId", g.prismaId))
          .collect();
        return {
          ...toPrismaShape(g)!,
          items: items.map((i) => toPrismaShape(i)!),
          order: {
            paymentStatus: order?.paymentStatus || "Pending",
            user: user
              ? { name: user.name, email: user.email, picture: user.picture }
              : { name: "Customer", email: "", picture: "" },
          },
        };
      })
    );

    const graphData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const data = graphDataMap.get(dateStr) || { total: 0, orders: 0 };
      graphData.push({
        date: dateStr,
        total: data.total,
        orders: data.orders,
      });
    }

    const totalOrders = orderGroups.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      recentOrders,
      graphData,
      avgOrderValue,
      ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      revenueGrowth,
    };
  },
});

// ==================== STORE MEMBERS ====================

export const getStoreMembers = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) throw new Error("Store not found.");

    const memberIds = store.memberIds || [];
    const members = await Promise.all(
      memberIds.map(async (id: string) => {
        const u = await findById(ctx, "users", id);
        return toPrismaShape(u);
      })
    );
    return members.filter(Boolean);
  },
});

export const addStoreMember = mutation({
  args: {
    storeUrl: v.string(),
    email: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { storeUrl, email, ownerId }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) return { error: "Store not found." };
    if (store.userId !== ownerId) {
      return { error: "Only the store owner can add members." };
    }

    const memberUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!memberUser) {
      return {
        error:
          "User with this email not found. Please ask them to sign up first.",
      };
    }

    if (memberUser.prismaId === ownerId) {
      return { error: "You are already the owner of this store." };
    }

    const memberIds = store.memberIds || [];
    if (memberIds.includes(memberUser.prismaId)) {
      return { error: "User is already a member of this store." };
    }

    const now = Date.now();
    if (memberUser.role === "USER") {
      await ctx.db.patch(memberUser._id, {
        role: "SELLER",
        updatedAt: now,
      });
    }

    await ctx.db.patch(store._id, {
      memberIds: [...memberIds, memberUser.prismaId],
      updatedAt: now,
    });

    return {
      success: true,
      message: "Member added successfully.",
      memberId: memberUser.prismaId,
    };
  },
});

export const removeStoreMember = mutation({
  args: {
    storeUrl: v.string(),
    memberId: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, { storeUrl, memberId, ownerId }) => {
    const store = await findStoreByUrlCaseInsensitive(ctx, storeUrl);
    if (!store) return { error: "Store not found." };
    if (store.userId !== ownerId) {
      return { error: "Only the store owner can remove members." };
    }

    const memberIds = (store.memberIds || []).filter((id: string) => id !== memberId);
    await ctx.db.patch(store._id, {
      memberIds,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Member removed successfully." };
  },
});
