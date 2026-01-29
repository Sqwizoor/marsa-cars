import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SellerAnalyticsClient from './client'

export default async function SellerAnalyticsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // Get user's stores
  const stores = await db.store.findMany({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      name: true,
    }
  })

  if (stores.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Store Found</h1>
          <p className="text-gray-600">You need to create a store first to view analytics.</p>
        </div>
      </div>
    )
  }

  return <SellerAnalyticsClient stores={stores} />
}
