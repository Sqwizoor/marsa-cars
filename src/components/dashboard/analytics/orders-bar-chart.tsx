"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface OrdersBarChartProps {
  data: {
    date: string
    total: number
    orders: number
  }[]
}

export function OrdersBarChart({ data }: OrdersBarChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Daily order volume for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
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
  )
}
