'use client'

import { useUser } from '@clerk/nextjs'
import { CarAnalyticsDashboard } from '@/components/analytics/CarAnalyticsDashboard'
import { BarChart3 } from 'lucide-react'

export default function SellerAnalyticsPage() {
  const { user } = useUser()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 rounded-lg">
          <BarChart3 className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Car Performance</h1>
          <p className="text-gray-600">Track how your car listings are performing</p>
        </div>
      </div>

      <CarAnalyticsDashboard sellerId={user.id} />
    </div>
  )
}
