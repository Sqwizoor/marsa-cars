import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { TableNames } from "./_generated/dataModel";

/**
 * Generic idempotent batch importer for transferring data from Neon/Prisma into Convex.
 * Preserves `prismaId` (original UUID / Clerk ID) and timestamps.
 */
export const importBatch = mutation({
  args: {
    table: v.string(),
    records: v.array(v.any()),
  },
  handler: async (ctx, { table, records }) => {
    const tableName = table as TableNames;
    let inserted = 0;
    let updated = 0;

    for (const record of records) {
      const prismaId = String(record.prismaId || record.id);
      const existing = await (ctx.db.query(tableName) as any)
        .withIndex("by_prisma_id", (q: any) => q.eq("prismaId", prismaId))
        .first();

      const { id, _id, _creationTime, ...rest } = record;
      const payload = {
        ...rest,
        prismaId,
        createdAt:
          typeof record.createdAt === "number"
            ? record.createdAt
            : record.createdAt
              ? new Date(record.createdAt).getTime()
              : Date.now(),
        updatedAt:
          typeof record.updatedAt === "number"
            ? record.updatedAt
            : record.updatedAt
              ? new Date(record.updatedAt).getTime()
              : Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, payload);
        updated++;
      } else {
        await ctx.db.insert(tableName, payload as any);
        inserted++;
      }
    }

    return { table, inserted, updated };
  },
});

export const getMigrationStats = query({
  args: {},
  handler: async (ctx) => {
    const tables: TableNames[] = [
      "users",
      "categories",
      "subCategories",
      "stores",
      "products",
      "productVariants",
      "sizes",
      "productVariantImages",
      "colors",
      "offerTags",
      "specs",
      "questions",
      "countries",
      "shippingRates",
      "freeShippings",
      "freeShippingCountries",
      "reviews",
      "reviewImages",
      "carts",
      "cartItems",
      "shippingAddresses",
      "orders",
      "orderGroups",
      "orderItems",
      "wishlists",
      "coupons",
      "paymentDetails",
      "subscriptions",
      "storeApplications",
      "advertisements",
      "forumCategories",
      "forumSubforums",
      "forumThreads",
      "forumPosts",
      "forumReactions",
      "forumBookmarks",
      "forumReports",
      "forumModerators",
      "forumBadges",
      "forumUserStats",
      "carSubscriptions",
      "carListings",
      "carImages",
      "carInquiries",
      "articles",
      "partRequests",
      "shipmentTrackings",
    ];

    const counts: Record<string, number> = {};
    for (const t of tables) {
      const docs = await ctx.db.query(t).collect();
      counts[t] = docs.length;
    }
    return counts;
  },
});
