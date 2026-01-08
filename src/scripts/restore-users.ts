import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Clerk
// Ensure CLERK_SECRET_KEY is set in your .env file
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function restoreUsers() {
  console.log("🚀 Starting User Restoration Process...");

  // 1. Fetch all users from local database
  const localUsers = await prisma.user.findMany();
  console.log(`Found ${localUsers.length} users in the local database.`);

  let successCount = 0;
  let failCount = 0;

  for (const user of localUsers) {
    console.log(`\nProcessing user: ${user.email} (Old ID: ${user.id})`);

    try {
      let newClerkId = "";
      let createdClerkUser = false;

      // 2. Check if user exists in Clerk or Create them
      try {
        const clerkUserList = await clerk.users.getUserList({
          emailAddress: [user.email],
        });

        if (clerkUserList.data.length > 0) {
          console.log("   User already exists in Clerk.");
          newClerkId = clerkUserList.data[0].id;
        } else {
          console.log("   Creating user in Clerk...");
          createdClerkUser = true;
          // Note: We cannot migrate passwords. Users will need to reset them.
          const newUser = await clerk.users.createUser({
            emailAddress: [user.email],
            firstName: user.name.split(" ")[0],
            lastName: user.name.split(" ").slice(1).join(" "),
            publicMetadata: {
              old_db_id: user.id, // Save old ID just in case
            },
            privateMetadata: {
              role: user.role, // Restore the role (ADMIN, SELLER, USER)
            },
            skipPasswordRequirement: true, // User must reset password or use magic link
          });
          newClerkId = newUser.id;
          console.log("   User created in Clerk.");
        }
      } catch (clerkError: any) {
        console.error("   Failed to create/fetch user in Clerk:", clerkError.errors || clerkError);
        failCount++;
        continue;
      }

      console.log(`   New Clerk ID: ${newClerkId}`);

      if (user.id === newClerkId) {
        console.log("   IDs already match. Skipping DB update.");
        successCount++;
        continue;
      }

      // 3. Update Database Records (The "Clone & Swap" Strategy)
      // We perform this in a transaction to ensure data integrity
      console.log("   Migrating database records...");

      try {
        await prisma.$transaction(async (tx) => {
          // A. Create a copy of the user with the NEW ID (or update if exists)
          // We use ON CONFLICT to handle race conditions where the webhook might have created the user
          await tx.$executeRaw`
            INSERT INTO "User" (
              "id", "name", "email", "picture", "role", "createdAt", "updatedAt"
            ) VALUES (
              ${newClerkId}, ${user.name}, ${`temp_${newClerkId}_${user.email}`}, ${user.picture}, ${user.role}::"Role", ${user.createdAt}, ${user.updatedAt}
            )
            ON CONFLICT ("id") DO UPDATE SET
              "name" = EXCLUDED."name",
              "picture" = EXCLUDED."picture",
              "role" = EXCLUDED."role",
              "createdAt" = EXCLUDED."createdAt",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          // Note: We use a temp email to avoid "Unique constraint" violation on email column during the swap

          // B. Update ALL Foreign Key references to point to the new ID
          // This list is based on your schema.prisma

          // 1. Store
          await tx.$executeRaw`UPDATE "Store" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;
          
          // 2. Review
          await tx.$executeRaw`UPDATE "Review" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 3. Cart
          await tx.$executeRaw`UPDATE "Cart" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 4. ShippingAddress
          await tx.$executeRaw`UPDATE "ShippingAddress" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 5. Order
          await tx.$executeRaw`UPDATE "Order" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 6. Wishlist
          await tx.$executeRaw`UPDATE "Wishlist" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 7. PaymentDetails
          await tx.$executeRaw`UPDATE "PaymentDetails" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 8. Subscription
          await tx.$executeRaw`UPDATE "Subscription" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 9. Advertisement
          await tx.$executeRaw`UPDATE "Advertisement" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 10. StoreApplication
          await tx.$executeRaw`UPDATE "StoreApplication" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 11. Forum Tables
          await tx.$executeRaw`UPDATE "ForumThread" SET "authorId" = ${newClerkId} WHERE "authorId" = ${user.id}`;
          await tx.$executeRaw`UPDATE "ForumThread" SET "lastPostById" = ${newClerkId} WHERE "lastPostById" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumPost" SET "authorId" = ${newClerkId} WHERE "authorId" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumReaction" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumBookmark" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumReport" SET "reporterId" = ${newClerkId} WHERE "reporterId" = ${user.id}`;
          await tx.$executeRaw`UPDATE "ForumReport" SET "reviewedById" = ${newClerkId} WHERE "reviewedById" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumModerator" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;
          // Note: assignedBy is just a string, but good to update if it matches
          await tx.$executeRaw`UPDATE "ForumModerator" SET "assignedBy" = ${newClerkId} WHERE "assignedBy" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumBadge" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;
          
          await tx.$executeRaw`UPDATE "ForumUserStats" SET "userId" = ${newClerkId} WHERE "userId" = ${user.id}`;

          // 12. Many-to-Many Relations (Implicit Tables)
          // _StoreMembers (A = Store, B = User)
          await tx.$executeRaw`UPDATE "_StoreMembers" SET "B" = ${newClerkId} WHERE "B" = ${user.id}`;
          
          // _UserFollowingStore (A = Store, B = User)
          await tx.$executeRaw`UPDATE "_UserFollowingStore" SET "B" = ${newClerkId} WHERE "B" = ${user.id}`;
          
          // _CouponToUser (A = Coupon, B = User)
          await tx.$executeRaw`UPDATE "_CouponToUser" SET "B" = ${newClerkId} WHERE "B" = ${user.id}`;


          // C. Delete the OLD user
          await tx.$executeRaw`DELETE FROM "User" WHERE "id" = ${user.id}`;

          // D. Fix the email on the NEW user (restore it from the temp value)
          // Also updating the email to be "example.com" ONLY for testing purposes if it was previously an example email
          // BUT the user asked for real emails. 
          // The issue is likely that the "user.email" coming from the database ALREADY has "example.com".
          // We are just restoring what is in the database.
          console.log(`   Restoring email to: ${user.email}`);
          await tx.$executeRaw`UPDATE "User" SET "email" = ${user.email} WHERE "id" = ${newClerkId}`;
        }, {
          timeout: 20000 // Increase timeout to 20s
        });
      } catch (txError) {
        // If transaction failed, we should try to clean up the newly created Clerk user to avoid "zombie" users in Clerk
        // that aren't linked to any DB record.
        console.error(`   ❌ Transaction failed for ${user.email}. Rolling back Clerk user...`);
        if (createdClerkUser) {
          try {
            await clerk.users.deleteUser(newClerkId);
            console.log(`   Rolled back Clerk user ${newClerkId}`);
          } catch (cleanupError) {
            console.error(`   Failed to rollback Clerk user:`, cleanupError);
          }
        } else {
          console.log(`   Skipping Clerk user rollback as it was not created in this session.`);
        }
        throw txError; // Re-throw to be caught by the outer catch block
      }

      console.log("   ✅ Migration successful!");
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to migrate user ${user.email}:`, error);
      failCount++;
    }
  }

  console.log("\n=================================");
  console.log(`Process Complete.`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("=================================");
}

restoreUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
