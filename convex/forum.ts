import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import {
  reactionTypeValidator,
  reportReasonValidator,
  badgeTypeValidator,
} from "./schema";

// ==================== CATEGORY & SUBFORUM ====================

export const getForumCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("forumCategories").collect();
    const active = categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.order - b.order);

    return await Promise.all(
      active.map(async (cat) => {
        const subforums = await ctx.db
          .query("forumSubforums")
          .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
          .collect();
        const activeSubs = subforums
          .filter((s) => s.isActive)
          .sort((a, b) => a.order - b.order);

        const subsEnriched = await Promise.all(
          activeSubs.map(async (sub) => {
            const threads = await ctx.db
              .query("forumThreads")
              .withIndex("by_subforum_id", (q) =>
                q.eq("subforumId", sub.prismaId)
              )
              .collect();
            return {
              ...toPrismaShape(sub)!,
              _count: { threads: threads.length },
            };
          })
        );

        const catThreads = await ctx.db
          .query("forumThreads")
          .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
          .collect();

        return {
          ...toPrismaShape(cat)!,
          subforums: subsEnriched,
          _count: { threads: catThreads.length },
        };
      })
    );
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!category) return null;

    const subforums = await ctx.db
      .query("forumSubforums")
      .withIndex("by_category_id", (q) => q.eq("categoryId", category.prismaId))
      .collect();
    const activeSubs = subforums
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order);

    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category_id", (q) => q.eq("categoryId", category.prismaId))
      .collect();

    return {
      ...toPrismaShape(category)!,
      subforums: activeSubs.map((s) => toPrismaShape(s)!),
      _count: { threads: threads.length },
    };
  },
});

export const getSubforumBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const subforum = await ctx.db
      .query("forumSubforums")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!subforum) return null;

    const category = await findById(
      ctx,
      "forumCategories",
      subforum.categoryId
    );
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_subforum_id", (q) => q.eq("subforumId", subforum.prismaId))
      .collect();

    return {
      ...toPrismaShape(subforum)!,
      category: toPrismaShape(category),
      _count: { threads: threads.length },
    };
  },
});

// ==================== THREADS ====================

async function enrichThread(ctx: any, thread: any) {
  const author = await findById(ctx, "users", thread.authorId);
  const category = await findById(ctx, "forumCategories", thread.categoryId);
  const subforum = thread.subforumId
    ? await findById(ctx, "forumSubforums", thread.subforumId)
    : null;
  const lastPostBy = thread.lastPostById
    ? await findById(ctx, "users", thread.lastPostById)
    : null;
  const posts = await ctx.db
    .query("forumPosts")
    .withIndex("by_thread_id", (q: any) => q.eq("threadId", thread.prismaId))
    .collect();
  const bookmarks = await ctx.db
    .query("forumBookmarks")
    .withIndex("by_thread_id", (q: any) => q.eq("threadId", thread.prismaId))
    .collect();

  return {
    ...toPrismaShape(thread)!,
    lastPostAt: new Date(thread.lastPostAt).toISOString(),
    author: author
      ? { id: author.prismaId, name: author.name, picture: author.picture }
      : { id: thread.authorId, name: "User", picture: "" },
    category: category
      ? {
          id: category.prismaId,
          name: category.name,
          slug: category.slug,
          color: category.color,
        }
      : null,
    subforum: subforum
      ? { id: subforum.prismaId, name: subforum.name, slug: subforum.slug }
      : null,
    lastPostBy: lastPostBy
      ? {
          id: lastPostBy.prismaId,
          name: lastPostBy.name,
          picture: lastPostBy.picture,
        }
      : null,
    _count: {
      posts: posts.length,
      bookmarks: bookmarks.length,
    },
  };
}

export const getThreads = query({
  args: {
    categoryId: v.optional(v.string()),
    subforumId: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    order: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 20;
    const sortBy = args.sortBy || "lastPostAt";
    const order = args.order || "desc";

    let threads = await ctx.db.query("forumThreads").collect();

    if (args.categoryId)
      threads = threads.filter((t) => t.categoryId === args.categoryId);
    if (args.subforumId)
      threads = threads.filter((t) => t.subforumId === args.subforumId);
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      threads = threads.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
      );
    }
    if (args.tags && args.tags.length > 0) {
      threads = threads.filter((t) =>
        t.tags.some((tag) => args.tags!.includes(tag))
      );
    }

    threads.sort((a: any, b: any) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const valA = a[sortBy] ?? a.lastPostAt;
      const valB = b[sortBy] ?? b.lastPostAt;
      return order === "asc" ? valA - valB : valB - valA;
    });

    const total = threads.length;
    const paged = threads.slice((page - 1) * limit, page * limit);
    const enriched = await Promise.all(paged.map((t) => enrichThread(ctx, t)));

    return {
      threads: enriched,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  },
});

