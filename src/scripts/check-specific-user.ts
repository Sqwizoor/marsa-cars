import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSpecificUser() {
  const id = "user_37vWeXMr6yjYqUjzKrxeiu6RdUr";
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (user) {
    console.log("Found user by ID:", user);
  } else {
    console.log("User not found by ID.");
  }
  
  const email = "mary.lopez7175@example.com";
  const userByEmail = await prisma.user.findUnique({
    where: { email },
  });
  
  if (userByEmail) {
    console.log("Found user by Email:", userByEmail);
  } else {
    console.log("User not found by Email.");
  }
}

checkSpecificUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
