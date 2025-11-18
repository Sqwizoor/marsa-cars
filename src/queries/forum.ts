"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  ThreadStatus,
  PostStatus,
  ReactionType,
  ReportReason,
  ReportStatus,
  BadgeType,
  Prisma,
} from "@prisma/client";

// ==================== CATEGORY & SUBFORUM QUERIES ====================

export async function getForumCategories() {
  try {
    const categories = await db.forumCategory.findMany({
      where: { isActive: true },
      include: {
        subforums: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { threads: true },
            },
          },
        },
        _count: {
          select: { threads: true },
        },
      },
      orderBy: { order: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.forumCategory.findUnique({
      where: { slug },
      include: {
        subforums: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { threads: true },
        },
      },
    });
    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function getSubforumBySlug(slug: string) {
  try {
    const subforum = await db.forumSubforum.findUnique({
      where: { slug },
      include: {
        category: true,
        _count: {
          select: { threads: true },
        },
      },
    });
    return subforum;
  } catch (error) {
    console.error("Error fetching subforum:", error);
    return null;
  }
}

// ==================== THREAD QUERIES ====================

export async function getThreads({
  categoryId,
  subforumId,
  page = 1,
  limit = 20,
  sortBy = "lastPostAt",
  order = "desc",
  searchQuery,
  tags,
}: {
  categoryId?: string;
  subforumId?: string;
  page?: number;
  limit?: number;
  sortBy?: "lastPostAt" | "createdAt" | "views" | "postCount";
  order?: "asc" | "desc";
  searchQuery?: string;
  tags?: string[];
}) {
  try {
    const where: Prisma.ForumThreadWhereInput = {
      ...(categoryId && { categoryId }),
      ...(subforumId && { subforumId }),
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
      ...(tags && tags.length > 0 && {
        tags: {
          hasSome: tags,
        },
      }),
    };

    const [threads, total] = await Promise.all([
      db.forumThread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
              color: true,
            },
          },
          subforum: {
            select: {
              name: true,
              slug: true,
            },
          },
          lastPostBy: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          _count: {
            select: { posts: true },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { [sortBy]: order },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.forumThread.count({ where }),
    ]);

    return {
      threads,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    return { threads: [], total: 0, pages: 0, currentPage: page };
  }
}

export async function getThreadBySlug(slug: string) {
  try {
    // Increment views
    await db.forumThread.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    const thread = await db.forumThread.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            picture: true,
            forumStats: true,
          },
        },
        category: true,
        subforum: true,
        _count: {
          select: { posts: true, bookmarks: true },
        },
      },
    });

    return thread;
  } catch (error) {
    console.error("Error fetching thread:", error);
    return null;
  }
}