export const getThreadBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const thread = await ctx.db
      .query("forumThreads")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!thread) return null;

    const enriched = await enrichThread(ctx, thread);
    const authorStats = await ctx.db
      .query("forumUserStats")
      .withIndex("by_user_id", (q) => q.eq("userId", thread.authorId))
      .first();

    return {
      ...enriched,
      author: {
        ...enriched.author,
        forumStats: toPrismaShape(authorStats),
      },
    };
  },
});

export const createThread = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    categoryId: v.string(),
    subforumId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const slug =
      args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      now.toString(36);

    const prismaId = generateUuid();
    const newId = await ctx.db.insert("forumThreads", {
      prismaId,
      title: args.title,
      content: args.content,
      slug,
      status: "OPEN",
      views: 0,
      isPinned: false,
      isLocked: false,
      isFeatured: false,
      isAnnouncement: false,
      tags: args.tags || [],
      authorId: args.userId,
      categoryId: args.categoryId,
      subforumId: args.subforumId,
      postCount: 0,
      lastPostAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const stats = await ctx.db
      .query("forumUserStats")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    if (stats) {
      await ctx.db.patch(stats._id, {
        threadCount: stats.threadCount + 1,
        reputation: stats.reputation + 5,
        lastActiveAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("forumUserStats", {
        prismaId: generateUuid(),
        userId: args.userId,
        threadCount: 1,
        postCount: 0,
        reactionCount: 0,
        helpfulCount: 0,
        reputation: 5,
        totalViews: 0,
        lastActiveAt: now,
        acceptedAnswers: 0,
        bestAnswers: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (args.subforumId) {
      const sub = await findById(ctx, "forumSubforums", args.subforumId);
      if (sub) {
        await ctx.db.patch(sub._id, {
          threadCount: sub.threadCount + 1,
          updatedAt: now,
        });
      }
    }

    const created = await ctx.db.get(newId);
    return { success: true, thread: await enrichThread(ctx, created) };
  },
});

export const updateThread = mutation({
  args: {
    threadId: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const thread = await findById(ctx, "forumThreads", args.threadId);
    if (!thread || thread.authorId !== args.userId) {
      return { success: false, error: "Unauthorized" };
    }

    await ctx.db.patch(thread._id, {
      title: args.title ?? thread.title,
      content: args.content ?? thread.content,
      tags: args.tags ?? thread.tags,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(thread._id);
    return { success: true, thread: toPrismaShape(updated) };
  },
});

export const deleteThread = mutation({
  args: { threadId: v.string(), userId: v.string() },
  handler: async (ctx, { threadId }) => {
    const thread = await findById(ctx, "forumThreads", threadId);
    if (!thread) return { success: false, error: "Thread not found" };
    await ctx.db.delete(thread._id);
    return { success: true };
  },
});

// ==================== POSTS & REACTIONS ====================

export const getPosts = query({
  args: {
    threadId: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, page = 1, limit = 20 }) => {
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_thread_id", (q) => q.eq("threadId", threadId))
      .collect();

    const rootPosts = posts
      .filter((p) => !p.parentPostId && p.status !== "DELETED")
      .sort((a, b) => a.createdAt - b.createdAt);

    const total = rootPosts.length;
    const paged = rootPosts.slice((page - 1) * limit, page * limit);

    const enriched = await Promise.all(
      paged.map(async (post) => {
        const author = await findById(ctx, "users", post.authorId);
        const authorStats = await ctx.db
          .query("forumUserStats")
          .withIndex("by_user_id", (q) => q.eq("userId", post.authorId))
          .first();
        const badges = await ctx.db
          .query("forumBadges")
          .withIndex("by_user_id", (q) => q.eq("userId", post.authorId))
          .collect();
        const reactions = await ctx.db
          .query("forumReactions")
          .withIndex("by_post_id", (q) => q.eq("postId", post.prismaId))
          .collect();
        const repliesRaw = posts
          .filter((r) => r.parentPostId === post.prismaId)
          .sort((a, b) => a.createdAt - b.createdAt);

        const replies = await Promise.all(
          repliesRaw.map(async (rep) => {
            const repAuthor = await findById(ctx, "users", rep.authorId);
            return {
              ...toPrismaShape(rep)!,
              author: repAuthor
                ? {
                    id: repAuthor.prismaId,
                    name: repAuthor.name,
                    picture: repAuthor.picture,
                  }
                : { id: rep.authorId, name: "User", picture: "" },
            };
          })
        );

        return {
          ...toPrismaShape(post)!,
          author: author
            ? {
                id: author.prismaId,
                name: author.name,
                picture: author.picture,
                forumStats: toPrismaShape(authorStats),
                forumBadges: badges.map((b) => toPrismaShape(b)!),
              }
            : { id: post.authorId, name: "User", picture: "" },
          reactions: reactions.map((r) => toPrismaShape(r)!),
          replies,
        };
      })
    );

    return {
      posts: enriched,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  },
});

export const createPost = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    content: v.string(),
    parentPostId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const thread = await findById(ctx, "forumThreads", args.threadId);
    if (!thread) return { success: false, error: "Thread not found" };
    if (thread.isLocked) return { success: false, error: "Thread is locked" };

    const now = Date.now();
    const prismaId = generateUuid();
    const newId = await ctx.db.insert("forumPosts", {
      prismaId,
      content: args.content,
      status: "ACTIVE",
      isEdited: false,
      isAcceptedAnswer: false,
      authorId: args.userId,
      threadId: thread.prismaId,
      parentPostId: args.parentPostId,
      reactionCount: 0,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(thread._id, {
      postCount: thread.postCount + 1,
      lastPostAt: now,
      lastPostById: args.userId,
      updatedAt: now,
    });

    const created = await ctx.db.get(newId);
    return { success: true, post: toPrismaShape(created) };
  },
});

export const updatePost = mutation({
  args: { postId: v.string(), userId: v.string(), content: v.string() },
  handler: async (ctx, { postId, userId, content }) => {
    const post = await findById(ctx, "forumPosts", postId);
    if (!post || post.authorId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    const now = Date.now();
    await ctx.db.patch(post._id, {
      content,
      isEdited: true,
      editedAt: now,
      status: "EDITED",
      updatedAt: now,
    });
    const updated = await ctx.db.get(post._id);
    return { success: true, post: toPrismaShape(updated) };
  },
});

export const deletePost = mutation({
  args: { postId: v.string() },
  handler: async (ctx, { postId }) => {
    const post = await findById(ctx, "forumPosts", postId);
    if (!post) return { success: false, error: "Post not found" };
    await ctx.db.delete(post._id);
    return { success: true };
  },
});

export const toggleReaction = mutation({
  args: {
    userId: v.string(),
    postId: v.string(),
    type: reactionTypeValidator,
  },
  handler: async (ctx, { userId, postId, type }) => {
    const existing = await ctx.db
      .query("forumReactions")
      .withIndex("by_user_post_type", (q) =>
        q.eq("userId", userId).eq("postId", postId).eq("type", type)
      )
      .first();

    const post = await findById(ctx, "forumPosts", postId);
    const now = Date.now();

    if (existing) {
      await ctx.db.delete(existing._id);
      if (post) {
        await ctx.db.patch(post._id, {
          reactionCount: Math.max(0, post.reactionCount - 1),
          updatedAt: now,
        });
      }
      return { success: true, action: "removed" };
    }

    await ctx.db.insert("forumReactions", {
      prismaId: generateUuid(),
      userId,
      postId,
      type,
      createdAt: now,
    });
    if (post) {
      await ctx.db.patch(post._id, {
        reactionCount: post.reactionCount + 1,
        updatedAt: now,
      });
    }
    return { success: true, action: "added" };
  },
});

export const getPostReactions = query({
  args: { postId: v.string() },
  handler: async (ctx, { postId }) => {
    const reactions = await ctx.db
      .query("forumReactions")
      .withIndex("by_post_id", (q) => q.eq("postId", postId))
      .collect();
    return reactions.map((r) => toPrismaShape(r)!);
  },
});

export const toggleBookmark = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { userId, threadId, notes }) => {
    const existing = await ctx.db
      .query("forumBookmarks")
      .withIndex("by_user_thread", (q) =>
        q.eq("userId", userId).eq("threadId", threadId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true, bookmarked: false };
    }

    const now = Date.now();
    await ctx.db.insert("forumBookmarks", {
      prismaId: generateUuid(),
      userId,
      threadId,
      notes,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, bookmarked: true };
  },
});

export const getUserBookmarks = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const bookmarks = await ctx.db
      .query("forumBookmarks")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      bookmarks.map(async (b) => {
        const thread = await findById(ctx, "forumThreads", b.threadId);
        return {
          ...toPrismaShape(b)!,
          thread: thread ? await enrichThread(ctx, thread) : null,
        };
      })
    );
  },
});

