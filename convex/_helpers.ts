import { QueryCtx, MutationCtx } from "./_generated/server";
import { TableNames, Doc, Id } from "./_generated/dataModel";

/**
 * Generate a UUID v4 compatible string for prismaId compatibility
 */
export function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert a Convex document to Prisma-compatible shape for seamless frontend compatibility
 */
export function toPrismaShape<T extends Record<string, any>>(
  doc: T | null | undefined
): (T & { id: string; createdAt: string; updatedAt: string }) | null {
  if (!doc) return null;
  const id = doc.prismaId || String(doc._id);
  const createdAt =
    typeof doc.createdAt === "number"
      ? new Date(doc.createdAt).toISOString()
      : doc.createdAt || new Date(doc._creationTime).toISOString();
  const updatedAt =
    typeof doc.updatedAt === "number"
      ? new Date(doc.updatedAt).toISOString()
      : doc.updatedAt || createdAt;

  return {
    ...doc,
    id,
    createdAt,
    updatedAt,
  };
}

/**
 * Look up a document by either its `prismaId` (UUID / Clerk ID) or Convex `_id`
 */
export async function findById<T extends TableNames>(
  ctx: QueryCtx | MutationCtx,
  table: T,
  id: string | undefined | null
): Promise<Doc<T> | null> {
  if (!id) return null;

  // 1. Try by_prisma_id index first
  const byPrisma = await (ctx.db.query(table) as any)
    .withIndex("by_prisma_id", (q: any) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma as Doc<T>;

  // 2. Fallback to Convex _id if valid for this table
  const normalizedId = ctx.db.normalizeId(table, id);
  if (normalizedId) {
    const byConvexId = await ctx.db.get(normalizedId);
    if (byConvexId) return byConvexId as Doc<T>;
  }

  return null;
}

/**
 * Resolve current user ID from Convex auth identity or explicit server-provided userId
 */
export async function resolveUserId(
  ctx: QueryCtx | MutationCtx,
  explicitUserId?: string
): Promise<string | null> {
  if (explicitUserId) return explicitUserId;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // Clerk subject is the Clerk user.id (e.g. "user_2abc...")
  return identity.subject;
}
