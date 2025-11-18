"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface OrdersChartProps {
  data: Array<{ date: string; orders: number }>;
}

export default function OrdersChart({ data }: OrdersChartProps) {
  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card className="col-span-1 lg:col-span-2 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-white">Orders Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="fill-gray-600 dark:fill-gray-400"
              stroke="currentColor"
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="fill-gray-600 dark:fill-gray-400"
              stroke="currentColor"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value: number) => [value, "Orders"]}
            />
            <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#FF1744"
              strokeWidth={3}
              dot={{ fill: "#FF1744", r: 4 }}
              activeDot={{ r: 6 }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
