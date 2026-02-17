"use server";

import { db } from "@/lib/db";


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
