"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface OrdersChartProps {
  data: Array<{ date: string; orders: number }>;
}

export default function OrdersChart({ data }: OrdersChartProps) {
  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", {
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
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart accessibilityLayer data={formattedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
