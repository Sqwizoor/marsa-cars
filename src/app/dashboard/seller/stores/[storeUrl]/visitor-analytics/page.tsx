import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VisitorAnalyticsClient from './client'

interface Props {
  params: Promise<{ storeUrl: string }>
}

export default async function StoreVisitorAnalyticsPage({ params }: Props) {
  const { storeUrl } = await params
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // Get the store by URL
  const store = await db.store.findFirst({
    where: {
      url: storeUrl,
      userId: user.id
    },
    select: {
      id: true,
      name: true,
    }
  })

  if (!store) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600">This store does not exist or you don't have access.</p>
        </div>
      </div>
    )
  }

  return <VisitorAnalyticsClient store={store} />
}
