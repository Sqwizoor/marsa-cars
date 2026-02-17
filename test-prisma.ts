
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('Article model exists:', !!prisma.article);
  await prisma.$disconnect();
}

main();
