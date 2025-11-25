"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { formatCurrencyZAR } from "@/lib/utils"

const chartConfig = {
  aov: {
    label: "Avg Order Value",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface AOVLineChartProps {
  data: {
    date: string
    revenue: number
    orders: number
  }[]
}

export function AOVLineChart({ data }: AOVLineChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      aov: item.orders > 0 ? item.revenue / item.orders : 0,
      formattedDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Order Value Trend</CardTitle>
        <CardDescription>
          Daily average order value over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `R${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                    hideLabel 
                    formatter={(value) => formatCurrencyZAR(Number(value))}
                />
              }
            />
            <Line
              dataKey="aov"
              type="monotone"
              stroke="var(--color-aov)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
