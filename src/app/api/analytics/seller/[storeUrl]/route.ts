import { NextRequest, NextResponse } from "next/server"
import { getStoreAnalytics } from "@/queries/analytics"
import { getStoreDashboardStats } from "@/queries/store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeUrl: string }> }
) {
  try {
    const { storeUrl } = await params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")

    const [analytics, stats] = await Promise.all([
      getStoreAnalytics(storeUrl, days),
      getStoreDashboardStats(storeUrl, days)
    ])

    return NextResponse.json({
      ...analytics,
      ...stats,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
