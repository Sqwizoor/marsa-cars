import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkImages() {
  const users = await prisma.user.findMany({
    take: 20,
    select: {
      id: true,
      email: true,
      picture: true,
    },
  });

  console.log("Checking first 20 user images:");
  for (const user of users) {
    console.log(`User: ${user.email}`);
    console.log(`  Picture: ${user.picture}`);
    console.log("---");
  }
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
