
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const store = await prisma.store.findFirst({
    include: {
        members: true
    }
  })
}

main()