export async function createThread({
  title,
  content,
  categoryId,
  subforumId,
  tags,
}: {
  title: string;
  content: string;
  categoryId: string;
  subforumId?: string;
  tags?: string[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + 
      "-" + 
      Date.now().toString(36);

    const thread = await db.$transaction(async (tx) => {
      // Create thread
      const newThread = await tx.forumThread.create({
        data: {
          title,
          content,
          slug,
          categoryId,
          subforumId,
          authorId: userId,
          tags: tags || [],
        },
        include: {
          category: true,
          subforum: true,
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
        },
      });

      // Update user stats
      await tx.forumUserStats.upsert({
        where: { userId },
        create: {
          userId,
          threadCount: 1,
          reputation: 5, // Bonus for creating thread
        },
        update: {
          threadCount: { increment: 1 },
          reputation: { increment: 5 },
        },
      });

      // Update subforum stats if applicable
      if (subforumId) {
        await tx.forumSubforum.update({
          where: { id: subforumId },
          data: { threadCount: { increment: 1 } },
        });
      }

      return newThread;
    });

    revalidatePath("/forum");
    return { success: true, thread };
  } catch (error) {
    console.error("Error creating thread:", error);
    return { success: false, error: "Failed to create thread" };
  }
}

export async function updateThread({
  threadId,
  title,
  content,
  tags,
}: {
  threadId: string;
  title?: string;
  content?: string;
  tags?: string[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: { authorId: true, slug: true },
    });

    if (!thread || thread.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    const updated = await db.forumThread.update({
      where: { id: threadId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
      },
    });

    revalidatePath(`/forum/thread/${thread.slug}`);
    return { success: true, thread: updated };
  } catch (error) {
    console.error("Error updating thread:", error);
    return { success: false, error: "Failed to update thread" };
  }
}

export async function deleteThread(threadId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const thread = await db.forumThread.findUnique({
      where: { id: threadId },
      select: { authorId: true, subforumId: true },
    });

    if (!thread || thread.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    await db.$transaction(async (tx) => {
      // Delete thread and all related data (cascading)
      await tx.forumThread.delete({
        where: { id: threadId },
      });

      // Update user stats
      await tx.forumUserStats.update({
        where: { userId },
        data: { threadCount: { decrement: 1 } },
      });

      // Update subforum stats if applicable
      if (thread.subforumId) {
        await tx.forumSubforum.update({
          where: { id: thread.subforumId },
          data: { threadCount: { decrement: 1 } },
        });
      }
    });

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Error deleting thread:", error);
    return { success: false, error: "Failed to delete thread" };
  }
}

// ==================== POST QUERIES ====================

export async function getPosts({
  threadId,
  page = 1,
  limit = 20,
}: {
  threadId: string;
  page?: number;
  limit?: number;
}) {
  try {
    const [posts, total] = await Promise.all([
      db.forumPost.findMany({
        where: {
          threadId,
          parentPostId: null, // Only get top-level posts
          status: PostStatus.ACTIVE,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
              createdAt: true,
              forumStats: true,
              forumBadges: {
                orderBy: { earnedAt: "desc" },
                take: 3,
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  picture: true,
                },
              },
              reactions: true,
            },
            orderBy: { createdAt: "asc" },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { replies: true, reactions: true },
          },
        },
        orderBy: [
          { isAcceptedAnswer: "desc" },
          { createdAt: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.forumPost.count({
        where: {
          threadId,
          parentPostId: null,
          status: PostStatus.ACTIVE,
        },
      }),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], total: 0, pages: 0, currentPage: page };
  }
}

export async function createPost({
  threadId,
  content,
  parentPostId,
}: {
  threadId: string;
  content: string;
  parentPostId?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const post = await db.$transaction(async (tx) => {
      // Check if thread is locked
      const thread = await tx.forumThread.findUnique({
        where: { id: threadId },
        select: { isLocked: true, subforumId: true },
      });

      if (thread?.isLocked) {
        throw new Error("Thread is locked");
      }

      // Create post
      const newPost = await tx.forumPost.create({
        data: {
          content,
          threadId,
          authorId: userId,
          parentPostId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
              forumStats: true,
            },
          },
        },
      });

      // Update thread stats
      await tx.forumThread.update({
        where: { id: threadId },
        data: {
          postCount: { increment: 1 },
          lastPostAt: new Date(),
          lastPostById: userId,
        },
      });

      // Update parent post reply count if this is a reply
      if (parentPostId) {
        await tx.forumPost.update({
          where: { id: parentPostId },
          data: { replyCount: { increment: 1 } },
        });
      }

      // Update user stats
      await tx.forumUserStats.upsert({
        where: { userId },
        create: {
          userId,
          postCount: 1,
          reputation: 2, // Bonus for posting
        },
        update: {
          postCount: { increment: 1 },
          reputation: { increment: 2 },
          lastActiveAt: new Date(),
        },
      });

      // Update subforum stats if applicable
      if (thread?.subforumId) {
        await tx.forumSubforum.update({
          where: { id: thread.subforumId },
          data: { postCount: { increment: 1 } },
        });
      }

      return newPost;
    });

    revalidatePath(`/forum/thread`);
    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

export async function updatePost({
  postId,
  content,
}: {
  postId: string;
  content: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const post = await db.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true, threadId: true },
    });

    if (!post || post.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    const updated = await db.forumPost.update({
      where: { id: postId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    revalidatePath(`/forum/thread`);
    return { success: true, post: updated };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function deletePost(postId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const post = await db.forumPost.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        threadId: true,
        parentPostId: true,
      },
    });

    if (!post || post.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    await db.$transaction(async (tx) => {
      // Soft delete the post
      await tx.forumPost.update({
        where: { id: postId },
        data: { status: PostStatus.DELETED },
      });

      // Update thread stats
      await tx.forumThread.update({
        where: { id: post.threadId },
        data: { postCount: { decrement: 1 } },
      });

      // Update parent post reply count if this is a reply
      if (post.parentPostId) {
        await tx.forumPost.update({
          where: { id: post.parentPostId },
          data: { replyCount: { decrement: 1 } },
        });
      }

      // Update user stats
      await tx.forumUserStats.update({
        where: { userId },
        data: { postCount: { decrement: 1 } },
      });
    });

    revalidatePath(`/forum/thread`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

// ==================== REACTION QUERIES ====================

export async function toggleReaction({
  postId,
  reactionType,
}: {
  postId: string;
  reactionType: ReactionType;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db.forumReaction.findUnique({
      where: {
        userId_postId_type: {
          userId,
          postId,
          type: reactionType,
        },
      },
    });

    if (existing) {
      // Remove reaction
      await db.$transaction(async (tx) => {
        await tx.forumReaction.delete({
          where: { id: existing.id },
        });

        await tx.forumPost.update({
          where: { id: postId },
          data: { reactionCount: { decrement: 1 } },
        });
      });

      revalidatePath(`/forum/thread`);
      return { success: true, action: "removed" };
    } else {
      // Add reaction
      const result = await db.$transaction(async (tx) => {
        const reaction = await tx.forumReaction.create({
          data: {
            userId,
            postId,
            type: reactionType,
          },
        });

        await tx.forumPost.update({
          where: { id: postId },
          data: { reactionCount: { increment: 1 } },
        });

        // Award reputation if it's a helpful reaction
        if (reactionType === ReactionType.HELPFUL) {
          const post = await tx.forumPost.findUnique({
            where: { id: postId },
            select: { authorId: true },
          });

          if (post) {
            await tx.forumUserStats.update({
              where: { userId: post.authorId },
              data: {
                helpfulCount: { increment: 1 },
                reputation: { increment: 10 },
              },
            });
          }
        }

        return reaction;
      });

      revalidatePath(`/forum/thread`);
      return { success: true, action: "added", reaction: result };
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return { success: false, error: "Failed to toggle reaction" };
  }
}

export async function getPostReactions(postId: string) {
  try {
    const reactions = await db.forumReaction.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    // Group by type
    const grouped = reactions.reduce(
      (acc, reaction) => {
        if (!acc[reaction.type]) {
          acc[reaction.type] = [];
        }
        acc[reaction.type].push(reaction);
        return acc;
      },
      {} as Record<ReactionType, typeof reactions>
    );

    return grouped;
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return {};
  }
}

// ==================== BOOKMARK QUERIES ====================

export async function toggleBookmark({
  threadId,
  notes,
}: {
  threadId: string;
  notes?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db.forumBookmark.findUnique({
      where: {
        userId_threadId: {
          userId,
          threadId,
        },
      },
    });

    if (existing) {
      await db.forumBookmark.delete({
        where: { id: existing.id },
      });

      return { success: true, action: "removed" };
    } else {
      const bookmark = await db.forumBookmark.create({
        data: {
          userId,
          threadId,
          notes,
        },
      });

      return { success: true, action: "added", bookmark };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    const bookmarks = await db.forumBookmark.findMany({
      where: { userId },
      include: {
        thread: {
          include: {
            category: true,
            subforum: true,
            author: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookmarks;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

// ==================== USER STATS & PROFILE ====================

export async function getUserForumStats(userId: string) {
  try {
    const stats = await db.forumUserStats.findUnique({
      where: { userId },
    });

    return stats;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

export async function getUserForumActivity(userId: string, limit = 10) {
  try {
    const [threads, posts, badges] = await Promise.all([
      db.forumThread.findMany({
        where: { authorId: userId },
        include: {
          category: true,
          subforum: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.forumPost.findMany({
        where: {
          authorId: userId,
          status: PostStatus.ACTIVE,
        },
        include: {
          thread: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.forumBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: "desc" },
      }),
    ]);

    return { threads, posts, badges };
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return { threads: [], posts: [], badges: [] };
  }
}

// ==================== SEARCH ====================

export async function searchForum(query: string) {
  try {
    const [threads, posts] = await Promise.all([
      db.forumThread.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          category: true,
          subforum: true,
        },
        take: 20,
        orderBy: { lastPostAt: "desc" },
      }),
      db.forumPost.findMany({
        where: {
          content: { contains: query, mode: "insensitive" },
          status: PostStatus.ACTIVE,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          thread: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { threads, posts };
  } catch (error) {
    console.error("Error searching forum:", error);
    return { threads: [], posts: [] };
  }
}

// ==================== MODERATION ====================

export async function reportContent({
  threadId,
  postId,
  reason,
  description,
}: {
  threadId?: string;
  postId?: string;
  reason: ReportReason;
  description?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const report = await db.forumReport.create({
      data: {
        reporterId: userId,
        threadId,
        postId,
        reason,
        description,
      },
    });

    return { success: true, report };
  } catch (error) {
    console.error("Error reporting content:", error);
    return { success: false, error: "Failed to report content" };
  }
}

export async function getPendingReports() {
  try {
    const reports = await db.forumReport.findMany({
      where: { status: ReportStatus.PENDING },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        thread: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            thread: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

// ==================== ADMIN FUNCTIONS ====================

export async function pinThread(threadId: string, isPinned: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is moderator or admin
    // This should be enhanced with proper role checking

    await db.forumThread.update({
      where: { id: threadId },
      data: { isPinned },
    });

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Error pinning thread:", error);
    return { success: false, error: "Failed to pin thread" };
  }
}

export async function lockThread(threadId: string, isLocked: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.forumThread.update({
      where: { id: threadId },
      data: { isLocked },
    });

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Error locking thread:", error);
    return { success: false, error: "Failed to lock thread" };
  }
}

// ==================== BADGE SYSTEM ====================

export async function checkAndAwardBadges(userId: string) {
  try {
    const stats = await db.forumUserStats.findUnique({
      where: { userId },
    });

    if (!stats) return;

    const badges: { type: BadgeType; name: string; description: string }[] = [];

    // Check for badges based on stats
    if (stats.postCount >= 1 && stats.postCount < 10) {
      badges.push({
        type: BadgeType.NEWBIE,
        name: "Forum Newbie",
        description: "Made your first post",
      });
    }
    if (stats.postCount >= 10 && stats.postCount < 50) {
      badges.push({
        type: BadgeType.MEMBER,
        name: "Active Member",
        description: "Made 10+ posts",
      });
    }
    if (stats.postCount >= 100) {
      badges.push({
        type: BadgeType.VETERAN,
        name: "Forum Veteran",
        description: "Made 100+ posts",
      });
    }
    if (stats.helpfulCount >= 50) {
      badges.push({
        type: BadgeType.HELPER,
        name: "Helpful Member",
        description: "Received 50+ helpful reactions",
      });
    }
    if (stats.reputation >= 1000) {
      badges.push({
        type: BadgeType.EXPERT,
        name: "Forum Expert",
        description: "Earned 1000+ reputation",
      });
    }

    // Award badges that don't exist yet
    for (const badge of badges) {
      const existing = await db.forumBadge.findFirst({
        where: {
          userId,
          type: badge.type,
        },
      });

      if (!existing) {
        await db.forumBadge.create({
          data: {
            userId,
            type: badge.type,
            name: badge.name,
            description: badge.description,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
}

// ==================== TRENDING & POPULAR ====================

export async function getTrendingThreads(limit = 10) {
  try {
    const threads = await db.forumThread.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        category: true,
        subforum: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: [
        { views: "desc" },
        { postCount: "desc" },
      ],
      take: limit,
    });

    return threads;
  } catch (error) {
    console.error("Error fetching trending threads:", error);
    return [];
  }
}

export async function getForumStats() {
  try {
    const [totalThreads, totalPosts, totalUsers, recentThreads] =
      await Promise.all([
        db.forumThread.count(),
        db.forumPost.count({ where: { status: PostStatus.ACTIVE } }),
        db.forumUserStats.count(),
        db.forumThread.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
            category: true,
          },
        }),
      ]);

    return {
      totalThreads,
      totalPosts,
      totalUsers,
      recentThreads,
    };
  } catch (error) {
    console.error("Error fetching forum stats:", error);
    return {
      totalThreads: 0,
      totalPosts: 0,
      totalUsers: 0,
      recentThreads: [],
    };
  }
}