export const getUserForumStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const stats = await ctx.db
      .query("forumUserStats")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    return toPrismaShape(stats);
  },
});

export const getUserForumActivity = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 10 }) => {
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect();
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect();

    threads.sort((a, b) => b.createdAt - a.createdAt);
    posts.sort((a, b) => b.createdAt - a.createdAt);

    return {
      threads: threads.slice(0, limit).map((t) => toPrismaShape(t)!),
      posts: posts.slice(0, limit).map((p) => toPrismaShape(p)!),
    };
  },
});

export const searchForum = query({
  args: { query: v.string() },
  handler: async (ctx, { query: qStr }) => {
    const q = qStr.toLowerCase();
    const threads = await ctx.db.query("forumThreads").collect();
    const matchedThreads = threads
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
      )
      .slice(0, 20);

    const posts = await ctx.db.query("forumPosts").collect();
    const matchedPosts = posts
      .filter((p) => p.content.toLowerCase().includes(q))
      .slice(0, 20);

    return {
      threads: await Promise.all(
        matchedThreads.map((t) => enrichThread(ctx, t))
      ),
      posts: matchedPosts.map((p) => toPrismaShape(p)!),
    };
  },
});

export const reportContent = mutation({
  args: {
    reporterId: v.string(),
    reason: reportReasonValidator,
    description: v.optional(v.string()),
    threadId: v.optional(v.string()),
    postId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("forumReports", {
      prismaId: generateUuid(),
      reporterId: args.reporterId,
      reason: args.reason,
      status: "PENDING",
      description: args.description,
      threadId: args.threadId,
      postId: args.postId,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  },
});

export const getPendingReports = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("forumReports")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();
    return reports.map((r) => toPrismaShape(r)!);
  },
});

