"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrencyZAR } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"

interface TopProductsChartProps {
  data: {
    name: string
    quantity: number
    revenue: number
  }[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Selling Products
        </CardTitle>
        <CardDescription>By revenue in selected period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-medium">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate max-w-[200px] sm:max-w-[300px]" title={item.name}>
                    {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrencyZAR(item.revenue)}</div>
                <div className="text-xs text-muted-foreground">{item.quantity} sold</div>
              </div>
            </div>
            <Progress 
                value={(item.revenue / maxRevenue) * 100} 
                className="h-2" 
                // Add custom color classes based on rank if desired, or stick to primary
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
