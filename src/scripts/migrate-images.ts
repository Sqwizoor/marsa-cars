import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const prisma = new PrismaClient();
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function migrateImages() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    if (!user.picture) continue;

    console.log(`Processing ${user.email} (${user.id})...`);

    // We want to migrate ALL images now, as requested by the user.
    // Even "default" Clerk images from the old user should be preserved if possible,
    // or at least we shouldn't filter them out if the user wants "all" of them.
    // However, re-uploading a default initial image will make it a "custom" image on the new profile.
    
    console.log(`  Migrating image: ${user.picture}`);
    
    try {
        // Fetch image
        // Handle potential malformed URLs like "httpt..."
        let url = user.picture;
        if (!url.startsWith("http")) {
            // Try to fix common typos if possible, or just skip
            if (url.startsWith("httpt")) {
                 url = "http" + url.substring(5);
            } else {
                console.error(`  Invalid URL format: ${url}`);
                continue;
            }
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`  Failed to fetch image: ${response.status} ${response.statusText}`);
            continue;
        }
        
        const blob = await response.blob();
        
        // Upload to Clerk
        // user.id should be the Clerk ID now
        await clerk.users.updateUserProfileImage(user.id, {
            file: blob,
        });
        console.log("  ✅ Image uploaded to Clerk.");
        
    } catch (error) {
        console.error("  ❌ Failed to migrate image:", error);
    }
  }
}

migrateImages()
  .catch((e) => {
      console.error(e);
      process.exit(1);
  })
  .finally(() => prisma.$disconnect());
