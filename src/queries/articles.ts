"use server";

import { db } from "@/lib/db";
import { Article } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";


export async function getLatestArticles(limit = 4) {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        author: {
          select: { name: true, picture: true }
        }
      }
    });
    return articles;
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await db.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, picture: true }
        }
      }
    });
    
    // Increment views
    if (article) {
        await db.article.update({
            where: { id: article.id },
            data: { views: { increment: 1 } }
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
        const offset = (page - 1) * limit;
        const where: any = { published: true };

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
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
                        select: { name: true, picture: true }
                    }
                }
            }),
            db.article.count({ where })
        ]);
        return { articles, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Error fetching all articles:", error);
        return { articles: [], total: 0, totalPages: 0 };
    }
}

export async function getAdminArticles() {
    try {
        const articles = await db.article.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { name: true }
                }
            }
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

        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });
        if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

        if (article.id) {
            // Update
            const updated = await db.article.update({
                where: { id: article.id },
                data: {
                    ...article,
                    authorId: dbUser.id, // Ensure author is the admin
                    publishedAt: article.published && !article.publishedAt ? new Date() : article.publishedAt,
                }
            });
            return updated;
        } else {
            // Create
            if (!article.title || !article.slug || !article.content || !article.coverImage) {
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
                }
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

        const dbUser = await db.user.findUnique({
            where: { id: user.id }
        });
        if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

        const deleted = await db.article.delete({
            where: { id }
        });
        return deleted;
    } catch (error) {
        console.error("Error deleting article:", error);
        throw error;
    }
}