export const pinThread = mutation({
  args: { threadId: v.string(), isPinned: v.boolean() },
  handler: async (ctx, { threadId, isPinned }) => {
    const thread = await findById(ctx, "forumThreads", threadId);
    if (!thread) return { success: false };
    await ctx.db.patch(thread._id, { isPinned, updatedAt: Date.now() });
    return { success: true };
  },
});

export const lockThread = mutation({
  args: { threadId: v.string(), isLocked: v.boolean() },
  handler: async (ctx, { threadId, isLocked }) => {
    const thread = await findById(ctx, "forumThreads", threadId);
    if (!thread) return { success: false };
    await ctx.db.patch(thread._id, { isLocked, updatedAt: Date.now() });
    return { success: true };
  },
});

export const getTrendingThreads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const threads = await ctx.db.query("forumThreads").collect();
    threads.sort((a, b) => b.views + b.postCount * 3 - (a.views + a.postCount * 3));
    return await Promise.all(
      threads.slice(0, limit).map((t) => enrichThread(ctx, t))
    );
  },
});

export const getForumStats = query({
  args: {},
  handler: async (ctx) => {
    const [threads, posts, users] = await Promise.all([
      ctx.db.query("forumThreads").collect(),
      ctx.db.query("forumPosts").collect(),
      ctx.db.query("users").collect(),
    ]);

    return {
      totalThreads: threads.length,
      totalPosts: posts.length,
      totalMembers: users.length,
      newestMember: users.sort((a, b) => b.createdAt - a.createdAt)[0]
        ? {
            name: users[0].name,
            createdAt: new Date(users[0].createdAt).toISOString(),
          }
        : null,
    };
  },
});
