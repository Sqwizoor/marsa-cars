"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface TopProductsChartProps {
  data: {
    name: string
    quantity: number
    revenue: number
  }[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  // Limit product names for readability
  const formattedData = data.map(item => ({
    ...item,
    shortName: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>By revenue in selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={formattedData}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="shortName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={150}
            />
            <XAxis
              type="number"
              tickFormatter={(value) => `R${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name, item) => (
                    <>
                      <div className="font-medium">{item.payload.name}</div>
                      <div>Revenue: {formatCurrencyZAR(Number(value))}</div>
                      <div>Quantity: {item.payload.quantity}</div>
                    </>
                  )}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
