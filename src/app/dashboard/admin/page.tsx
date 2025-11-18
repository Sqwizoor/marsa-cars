import React from "react";
import {
  getAdminDashboardStats,
  getRevenueChartData,
  getOrdersChartData,
  getTopProducts,
  getTopStores,
} from "@/queries/admin";
import StatCard from "@/components/dashboard/admin/stat-card";
import RevenueChart from "@/components/dashboard/admin/revenue-chart";
import OrdersChart from "@/components/dashboard/admin/orders-chart";
import TopProductsList from "@/components/dashboard/admin/top-products-list";
import TopStoresList from "@/components/dashboard/admin/top-stores-list";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Store,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Fetch all data in parallel
  const [stats, revenueData, ordersData, topProducts, topStores] =
    await Promise.all([
      getAdminDashboardStats(),
      getRevenueChartData(),
      getOrdersChartData(),
      getTopProducts(5),
      getTopStores(5),
    ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-8 w-8 text-[#FF1744]" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your marketplace performance
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            icon={Users}
            description={`+${stats.users.thisMonth} this month`}
            trend={stats.users.growth}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders.total}
            icon={ShoppingCart}
            description={`${stats.orders.today} today`}
            trend={stats.orders.growth}
          />
          <StatCard
            title="Total Revenue"
            value={stats.revenue.total}
            icon={DollarSign}
            prefix="R"
            description={`R${stats.revenue.thisMonth.toLocaleString()} this month`}
            trend={stats.revenue.growth}
          />
          <StatCard
            title="Total Products"
            value={stats.products.total}
            icon={Package}
            description={`+${stats.products.thisMonth} this month`}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Stores"
            value={stats.stores.total}
            icon={Store}
            description={`+${stats.stores.thisMonth} this month`}
          />
          <StatCard
            title="Pending Orders"
            value={stats.orders.pending}
            icon={Clock}
            description="Requires attention"
          />
          <StatCard
            title="Completed Orders"
            value={stats.orders.completed}
            icon={CheckCircle2}
            description="Successfully delivered"
          />
          <StatCard
            title="Today's Revenue"
            value={stats.revenue.today}
            icon={TrendingUp}
            prefix="R"
            description="Real-time earnings"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <OrdersChart data={ordersData} />
        </div>

        {/* Top Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsList products={topProducts} />
          <TopStoresList stores={topStores} />
        </div>

        {/* Quick Actions or Additional Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                User Engagement
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {stats.users.today} new users joined today. Keep the momentum
                going!
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/40 p-4 rounded-lg border border-green-100 dark:border-green-900">
              <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                Order Status
              </h3>
              <p className="text-xs text-green-700 dark:text-green-400">
                {stats.orders.pending} orders are pending processing. Review
                them promptly.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                Platform Growth
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                {stats.stores.thisMonth} new stores joined this month. Strong
                growth!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
