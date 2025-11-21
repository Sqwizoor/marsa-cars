import { getStoreDashboardStats } from "@/queries/store";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";

export default async function SellerAnalyticsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;
  const stats = await getStoreDashboardStats(storeUrl);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <AnalyticsDashboard stats={stats} />
    </div>
  );
}
