/**
 * Neon (PostgreSQL / Prisma) -> Convex Data Migration Script
 *
 * Usage (when ready to transfer data later):
 *   npx tsx scripts/migrate-neon-to-convex.ts
 *
 * Requires:
 *   - DATABASE_URL (Neon PostgreSQL connection string)
 *   - NEXT_PUBLIC_CONVEX_URL (Convex deployment URL)
 */
import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const prisma = new PrismaClient();

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set in environment variables."
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const BATCH_SIZE = 100;

  async function migrateTable(tableName: string, records: any[]) {
    console.log(`Migrating ${records.length} records to "${tableName}"...`);
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const res = await convex.mutation(api.migration.importBatch, {
        table: tableName,
        records: batch,
      });
      inserted += res.inserted;
      updated += res.updated;
    }

    console.log(
      `  ✓ ${tableName}: ${inserted} inserted, ${updated} updated.`
    );
  }

  console.log("=== Starting Neon -> Convex Data Migration ===");

  // 1. Users (with many-to-many relations)
  const storesWithMembers = await prisma.store.findMany({
    include: {
      followers: { select: { id: true } },
      members: { select: { id: true } },
    },
  });
  const users = await prisma.user.findMany({
    include: {
      following: { select: { id: true } },
    },
  });
  await migrateTable(
    "users",
    users.map(({ following, ...u }) => ({
      ...u,
      followingStoreIds: following.map((s: { id: string }) => s.id),
      memberStoreIds: storesWithMembers
        .filter((s) => s.members.some((m: { id: string }) => m.id === u.id))
        .map((s) => s.id),
    }))
  );

  // 2. Countries
  await migrateTable("countries", await prisma.country.findMany());

  // 3. Categories & SubCategories & OfferTags
  await migrateTable("categories", await prisma.category.findMany());
  await migrateTable("subCategories", await prisma.subCategory.findMany());
  await migrateTable("offerTags", await prisma.offerTag.findMany());

  // 4. Stores
  await migrateTable(
    "stores",
    storesWithMembers.map(({ followers, members, ...s }) => ({
      ...s,
      followerIds: followers.map((u: { id: string }) => u.id),
      memberIds: members.map((u: { id: string }) => u.id),
    }))
  );

  // 5. Products & Variants & Related
  await migrateTable("products", await prisma.product.findMany());
  await migrateTable("productVariants", await prisma.productVariant.findMany());
  await migrateTable("sizes", await prisma.size.findMany());
  await migrateTable(
    "productVariantImages",
    await prisma.productVariantImage.findMany()
  );
  await migrateTable("colors", await prisma.color.findMany());
  await migrateTable("specs", await prisma.spec.findMany());
  await migrateTable("questions", await prisma.question.findMany());

  // 6. Shipping & FreeShipping
  await migrateTable("shippingRates", await prisma.shippingRate.findMany());
  await migrateTable("freeShippings", await prisma.freeShipping.findMany());
  await migrateTable(
    "freeShippingCountries",
    await prisma.freeShippingCountry.findMany()
  );

  // 7. Reviews
  await migrateTable("reviews", await prisma.review.findMany());
  await migrateTable("reviewImages", await prisma.reviewImage.findMany());

  // 8. Carts, Wishlists, Coupons, ShippingAddresses
  await migrateTable("carts", await prisma.cart.findMany());
  await migrateTable("cartItems", await prisma.cartItem.findMany());
  await migrateTable(
    "shippingAddresses",
    await prisma.shippingAddress.findMany()
  );
  await migrateTable("wishlists", await prisma.wishlist.findMany());
  const coupons = await prisma.coupon.findMany({
    include: { users: { select: { id: true } } },
  });
  await migrateTable(
    "coupons",
    coupons.map(({ users: couponUsers, ...c }) => ({
      ...c,
      userIds: couponUsers.map((u) => u.id),
    }))
  );

  // 9. Orders & Payments
  await migrateTable("orders", await prisma.order.findMany());
  await migrateTable("orderGroups", await prisma.orderGroup.findMany());
  await migrateTable("orderItems", await prisma.orderItem.findMany());
  await migrateTable("paymentDetails", await prisma.paymentDetails.findMany());

  // 10. Subscriptions, Applications, Advertisements
  await migrateTable("subscriptions", await prisma.subscription.findMany());
  await migrateTable(
    "storeApplications",
    await prisma.storeApplication.findMany()
  );
  await migrateTable("advertisements", await prisma.advertisement.findMany());

  // 11. Forum
  await migrateTable("forumCategories", await prisma.forumCategory.findMany());
  await migrateTable("forumSubforums", await prisma.forumSubforum.findMany());
  await migrateTable("forumThreads", await prisma.forumThread.findMany());
  await migrateTable("forumPosts", await prisma.forumPost.findMany());
  await migrateTable("forumReactions", await prisma.forumReaction.findMany());
  await migrateTable("forumBookmarks", await prisma.forumBookmark.findMany());
  await migrateTable("forumReports", await prisma.forumReport.findMany());
  await migrateTable("forumModerators", await prisma.forumModerator.findMany());
  await migrateTable("forumBadges", await prisma.forumBadge.findMany());
  await migrateTable("forumUserStats", await prisma.forumUserStats.findMany());

  // 12. Cars Marketplace, Articles, Part Requests
  await migrateTable(
    "carSubscriptions",
    await prisma.carSubscription.findMany()
  );
  await migrateTable("carListings", await prisma.carListing.findMany());
  await migrateTable("carImages", await prisma.carImage.findMany());
  await migrateTable("carInquiries", await prisma.carInquiry.findMany());
  await migrateTable("articles", await prisma.article.findMany());
  await migrateTable("partRequests", await prisma.partRequest.findMany());
  try {
    await migrateTable(
      "shipmentTrackings",
      await (prisma as any).shipmentTracking.findMany()
    );
  } catch {
    console.log("  ℹ Skipping shipmentTrackings (table not created in Neon yet).");
  }

  const stats = await convex.query(api.migration.getMigrationStats, {});
  console.log("\n=== Migration Complete! Convex Table Counts ===");
  console.table(stats);
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
