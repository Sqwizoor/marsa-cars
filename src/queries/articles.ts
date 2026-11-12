"use server";

import { db } from "@/lib/db";
import { Article } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { api, convexQuery, convexMutation, isConvexEnabled } from "@/lib/convex";

export async function getLatestArticles(limit = 4) {
  try {
    if (isConvexEnabled()) {
      return await convexQuery(api.articles.getLatestArticles, {
        limit,
      });
    }

    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        author: {
          select: { name: true, picture: true },
        },
      },
    });
    return articles;
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    if (isConvexEnabled()) {
      const article = await convexQuery<any>(api.articles.getArticleBySlug, { slug });
      if (article) {
        await convexMutation(api.articles.incrementArticleViews, { slug });
      }
      return article as never;
    }

    const article = await db.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, picture: true },
        },
      },
    });

    if (article) {
      await db.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      });
    }

    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function getAllArticles(page = 1, limit = 12, search?: string) {
  try {
    if (isConvexEnabled()) {
      return await convexQuery(api.articles.getAllArticles, {
        page,
        limit,
        search,
      });
    }

    const offset = (page - 1) * limit;
    const where: any = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          author: {
            select: { name: true, picture: true },
          },
        },
      }),
      db.article.count({ where }),
    ]);
    return { articles, total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("Error fetching all articles:", error);
    return { articles: [], total: 0, totalPages: 0 };
  }
}

export async function getAdminArticles() {
  try {
    if (isConvexEnabled()) {
      return (await convexQuery(api.articles.getAdminArticles, {})) as any[];
    }

    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true },
        },
      },
    });
    return articles;
  } catch (error) {
    console.error("Error fetching admin articles:", error);
    return [];
  }
}

export async function upsertArticle(article: Partial<Article>) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated");

    if (isConvexEnabled()) {
      return (await convexMutation(api.articles.upsertArticle, {
        id: article.id,
        title: article.title || "",
        slug: article.slug || "",
        content: article.content || "",
        excerpt: article.excerpt || undefined,
        coverImage: article.coverImage || "",
        published: article.published,
        tags: article.tags,
        authorId: user.id,
      })) as any;
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

    if (article.id) {
      const updated = await db.article.update({
        where: { id: article.id },
        data: {
          ...article,
          authorId: dbUser.id,
          publishedAt:
            article.published && !article.publishedAt
              ? new Date()
              : article.publishedAt,
        },
      });
      return updated;
    } else {
      if (
        !article.title ||
        !article.slug ||
        !article.content ||
        !article.coverImage
      ) {
        throw new Error("Missing required fields");
      }

      const created = await db.article.create({
        data: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          coverImage: article.coverImage,
          published: article.published || false,
          publishedAt: article.published ? new Date() : null,
          tags: article.tags || [],
          authorId: dbUser.id,
        },
      });
      return created;
    }
  } catch (error) {
    console.error("Error upserting article:", error);
    throw error;
  }
}

export async function deleteArticle(id: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated");

    if (isConvexEnabled()) {
      return (await convexMutation(api.articles.deleteArticle, { id })) as any;
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

    const deleted = await db.article.delete({
      where: { id },
    });
    return deleted;
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}
