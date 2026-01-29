'use client'

import { Activity } from 'lucide-react'
import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard'

export default function TrafficPageClient() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Activity className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic & Growth Analytics</h1>
          <p className="text-gray-600">Monitor website visitors and user growth</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <UserAnalyticsDashboard />
    </div>
  )
}
