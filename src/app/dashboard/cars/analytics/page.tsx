import { Suspense } from "react"
import { getCarListingStats } from "@/queries/cars"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { CarAnalyticsClient } from "./client"

export default async function CarAnalyticsPage() {
  const stats = await getCarListingStats()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-start justify-between">
        <Heading
          title="Car Analytics"
          description="View your car listings performance and statistics"
        />
      </div>
      <Separator />
      <Suspense fallback={<div>Loading analytics...</div>}>
        <CarAnalyticsClient initialStats={stats} />
      </Suspense>
    </div>
  )
}
