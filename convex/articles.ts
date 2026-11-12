import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";

// ==================== ARTICLES ====================

export const getLatestArticles = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 4 }) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const sorted = articles.sort(
      (a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt)
    );

    const sliced = sorted.slice(0, limit);
    return await Promise.all(
      sliced.map(async (article) => {
        const author = await findById(ctx, "users", article.authorId);
        return {
          ...toPrismaShape(article)!,
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : null,
          author: author
            ? { name: author.name, picture: author.picture }
            : { name: "Admin", picture: "" },
        };
      })
    );
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!article) return null;

    const author = await findById(ctx, "users", article.authorId);
    return {
      ...toPrismaShape(article)!,
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : null,
      author: author
        ? { name: author.name, picture: author.picture }
        : { name: "Admin", picture: "" },
    };
  },
});

export const incrementArticleViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (article) {
      await ctx.db.patch(article._id, {
        views: article.views + 1,
      });
    }
  },
});

export const getAllArticles = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { page = 1, limit = 12, search }) => {
    let articles = await ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    articles.sort(
      (a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt)
    );

    const total = articles.length;
    const offset = (page - 1) * limit;
    const paged = articles.slice(offset, offset + limit);

    const enriched = await Promise.all(
      paged.map(async (article) => {
        const author = await findById(ctx, "users", article.authorId);
        return {
          ...toPrismaShape(article)!,
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : null,
          author: author
            ? { name: author.name, picture: author.picture }
            : { name: "Admin", picture: "" },
        };
      })
    );

    return {
      articles: enriched,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },
});

export const getAdminArticles = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    articles.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      articles.map(async (article) => {
        const author = await findById(ctx, "users", article.authorId);
        return {
          ...toPrismaShape(article)!,
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString()
            : null,
          author: author ? { name: author.name } : { name: "Admin" },
        };
      })
    );
  },
});

export const upsertArticle = mutation({
  args: {
    id: v.optional(v.string()),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.string(),
    published: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (args.id) {
      const existing = await findById(ctx, "articles", args.id);
      if (existing) {
        const published = args.published ?? existing.published;
        const publishedAt =
          published && !existing.publishedAt ? now : existing.publishedAt;
        await ctx.db.patch(existing._id, {
          title: args.title,
          slug: args.slug,
          content: args.content,
          excerpt: args.excerpt,
          coverImage: args.coverImage,
          published,
          publishedAt,
          tags: args.tags ?? existing.tags,
          authorId: args.authorId,
          updatedAt: now,
        });
        const updated = await ctx.db.get(existing._id);
        return toPrismaShape(updated);
      }
    }

    const prismaId = args.id || generateUuid();
    const published = args.published || false;
    const newId = await ctx.db.insert("articles", {
      prismaId,
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      coverImage: args.coverImage,
      published,
      publishedAt: published ? now : undefined,
      tags: args.tags || [],
      views: 0,
      authorId: args.authorId,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(newId);
    return toPrismaShape(created);
  },
});

export const deleteArticle = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await findById(ctx, "articles", id);
    if (!existing) throw new Error("Article not found");
    const shape = toPrismaShape(existing);
    await ctx.db.delete(existing._id);
    return shape;
  },
});
