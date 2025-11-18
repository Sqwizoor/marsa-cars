"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewChartProps {
  data: {
    date: string;
    total: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  // Format date for display (e.g., "Jan 12")
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    return {
      name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: item.total,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={formattedData}>
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
          tickFormatter={(value) => `R${value}`}
        />
        <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(value: number) => [`R${value.toFixed(2)}`, 'Revenue']}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
