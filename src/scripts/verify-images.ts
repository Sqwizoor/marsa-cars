import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const prisma = new PrismaClient();
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function verifyImages() {
  // Check ALL users
  const users = await prisma.user.findMany();
  console.log(`Checking ${users.length} users...`);

  let mismatchCount = 0;
  let brokenUrlCount = 0;
  let successCount = 0;

  for (const user of users) {
    // console.log(`Processing ${user.email}...`);
    
    // Fetch Clerk User
    try {
        const clerkUser = await clerk.users.getUser(user.id);
        const clerkUrl = clerkUser.imageUrl;
        const dbUrl = user.picture;

        let isMismatch = false;
        if (clerkUrl !== dbUrl) {
            console.log(`❌ Mismatch for ${user.email}:`);
            console.log(`   DB:    ${dbUrl}`);
            console.log(`   Clerk: ${clerkUrl}`);
            isMismatch = true;
            mismatchCount++;
        }

        // Check accessibility of the DB URL
        // We only check DB URL because that's what the app uses
        try {
            const res = await fetch(dbUrl);
            if (!res.ok) {
                console.log(`❌ Broken DB URL for ${user.email}: ${res.status} ${res.statusText}`);
                brokenUrlCount++;
            } else {
                // Read a bit of the body to ensure it's not a streaming error, then discard
                await res.arrayBuffer(); 
                if (!isMismatch) successCount++;
            }
        } catch (e: any) {
            console.log(`❌ Error fetching DB URL for ${user.email}: ${e.message}`);
            brokenUrlCount++;
        }

    } catch (e: any) {
        console.log(`❌ Error fetching Clerk user ${user.id} (${user.email}): ${e.message}`);
    }
  }

  console.log("\nSummary:");
  console.log(`Total Users: ${users.length}`);
  console.log(`Success (Match + Valid): ${successCount}`);
  console.log(`Mismatches: ${mismatchCount}`);
  console.log(`Broken DB URLs: ${brokenUrlCount}`);
}

verifyImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
