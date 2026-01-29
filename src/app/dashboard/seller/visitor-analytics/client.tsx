'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { SellerAnalyticsDashboard } from '@/components/analytics/SellerAnalyticsDashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Store {
  id: string
  name: string
}

interface Props {
  stores: Store[]
}

export default function SellerAnalyticsClient({ stores }: Props) {
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || '')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Analytics</h1>
            <p className="text-gray-600">Track your product performance and visitor behavior</p>
          </div>
        </div>

        {/* Store Selector */}
        {stores.length > 1 && (
          <div className="w-full sm:w-auto">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      {selectedStore && <SellerAnalyticsDashboard storeId={selectedStore} />}
    </div>
  )
}
