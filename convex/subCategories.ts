import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== SUBCATEGORIES ====================

export const getAllSubCategories = query({
  args: {},
  handler: async (ctx) => {
    const subCategories = await ctx.db.query("subCategories").collect();
    const sorted = subCategories.sort((a, b) => b.updatedAt - a.updatedAt);

    const results = await Promise.all(
      sorted.map(async (sub) => {
        const category = await findById(ctx, "categories", sub.categoryId);
        return {
          ...toPrismaShape(sub)!,
          category: toPrismaShape(category),
        };
      })
    );

    return results;
  },
});

export const getSubCategory = query({
  args: { subCategoryId: v.string() },
  handler: async (ctx, { subCategoryId }) => {
    const sub = await findById(ctx, "subCategories", subCategoryId);
    return toPrismaShape(sub);
  },
});

export const getSubcategories = query({
  args: {
    limit: v.optional(v.number()),
    random: v.optional(v.boolean()),
  },
  handler: async (ctx, { limit, random }) => {
    const all = await ctx.db.query("subCategories").collect();
    let list = all.map((sub) => toPrismaShape(sub)!);

    if (random) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (limit) {
      list = list.slice(0, limit);
    }

    return list;
  },
});

export const upsertSubCategory = mutation({
  args: {
    id: v.optional(v.string()),
    name: v.string(),
    image: v.string(),
    url: v.string(),
    featured: v.boolean(),
    categoryId: v.string(),
  },
  handler: async (ctx, args) => {
    const targetId = args.id || generateUuid();
    const now = Date.now();

    const byName = await ctx.db
      .query("subCategories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (byName && byName.prismaId !== targetId) {
      throw new Error("A SubCategory with the same name already exists");
    }

    const byUrl = await ctx.db
      .query("subCategories")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (byUrl && byUrl.prismaId !== targetId) {
      throw new Error("A SubCategory with the same URL already exists");
    }

    const existing = await findById(ctx, "subCategories", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        image: args.image,
        url: args.url,
        featured: args.featured,
        categoryId: args.categoryId,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("subCategories", {
      prismaId: targetId,
      name: args.name,
      image: args.image,
      url: args.url,
      featured: args.featured,
      categoryId: args.categoryId,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const deleteSubCategory = mutation({
  args: { subCategoryId: v.string() },
  handler: async (ctx, { subCategoryId }) => {
    const existing = await findById(ctx, "subCategories", subCategoryId);
    if (!existing) throw new Error("SubCategory not found");
    const shape = toPrismaShape(existing);
    await ctx.db.delete(existing._id);
    return shape;
  },
});
