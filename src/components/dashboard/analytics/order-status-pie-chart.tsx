"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

interface OrderStatusPieChartProps {
  data: {
    status: string
    count: number
  }[]
}

export function OrderStatusPieChart({ data }: OrderStatusPieChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.status,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }))

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.status] = {
      label: item.status,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>Distribution of order statuses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
