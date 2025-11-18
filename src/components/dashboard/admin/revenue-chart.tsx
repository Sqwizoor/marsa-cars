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

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
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
        <CardTitle className="text-lg font-semibold dark:text-white">Revenue Trend (Last 30 Days)</CardTitle>
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
              tickFormatter={(value) => `R${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value: number) => [`R${value.toLocaleString()}`, "Revenue"]}
            />
            <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#FF1744"
              strokeWidth={3}
              dot={{ fill: "#FF1744", r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
