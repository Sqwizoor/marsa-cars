import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== OFFER TAGS ====================

export const getAllOfferTags = query({
  args: { storeUrl: v.optional(v.string()) },
  handler: async (ctx, { storeUrl }) => {
    let storeId: string | undefined;
    if (storeUrl) {
      const store = await ctx.db
        .query("stores")
        .withIndex("by_url", (q) => q.eq("url", storeUrl))
        .first();
      if (!store) return [];
      storeId = store.prismaId;
    }

    const offerTags = await ctx.db.query("offerTags").collect();
    const enriched = await Promise.all(
      offerTags.map(async (tag) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_offer_tag_id", (q) => q.eq("offerTagId", tag.prismaId))
          .collect();
        const filteredProducts = storeId
          ? products.filter((p) => p.storeId === storeId)
          : products;
        return {
          ...toPrismaShape(tag)!,
          products: filteredProducts.map((p) => ({ id: p.prismaId })),
        };
      })
    );

    const filtered = storeId
      ? enriched.filter((t) => t.products.length > 0)
      : enriched;

    filtered.sort((a, b) => b.products.length - a.products.length);
    return filtered;
  },
});

export const getOfferTag = query({
  args: { offerTagId: v.string() },
  handler: async (ctx, { offerTagId }) => {
    const tag = await findById(ctx, "offerTags", offerTagId);
    return toPrismaShape(tag);
  },
});

export const upsertOfferTag = mutation({
  args: {
    id: v.optional(v.string()),
    name: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const targetId = args.id || generateUuid();
    const now = Date.now();

    const byName = await ctx.db
      .query("offerTags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (byName && byName.prismaId !== targetId) {
      throw new Error("An offer tag with the same name already exists");
    }

    const byUrl = await ctx.db
      .query("offerTags")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (byUrl && byUrl.prismaId !== targetId) {
      throw new Error("An offer tag with the same URL already exists");
    }

    const existing = await findById(ctx, "offerTags", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        url: args.url,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("offerTags", {
      prismaId: targetId,
      name: args.name,
      url: args.url,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const deleteOfferTag = mutation({
  args: { offerTagId: v.string() },
  handler: async (ctx, { offerTagId }) => {
    const existing = await findById(ctx, "offerTags", offerTagId);
    if (!existing) throw new Error("Offer tag not found");
    const shape = toPrismaShape(existing);
    await ctx.db.delete(existing._id);
    return shape;
  },
});
