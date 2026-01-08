import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findCustomImages() {
  const users = await prisma.user.findMany();
  
  let customCount = 0;
  for (const user of users) {
    if (!user.picture.includes("img.clerk.com")) {
      console.log(`User ${user.email} has custom image: ${user.picture}`);
      customCount++;
    } else {
        // Decode the base64 part to see if it is type: default
        const parts = user.picture.split("/");
        const lastPart = parts[parts.length - 1];
        try {
            const decoded = atob(lastPart);
            if (!decoded.includes('"type":"default"')) {
                console.log(`User ${user.email} has Clerk NON-DEFAULT image: ${user.picture}`);
                customCount++;
            }
        } catch (e) {
            // ignore
        }
    }
  }
  
  if (customCount === 0) {
      console.log("No custom images found. All users have default Clerk images.");
  }
}

findCustomImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
