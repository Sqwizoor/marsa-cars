"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  MessageSquare,
  Car,
  Star,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface CarAnalyticsClientProps {
  initialStats: {
    subscription: any;
    totalListings: number;
    activeListings: number;
    sponsoredListings: number;
    totalViews: number;
    totalInquiries: number;
    unreadInquiries: number;
    topCars: { name: string; views: number; inquiries: number }[];
    statusDistribution: { name: string; value: number }[];
    listingsGrowth: { name: string; value: number }[];
  } | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function CarAnalyticsClient({ initialStats }: CarAnalyticsClientProps) {
  if (!initialStats) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No analytics data available. Start listing cars to see your insights.
      </div>
    );
  }

  const {
    subscription,
    totalListings,
    activeListings,
    sponsoredListings,
    totalViews,
    totalInquiries,
    unreadInquiries,
    topCars,
    statusDistribution,
    listingsGrowth,
  } = initialStats;

  const statCards = [
    {
      title: "Total Views",
      value: totalViews,
      icon: Eye,
      description: "Across all listings",
      trend: "+12%", // Mock trend for visualization
      trendUp: true,
    },
    {
      title: "Active Listings",
      value: activeListings,
      icon: CheckCircle,
      description: `${totalListings} total uploaded`,
    },
    {
      title: "Inquiries",
      value: totalInquiries,
      icon: MessageSquare,
      description: `${unreadInquiries} unread`,
      alert: unreadInquiries > 0,
    },
    {
      title: "Sponsored",
      value: sponsoredListings,
      icon: Star,
      description: "Featured cars",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 ${
                  stat.alert ? "text-red-500 animate-pulse" : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Growth Chart (Area) - Large */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Listing Activity</CardTitle>
            <CardDescription>New listings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={listingsGrowth}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution (Pie) - Small */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Distribution of active vs sold cars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Cars (Bar) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Top Performing Cars</CardTitle>
            <CardDescription>Top 5 cars by views and inquiries</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCars} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    tick={{ fontSize: 11 }} 
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="views" name="Views" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={12} stackId="a" />
                  <Bar dataKey="inquiries" name="Inquiries" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={12} stackId="b" />
                  <Legend iconType="circle" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        {subscription && (
        <Card className="col-span-3 shadow-sm bg-gradient-to-br from-white to-slate-50 border-none ring-1 ring-slate-200">
          <CardHeader>
             <CardTitle>Plan Usage</CardTitle>
             <CardDescription>Current billing cycle stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                  {subscription.tier.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                 <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-3">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Listings Limit</span>
                    <span className="font-bold text-slate-700">{subscription.listingsUsed} / {subscription.listingLimit === -1 ? '∞' : subscription.listingLimit}</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${subscription.listingLimit === -1 ? 15 : Math.min(100, (subscription.listingsUsed / subscription.listingLimit) * 100)}%` }}
                    />
                 </div>
                 <p className="text-xs text-muted-foreground text-right">
                    {subscription.listingLimit === -1 
                      ? "Unlimited listings available" 
                      : `${subscription.listingLimit - subscription.listingsUsed} listings remaining`
                    }
                 </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Type</p>
                        <p className="font-semibold capitalize text-slate-700 mt-1">{subscription.sellerType.toLowerCase()}</p>
                    </div>
                     {subscription.dealerName && (
                      <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dealer</p>
                          <p className="font-semibold text-slate-700 mt-1">{subscription.dealerName}</p>
                      </div>
                    )}
                 </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
