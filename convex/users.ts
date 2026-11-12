import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import { roleValidator } from "./schema";

// ==================== USER & CLERK SYNC ====================

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await findById(ctx, "users", userId);
    if (!user) return null;
    const stores = await ctx.db
      .query("stores")
      .withIndex("by_user_id", (q) => q.eq("userId", user.prismaId))
      .collect();
    const ads = await ctx.db
      .query("advertisements")
      .withIndex("by_user_id", (q) => q.eq("userId", user.prismaId))
      .collect();

    return {
      ...toPrismaShape(user)!,
      stores: stores.map((s) => toPrismaShape(s)!),
      ads: ads.map((a) => toPrismaShape(a)!),
    };
  },
});

export const upsertUserFromClerk = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    role: v.optional(roleValidator),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const byId = await findById(ctx, "users", args.id);
    if (byId) {
      await ctx.db.patch(byId._id, {
        name: args.name,
        email: args.email,
        picture: args.picture,
        role: args.role || byId.role,
        updatedAt: now,
      });
      const updated = await ctx.db.get(byId._id);
      return toPrismaShape(updated);
    }

    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (byEmail) {
      await ctx.db.patch(byEmail._id, {
        prismaId: args.id,
        name: args.name,
        picture: args.picture,
        role: args.role || byEmail.role,
        updatedAt: now,
      });
      const updated = await ctx.db.get(byEmail._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("users", {
      prismaId: args.id,
      name: args.name,
      email: args.email,
      picture: args.picture,
      role: args.role || "USER",
      memberOfStoreIds: [],
      followingStoreIds: [],
      couponIds: [],
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const deleteUserFromClerk = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await findById(ctx, "users", userId);
    if (user) {
      await ctx.db.delete(user._id);
    }
    return { success: true };
  },
});

// ==================== FOLLOW STORE ====================

export const followStore = mutation({
  args: { userId: v.string(), storeId: v.string() },
  handler: async (ctx, { userId, storeId }) => {
    const store = await findById(ctx, "stores", storeId);
    if (!store) throw new Error("Store not found.");

    const user = await findById(ctx, "users", userId);
    if (!user) throw new Error("User not found.");

    const now = Date.now();
    const followerIds = store.followerIds || [];
    const followingStoreIds = user.followingStoreIds || [];

    const isFollowing = followerIds.includes(user.prismaId);
    if (isFollowing) {
      await ctx.db.patch(store._id, {
        followerIds: followerIds.filter((id: string) => id !== user.prismaId),
        updatedAt: now,
      });
      await ctx.db.patch(user._id, {
        followingStoreIds: followingStoreIds.filter(
          (id: string) => id !== store.prismaId
        ),
        updatedAt: now,
      });
      return false;
    } else {
      await ctx.db.patch(store._id, {
        followerIds: [...followerIds, user.prismaId],
        updatedAt: now,
      });
      await ctx.db.patch(user._id, {
        followingStoreIds: [...followingStoreIds, store.prismaId],
        updatedAt: now,
      });
      return true;
    }
  },
});

// ==================== SHIPPING ADDRESSES ====================

export const getUserShippingAddresses = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const addresses = await ctx.db
      .query("shippingAddresses")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const user = await findById(ctx, "users", userId);
    return await Promise.all(
      addresses.map(async (addr) => {
        const country = await findById(ctx, "countries", addr.countryId);
        return {
          ...toPrismaShape(addr)!,
          country: toPrismaShape(country),
          user: toPrismaShape(user),
        };
      })
    );
  },
});

