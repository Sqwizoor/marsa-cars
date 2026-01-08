import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkRelations() {
  const userId = "user_37vWeXMr6yjYqUjzKrxeiu6RdUr";
  
  const orders = await prisma.order.count({ where: { userId } });
  const reviews = await prisma.review.count({ where: { userId } });
  const stores = await prisma.store.count({ where: { userId } });
  const carts = await prisma.cart.count({ where: { userId } });
  
  console.log(`User ${userId} has:`);
  console.log(`- Orders: ${orders}`);
  console.log(`- Reviews: ${reviews}`);
  console.log(`- Stores: ${stores}`);
  console.log(`- Carts: ${carts}`);
}

checkRelations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
