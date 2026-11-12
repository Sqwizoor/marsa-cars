import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import { orderStatusValidator, productStatusValidator } from "./schema";

// ==================== ORDERS ====================

export const getOrder = query({
  args: { orderId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { orderId, userId }) => {
    const order = await findById(ctx, "orders", orderId);
    if (!order) return null;
    if (userId && order.userId !== userId) return null;

    const groupsRaw = await ctx.db
      .query("orderGroups")
      .withIndex("by_order_id", (q) => q.eq("orderId", order.prismaId))
      .collect();
    groupsRaw.sort((a, b) => b.total - a.total);

    const groups = await Promise.all(
      groupsRaw.map(async (group) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order_group_id", (q) =>
            q.eq("orderGroupId", group.prismaId)
          )
          .collect();
        const store = await findById(ctx, "stores", group.storeId);
        const coupon = group.couponId
          ? await findById(ctx, "coupons", group.couponId)
          : null;
        return {
          ...toPrismaShape(group)!,
          items: items.map((i) => toPrismaShape(i)!),
          store: toPrismaShape(store),
          coupon: toPrismaShape(coupon),
          _count: { items: items.length },
        };
      })
    );

    const shippingAddress = await findById(
      ctx,
      "shippingAddresses",
      order.shippingAddressId
    );
    const country = shippingAddress
      ? await findById(ctx, "countries", shippingAddress.countryId)
      : null;
    const addrUser = shippingAddress
      ? await findById(ctx, "users", shippingAddress.userId)
      : null;

    const paymentDetails = await ctx.db
      .query("paymentDetails")
      .withIndex("by_order_id", (q) => q.eq("orderId", order.prismaId))
      .first();

    return {
      ...toPrismaShape(order)!,
      groups,
      shippingAddress: shippingAddress
        ? {
            ...toPrismaShape(shippingAddress)!,
            country: toPrismaShape(country),
            user: toPrismaShape(addrUser),
          }
        : null,
      paymentDetails: toPrismaShape(paymentDetails),
    };
  },
});

export const placeOrder = mutation({
  args: {
    userId: v.string(),
    shippingAddressId: v.string(),
    cartId: v.string(),
    shippingFeeOverride: v.optional(v.number()),
    shippingServiceOverride: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      userId,
      shippingAddressId,
      cartId,
      shippingFeeOverride,
      shippingServiceOverride,
    }
  ) => {
    const cart = await findById(ctx, "carts", cartId);
    if (!cart) throw new Error("Cart not found.");

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_id", (q) => q.eq("cartId", cart.prismaId))
      .collect();

    if (cartItems.length === 0) throw new Error("Cart is empty.");

    const now = Date.now();
    const orderPrismaId = generateUuid();

    // Group items by storeId
    const byStore = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const list = byStore.get(item.storeId) || [];
      list.push(item);
      byStore.set(item.storeId, list);
    }

    let orderSubTotal = 0;
    let orderShippingFees = 0;

    for (const [storeId, items] of byStore.entries()) {
      const store = await findById(ctx, "stores", storeId);
      const groupSubTotal = items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const groupShipping =
        shippingFeeOverride !== undefined
          ? shippingFeeOverride / byStore.size
          : items.reduce((sum, i) => sum + i.shippingFee, 0);
      const groupTotal = groupSubTotal + groupShipping;

      orderSubTotal += groupSubTotal;
      orderShippingFees += groupShipping;

      const groupPrismaId = generateUuid();
      await ctx.db.insert("orderGroups", {
        prismaId: groupPrismaId,
        status: "Pending",
        shippingService:
          shippingServiceOverride ||
          store?.defaultShippingService ||
          "Standard Delivery",
        shippingDeliveryMin: store?.defaultDeliveryTimeMin ?? 7,
        shippingDeliveryMax: store?.defaultDeliveryTimeMax ?? 14,
        shippingFees: groupShipping,
        subTotal: groupSubTotal,
        total: groupTotal,
        orderId: orderPrismaId,
        storeId,
        couponId: cart.couponId,
        createdAt: now,
        updatedAt: now,
      });

      for (const item of items) {
        await ctx.db.insert("orderItems", {
          prismaId: generateUuid(),
          orderGroupId: groupPrismaId,
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          productSlug: item.productSlug,
          variantSlug: item.variantSlug,
          sku: item.sku,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          shippingFee: item.shippingFee,
          price: item.price,
          totalPrice: item.totalPrice,
          status: "Pending",
          storeId: item.storeId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const total = orderSubTotal + orderShippingFees;
    await ctx.db.insert("orders", {
      prismaId: orderPrismaId,
      shippingFees: orderShippingFees,
      subTotal: orderSubTotal,
      total,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      shippingAddressId,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    // Empty cart
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(cart._id);

    return { orderId: orderPrismaId };
  },
});

export const updateOrderGroupStatus = mutation({
  args: {
    storeId: v.string(),
    groupId: v.string(),
    status: orderStatusValidator,
  },
  handler: async (ctx, { storeId, groupId, status }) => {
    const group = await findById(ctx, "orderGroups", groupId);
    if (!group || group.storeId !== storeId) {
      throw new Error("Order not found.");
    }
    await ctx.db.patch(group._id, {
      status,
      updatedAt: Date.now(),
    });
    return status;
  },
});

export const updateOrderItemStatus = mutation({
  args: {
    storeId: v.string(),
    orderItemId: v.string(),
    status: productStatusValidator,
  },
  handler: async (ctx, { orderItemId, status }) => {
    const item = await findById(ctx, "orderItems", orderItemId);
    if (!item) throw new Error("Order item not found.");
    await ctx.db.patch(item._id, {
      status,
      updatedAt: Date.now(),
    });
    return status;
  },
});