export const upsertShippingAddress = mutation({
  args: {
    userId: v.string(),
    address: v.object({
      id: v.optional(v.string()),
      firstName: v.string(),
      lastName: v.string(),
      phone: v.string(),
      address1: v.string(),
      address2: v.optional(v.string()),
      state: v.string(),
      city: v.string(),
      zip_code: v.string(),
      default: v.boolean(),
      countryId: v.string(),
    }),
  },
  handler: async (ctx, { userId, address }) => {
    const now = Date.now();
    const targetId = address.id || generateUuid();

    if (address.default) {
      const existingDefaults = await ctx.db
        .query("shippingAddresses")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();
      for (const addr of existingDefaults) {
        if (addr.default && addr.prismaId !== targetId) {
          await ctx.db.patch(addr._id, { default: false, updatedAt: now });
        }
      }
    }

    const existing = await findById(ctx, "shippingAddresses", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        address1: address.address1,
        address2: address.address2,
        state: address.state,
        city: address.city,
        zip_code: address.zip_code,
        default: address.default,
        countryId: address.countryId,
        userId,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("shippingAddresses", {
      prismaId: targetId,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      address1: address.address1,
      address2: address.address2,
      state: address.state,
      city: address.city,
      zip_code: address.zip_code,
      default: address.default,
      countryId: address.countryId,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

// ==================== CART & WISHLIST ====================

export const saveUserCart = mutation({
  args: {
    userId: v.string(),
    cartItems: v.array(
      v.object({
        productId: v.string(),
        variantId: v.string(),
        sizeId: v.string(),
        storeId: v.string(),
        sku: v.string(),
        productSlug: v.string(),
        variantSlug: v.string(),
        name: v.string(),
        image: v.string(),
        quantity: v.number(),
        size: v.string(),
        price: v.number(),
        shippingFee: v.number(),
        totalPrice: v.number(),
      })
    ),
    subTotal: v.number(),
    shippingFees: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingCart = await ctx.db
      .query("carts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingCart) {
      const oldItems = await ctx.db
        .query("cartItems")
        .withIndex("by_cart_id", (q) => q.eq("cartId", existingCart.prismaId))
        .collect();
      for (const item of oldItems) {
        await ctx.db.delete(item._id);
      }
      await ctx.db.delete(existingCart._id);
    }

    const cartPrismaId = generateUuid();
    await ctx.db.insert("carts", {
      prismaId: cartPrismaId,
      userId: args.userId,
      shippingFees: args.shippingFees,
      subTotal: args.subTotal,
      total: args.total,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of args.cartItems) {
      await ctx.db.insert("cartItems", {
        prismaId: generateUuid(),
        cartId: cartPrismaId,
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

export const emptyUserCart = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const existingCart = await ctx.db
      .query("carts")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    if (existingCart) {
      const items = await ctx.db
        .query("cartItems")
        .withIndex("by_cart_id", (q) => q.eq("cartId", existingCart.prismaId))
        .collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      await ctx.db.delete(existingCart._id);
    }
    return true;
  },
});

export const addToWishlist = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    variantId: v.string(),
    sizeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userWishlist = await ctx.db
      .query("wishlists")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const existing = userWishlist.find(
      (w) =>
        w.productId === args.productId &&
        w.variantId === args.variantId &&
        w.sizeId === args.sizeId
    );

    if (existing) {
      await ctx.db.delete(existing._id);
      return { id: null, message: "Removed from wishlist" };
    }

    const prismaId = generateUuid();
    const now = Date.now();
    await ctx.db.insert("wishlists", {
      prismaId,
      userId: args.userId,
      productId: args.productId,
      variantId: args.variantId,
      sizeId: args.sizeId,
      createdAt: now,
      updatedAt: now,
    });
    return { id: prismaId, message: "Added to wishlist" };
  },
});

// ==================== USER PROFILE QUERIES ====================

export const getUserOrders = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
    period: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { userId, filter = "", period = "", search = "", page = 1, pageSize = 10 }
  ) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    if (filter === "unpaid")
      orders = orders.filter((o) => o.paymentStatus === "Pending");
    if (filter === "toShip")
      orders = orders.filter((o) => o.orderStatus === "Processing");
    if (filter === "shipped")
      orders = orders.filter((o) => o.orderStatus === "Shipped");
    if (filter === "delivered")
      orders = orders.filter((o) => o.orderStatus === "Delivered");

    const now = Date.now();
    if (period === "last-6-months") {
      orders = orders.filter(
        (o) => o.createdAt >= now - 180 * 24 * 60 * 60 * 1000
      );
    } else if (period === "last-1-year") {
      orders = orders.filter(
        (o) => o.createdAt >= now - 365 * 24 * 60 * 60 * 1000
      );
    } else if (period === "last-2-years") {
      orders = orders.filter(
        (o) => o.createdAt >= now - 730 * 24 * 60 * 60 * 1000
      );
    }

    orders.sort((a, b) => b.updatedAt - a.updatedAt);

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const groupsRaw = await ctx.db
          .query("orderGroups")
          .withIndex("by_order_id", (q) => q.eq("orderId", order.prismaId))
          .collect();

        const groups = await Promise.all(
          groupsRaw.map(async (g) => {
            const items = await ctx.db
              .query("orderItems")
              .withIndex("by_order_group_id", (q) =>
                q.eq("orderGroupId", g.prismaId)
              )
              .collect();
            return {
              ...toPrismaShape(g)!,
              items: items.map((i) => toPrismaShape(i)!),
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
          groups,
          shippingAddress: addr
            ? {
                ...toPrismaShape(addr)!,
                country: toPrismaShape(country),
              }
            : null,
        };
      })
    );

    const filtered = search.trim()
      ? enriched.filter((o) => {
          const s = search.toLowerCase();
          return (
            o.id.toLowerCase().includes(s) ||
            o.groups.some((g: any) =>
              g.items.some((i: any) => i.name.toLowerCase().includes(s))
            )
          );
        })
      : enriched;

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      orders: paged,
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    };
  },
});

export const getUserPayments = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
    period: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { userId, filter = "", period = "", search = "", page = 1, pageSize = 10 }
  ) => {
    let payments = await ctx.db
      .query("paymentDetails")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    if (filter === "credit-card") {
      payments = payments.filter((p) => p.paymentMethod === "Stripe");
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      payments = payments.filter(
        (p) =>
          p.prismaId.toLowerCase().includes(s) ||
          p.paymentInetntId.toLowerCase().includes(s)
      );
    }

    payments.sort((a, b) => b.updatedAt - a.updatedAt);
    const totalCount = payments.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = payments.slice((page - 1) * pageSize, page * pageSize);

    const enriched = await Promise.all(
      paged.map(async (p) => {
        const order = await findById(ctx, "orders", p.orderId);
        return {
          ...toPrismaShape(p)!,
          order: toPrismaShape(order),
        };
      })
    );

    return {
      payments: enriched,
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    };
  },
});

