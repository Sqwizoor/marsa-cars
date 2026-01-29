'use client'

import { BarChart3 } from 'lucide-react'
import { SellerAnalyticsDashboard } from '@/components/analytics/SellerAnalyticsDashboard'

interface Store {
  id: string
  name: string
}

interface Props {
  store: Store
}

export default function VisitorAnalyticsClient({ store }: Props) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 rounded-lg">
          <BarChart3 className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitor Analytics</h1>
          <p className="text-gray-600">Track performance for {store.name}</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <SellerAnalyticsDashboard storeId={store.id} />
    </div>
  )
}
