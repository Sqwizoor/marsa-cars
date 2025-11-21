import { getStoreAnalytics } from "@/queries/analytics"
import { getStoreDashboardStats } from "@/queries/store"
import SellerAnalyticsClient from "./client"

export default async function SellerAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeUrl: string }>
  searchParams: Promise<{ range?: string }>
}) {
  const { storeUrl } = await params
  const { range } = await searchParams
  
  const getDaysFromRange = (range?: string): number => {
    switch (range) {
      case "7d": return 7
      case "30d": return 30
      case "90d": return 90
      case "6m": return 180
      case "1y": return 365
      case "all": return 999999
      default: return 30
    }
  }

  const days = getDaysFromRange(range)
  const [analytics, stats] = await Promise.all([
    getStoreAnalytics(storeUrl, days),
    getStoreDashboardStats(storeUrl, days)
  ])

  const initialData = {
    ...analytics,
    ...stats,
  }

  return <SellerAnalyticsClient storeUrl={storeUrl} initialData={initialData} />
}
