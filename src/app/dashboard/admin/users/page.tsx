import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import UsersPageClient from './client'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const { role, search } = await searchParams

  // Build where clause for filtering
  const where: any = {}
  
  if (role && role !== 'all') {
    where.role = role.toUpperCase()
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Fetch users with their related data
  const users = await db.user.findMany({
    where,
    include: {
      _count: {
        select: {
          orders: true,
          stores: true,
          carListings: true,
          carSubscriptions: true,
          reviews: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Get user stats
  const totalUsers = await db.user.count()
  const usersByRole = await db.user.groupBy({
    by: ['role'],
    _count: { role: true }
  })

  // Get recent signups (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentSignups = await db.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  const stats = {
    total: totalUsers,
    recentSignups,
    byRole: usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role
      return acc
    }, {} as Record<string, number>)
  }

  return <UsersPageClient users={users} stats={stats} />
}