export const getUserReviews = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
    period: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { userId, filter = "", search = "", page = 1, pageSize = 10 }
  ) => {
    let reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    if (filter) {
      reviews = reviews.filter((r) => r.rating === parseFloat(filter));
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      reviews = reviews.filter((r) => r.review.toLowerCase().includes(s));
    }

    reviews.sort((a, b) => b.updatedAt - a.updatedAt);
    const totalCount = reviews.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = reviews.slice((page - 1) * pageSize, page * pageSize);

    const enriched = await Promise.all(
      paged.map(async (r) => {
        const images = await ctx.db
          .query("reviewImages")
          .withIndex("by_review_id", (q) => q.eq("reviewId", r.prismaId))
          .collect();
        const user = await findById(ctx, "users", r.userId);
        return {
          ...toPrismaShape(r)!,
          images: images.map((i) => toPrismaShape(i)!),
          user: toPrismaShape(user),
        };
      })
    );

    return {
      reviews: enriched,
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    };
  },
});

export const getUserFollowedStores = query({
  args: {
    userId: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { userId, page = 1, pageSize = 10 }) => {
    const user = await findById(ctx, "users", userId);
    const followingIds = user?.followingStoreIds || [];

    const stores: any[] = [];
    for (const storeId of followingIds) {
      const store = await findById(ctx, "stores", storeId);
      if (store) {
        stores.push({
          id: store.prismaId,
          url: store.url,
          name: store.name,
          logo: store.logo,
          followersCount: (store.followerIds || []).length,
          isUserFollowingStore: true,
        });
      }
    }

    const totalCount = stores.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = stores.slice((page - 1) * pageSize, page * pageSize);

    return {
      stores: paged,
      totalPages,
    };
  },
});

export const getUserWishlist = query({
  args: {
    userId: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { userId, page = 1, pageSize = 10 }) => {
    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    const wishlist: any[] = [];
    for (const item of paged) {
      const product = await findById(ctx, "products", item.productId);
      if (!product) continue;
      const variants = await ctx.db
        .query("productVariants")
        .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
        .collect();
      const variant =
        variants.find((v) => v.prismaId === item.variantId) || variants[0];
      if (!variant) continue;

      const images = await ctx.db
        .query("productVariantImages")
        .withIndex("by_variant_id", (q) =>
          q.eq("productVariantId", variant.prismaId)
        )
        .collect();
      const sizes = await ctx.db
        .query("sizes")
        .withIndex("by_variant_id", (q) =>
          q.eq("productVariantId", variant.prismaId)
        )
        .collect();

      wishlist.push({
        id: product.prismaId,
        slug: product.slug,
        name: product.name,
        rating: product.rating,
        sales: product.sales,
        numReviews: 0,
        variants: [
          {
            variantId: variant.prismaId,
            variantSlug: variant.slug,
            variantName: variant.variantName,
            images: images.map((i) => toPrismaShape(i)!),
            sizes: sizes.map((s) => toPrismaShape(s)!),
          },
        ],
        variantImages: [],
      });
    }

    return {
      wishlist,
      totalPages,
    };
  },
});

export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    const active = subs
      .filter((s) => s.status === "ACTIVE" || s.status === "TRIALING")
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    return toPrismaShape(active);
  },
});
