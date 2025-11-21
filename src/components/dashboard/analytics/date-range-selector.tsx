"use client"

import * as React from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DateRange = "7d" | "30d" | "90d" | "6m" | "1y" | "all"

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
]

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const currentLabel = dateRangeOptions.find(opt => opt.value === value)?.label || "Select range"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {dateRangeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "bg-accent" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
