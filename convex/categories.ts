import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== CATEGORIES ====================

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const sorted = categories.sort((a, b) => b.updatedAt - a.updatedAt);

    const results = await Promise.all(
      sorted.map(async (cat) => {
        const subCategories = await ctx.db
          .query("subCategories")
          .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
          .collect();

        return {
          ...toPrismaShape(cat)!,
          subCategories: subCategories.map((sub) => toPrismaShape(sub)!),
        };
      })
    );

    return results;
  },
});

export const getAllCategoriesForCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, { categoryId }) => {
    const subCategories = await ctx.db
      .query("subCategories")
      .withIndex("by_category_id", (q) => q.eq("categoryId", categoryId))
      .collect();

    return subCategories
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((sub) => toPrismaShape(sub)!);
  },
});

export const getCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, { categoryId }) => {
    const cat = await findById(ctx, "categories", categoryId);
    return toPrismaShape(cat);
  },
});

export const getHomeFeaturedCategories = query({
  args: {},
  handler: async (ctx) => {
    const featuredCategories = await ctx.db
      .query("categories")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    const withCounts = await Promise.all(
      featuredCategories.map(async (cat) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
          .collect();

        const subCategories = await ctx.db
          .query("subCategories")
          .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
          .collect();

        const featuredSubs = subCategories.filter((s) => s.featured);
        const subsWithCounts = await Promise.all(
          featuredSubs.map(async (sub) => {
            const subProducts = await ctx.db
              .query("products")
              .withIndex("by_sub_category_id", (q) =>
                q.eq("subCategoryId", sub.prismaId)
              )
              .collect();
            return {
              id: sub.prismaId,
              name: sub.name,
              url: sub.url,
              image: sub.image,
              productCount: subProducts.length,
            };
          })
        );

        subsWithCounts.sort((a, b) => b.productCount - a.productCount);

        return {
          id: cat.prismaId,
          name: cat.name,
          url: cat.url,
          image: cat.image,
          productCount: products.length,
          subCategories: subsWithCounts.slice(0, 3),
        };
      })
    );

    withCounts.sort((a, b) => b.productCount - a.productCount);
    return withCounts.slice(0, 6);
  },
});

export const upsertCategory = mutation({
  args: {
    id: v.optional(v.string()),
    name: v.string(),
    image: v.string(),
    url: v.string(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const targetId = args.id || generateUuid();
    const now = Date.now();

    // Check uniqueness of name or url
    const byName = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (byName && byName.prismaId !== targetId) {
      throw new Error("A category with the same Name already exists");
    }

    const byUrl = await ctx.db
      .query("categories")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (byUrl && byUrl.prismaId !== targetId) {
      throw new Error("A category with the same URL already exists");
    }

    const existing = await findById(ctx, "categories", targetId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        image: args.image,
        url: args.url,
        featured: args.featured,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return toPrismaShape(updated);
    }

    const newId = await ctx.db.insert("categories", {
      prismaId: targetId,
      name: args.name,
      image: args.image,
      url: args.url,
      featured: args.featured,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.string() },
  handler: async (ctx, { categoryId }) => {
    const existing = await findById(ctx, "categories", categoryId);
    if (!existing) throw new Error("Category not found");
    const shape = toPrismaShape(existing);
    await ctx.db.delete(existing._id);
    return shape;
  },
});
