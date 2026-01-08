import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const prisma = new PrismaClient();
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function syncImages() {
  const users = await prisma.user.findMany();
  console.log(`Syncing ${users.length} users...`);

  let updatedCount = 0;

  for (const user of users) {
    try {
        const clerkUser = await clerk.users.getUser(user.id);
        const clerkUrl = clerkUser.imageUrl;
        const dbUrl = user.picture;

        if (clerkUrl !== dbUrl) {
            console.log(`Updating ${user.email}:`);
            console.log(`   Old: ${dbUrl}`);
            console.log(`   New: ${clerkUrl}`);
            
            await prisma.user.update({
                where: { id: user.id },
                data: { picture: clerkUrl },
            });
            updatedCount++;
        }
    } catch (e) {
        console.error(`Error syncing ${user.email}:`, e);
    }
  }

  console.log(`\nSynced ${updatedCount} users.`);
}

syncImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
