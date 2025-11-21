import React from "react";
import {
  getAdminDashboardStats,
  getRevenueChartData,
  getOrdersChartData,
} from "@/queries/admin";
import RevenueChart from "@/components/dashboard/admin/revenue-chart";
import OrdersChart from "@/components/dashboard/admin/orders-chart";
import { Activity } from "lucide-react";

export default async function AdminAnalyticsPage() {
  // Fetch all data in parallel
  const [revenueData, ordersData] =
    await Promise.all([
      getRevenueChartData(),
      getOrdersChartData(),
    ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-8 w-8 text-[#FF1744]" />
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed performance metrics
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          <RevenueChart data={revenueData} />
          <OrdersChart data={ordersData} />
        </div>
      </div>
    </div>
  );
}
