import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDuplicates() {
  const users = await prisma.user.findMany();
  const emailMap = new Map<string, any[]>();

  for (const user of users) {
    if (!emailMap.has(user.email)) {
      emailMap.set(user.email, []);
    }
    emailMap.get(user.email)?.push(user);
  }

  let duplicatesFound = 0;
  for (const [email, userList] of emailMap.entries()) {
    if (userList.length > 1) {
      console.log(`Duplicate email found: ${email}`);
      duplicatesFound++;
      for (const u of userList) {
        console.log(`  - ID: ${u.id}, Role: ${u.role}, CreatedAt: ${u.createdAt}`);
      }
      
      // We can optionally delete the newer ones (Zombies)
      // The old ones have ID starting with 'user_' usually? 
      // Actually Clerk IDs also start with 'user_'.
      // But the OLD IDs in the logs looked like 'user_37vLUeU3...'
      // The NEW Clerk IDs looked like 'user_37vWeXMr...'
      // The zombies will have the NEW ID format.
      // We should keep the one that has relations? Or just the oldest one?
    }
  }

  if (duplicatesFound === 0) {
    console.log("No duplicate emails found.");
  }
}

checkDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
