import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  prefix = "",
  suffix = "",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-semibold ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
