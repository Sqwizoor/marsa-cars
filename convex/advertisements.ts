import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== ADVERTISEMENTS ====================

export const createAdvertisement = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    url: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
    targetSubCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const activeSub = subs.find(
      (s) => s.status === "ACTIVE" || s.status === "TRIALING"
    );

    if (!activeSub) {
      throw new Error("You need an active subscription to create ads");
    }

    if (activeSub.adLimit !== -1 && activeSub.adsUsed >= activeSub.adLimit) {
      throw new Error(
        "You have reached your ad limit. Upgrade your plan to create more ads."
      );
    }

    const now = Date.now();
    const prismaId = generateUuid();
    const newId = await ctx.db.insert("advertisements", {
      prismaId,
      userId: args.userId,
      title: args.title,
      description: args.description,
      image: args.image,
      url: args.url,
      targetCategory: args.targetCategory,
      targetSubCategory: args.targetSubCategory,
      isActive: true,
      views: 0,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(activeSub._id, {
      adsUsed: activeSub.adsUsed + 1,
      updatedAt: now,
    });

    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const getActiveAdvertisements = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 3 }) => {
    let ads = await ctx.db
      .query("advertisements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (category) {
      ads = ads.filter((a) => a.targetCategory === category);
    }

    ads.sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return b.createdAt - a.createdAt;
    });

    const sliced = ads.slice(0, limit);
    return await Promise.all(
      sliced.map(async (ad) => {
        const user = await findById(ctx, "users", ad.userId);
        const subs = await ctx.db
          .query("subscriptions")
          .withIndex("by_user_id", (q) => q.eq("userId", ad.userId))
          .collect();
        const activeSubs = subs
          .filter((s) => s.status === "ACTIVE" || s.status === "TRIALING")
          .map((s) => ({ tier: s.tier }));

        return {
          ...toPrismaShape(ad)!,
          user: {
            name: user?.name || "Advertiser",
            subscriptions: activeSubs,
          },
        };
      })
    );
  },
});

export const getUserAdvertisements = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const ads = await ctx.db
      .query("advertisements")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    ads.sort((a, b) => b.createdAt - a.createdAt);
    return ads.map((ad) => toPrismaShape(ad)!);
  },
});

export const trackAdvertisement = mutation({
  args: {
    id: v.string(),
    type: v.union(v.literal("view"), v.literal("click")),
  },
  handler: async (ctx, { id, type }) => {
    const ad = await findById(ctx, "advertisements", id);
    if (!ad) return { success: false };

    if (type === "view") {
      await ctx.db.patch(ad._id, { views: ad.views + 1 });
    } else {
      await ctx.db.patch(ad._id, { clicks: ad.clicks + 1 });
    }
    return { success: true };
  },
});
