import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== COUPONS ====================

export const upsertCoupon = mutation({
  args: {
    storeUrl: v.string(),
    coupon: v.object({
      id: v.optional(v.string()),
      code: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      discount: v.number(),
    }),
  },
  handler: async (ctx, { storeUrl, coupon }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_url", (q) => q.eq("url", storeUrl))
      .first();
    if (!store) throw new Error("Store not found.");

    const targetId = coupon.id || generateUuid();
    const now = Date.now();

    const byCode = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", coupon.code))
      .first();

    if (
      byCode &&
      byCode.storeId === store.prismaId &&
      byCode.prismaId !== targetId
    ) {
      throw new Error(
        "A coupon with the same code already exists for this store."
      );
    }

    const existing = await findById(ctx, "coupons", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        code: coupon.code,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        discount: coupon.discount,
        storeId: store.prismaId,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("coupons", {
      prismaId: targetId,
      code: coupon.code,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      discount: coupon.discount,
      storeId: store.prismaId,
      userIds: [],
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const getStoreCoupons = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_url", (q) => q.eq("url", storeUrl))
      .first();
    if (!store) throw new Error("Store not found.");

    const coupons = await ctx.db
      .query("coupons")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    return coupons.map((c) => toPrismaShape(c)!);
  },
});

export const getCoupon = query({
  args: { couponId: v.string() },
  handler: async (ctx, { couponId }) => {
    const coupon = await findById(ctx, "coupons", couponId);
    return toPrismaShape(coupon);
  },
});

export const deleteCoupon = mutation({
  args: { couponId: v.string(), storeUrl: v.optional(v.string()) },
  handler: async (ctx, { couponId }) => {
    const coupon = await findById(ctx, "coupons", couponId);
    if (!coupon) throw new Error("Coupon not found.");
    const shape = toPrismaShape(coupon);
    await ctx.db.delete(coupon._id);
    return shape;
  },
});

export const applyCoupon = mutation({
  args: { couponCode: v.string(), cartId: v.string() },
  handler: async (ctx, { couponCode, cartId }) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", couponCode))
      .first();
    if (!coupon) throw new Error("Invalid coupon code.");

    const currentDate = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    if (currentDate < startDate || currentDate > endDate) {
      throw new Error("Coupon is expired or not yet active.");
    }

    const cart = await findById(ctx, "carts", cartId);
    if (!cart) throw new Error("Cart not found.");
    if (cart.couponId) {
      throw new Error("A coupon is already applied to this cart.");
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_id", (q) => q.eq("cartId", cart.prismaId))
      .collect();

    const storeItems = cartItems.filter((i) => i.storeId === coupon.storeId);
    if (storeItems.length === 0) {
      throw new Error(
        "No items in the cart belong to the store associated with this coupon."
      );
    }

    const storeSubTotal = storeItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const storeShippingTotal = storeItems.reduce(
      (acc, item) => acc + item.shippingFee,
      0
    );
    const storeTotal = storeSubTotal + storeShippingTotal;
    const discountedAmount = (storeTotal * coupon.discount) / 100;
    const newTotal = cart.total - discountedAmount;

    await ctx.db.patch(cart._id, {
      couponId: coupon.prismaId,
      total: newTotal,
      updatedAt: Date.now(),
    });

    const store = await findById(ctx, "stores", coupon.storeId);
    const updatedCart = await ctx.db.get(cart._id);

    return {
      message: `Coupon applied successfully. Discount: -$${discountedAmount.toFixed(2)} applied to items from ${store?.name || "store"}.`,
      cart: {
        ...toPrismaShape(updatedCart)!,
        cartItems: cartItems.map((i) => toPrismaShape(i)!),
        coupon: {
          ...toPrismaShape(coupon)!,
          store: toPrismaShape(store),
        },
      },
    };
  },
});

export const getAllCoupons = query({
  args: {},
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();
    coupons.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      coupons.map(async (c) => {
        const store = await findById(ctx, "stores", c.storeId);
        const orderGroups = await ctx.db
          .query("orderGroups")
          .filter((q) => q.eq(q.field("couponId"), c.prismaId))
          .collect();
        return {
          ...toPrismaShape(c)!,
          store: store
            ? { id: store.prismaId, name: store.name, url: store.url }
            : null,
          _count: {
            orders: orderGroups.length,
            users: (c.userIds || []).length,
          },
        };
      })
    );
  },
});

export const adminDeleteCoupon = mutation({
  args: { couponId: v.string() },
  handler: async (ctx, { couponId }) => {
    const coupon = await findById(ctx, "coupons", couponId);
    if (!coupon) throw new Error("Coupon not found");
    const shape = toPrismaShape(coupon);
    await ctx.db.delete(coupon._id);
    return shape;
  },
});
