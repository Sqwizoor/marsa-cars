"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MessageSquare, Car, Star, CheckCircle, AlertCircle } from "lucide-react"

interface CarAnalyticsClientProps {
  initialStats: {
    subscription: any
    totalListings: number
    activeListings: number
    sponsoredListings: number
    totalViews: number
    totalInquiries: number
    unreadInquiries: number
  } | null
}

export function CarAnalyticsClient({ initialStats }: CarAnalyticsClientProps) {
  if (!initialStats) {
    return <div>No analytics data available.</div>
  }

  const {
    subscription,
    totalListings,
    activeListings,
    sponsoredListings,
    totalViews,
    totalInquiries,
    unreadInquiries,
  } = initialStats

  const statCards = [
    {
      title: "Total Views",
      value: totalViews,
      icon: Eye,
      description: "Across all your listings",
    },
    {
      title: "Active Listings",
      value: activeListings,
      icon: CheckCircle,
      description: `${totalListings} total uploaded`,
    },
    {
      title: "Total Inquiries",
      value: totalInquiries,
      icon: MessageSquare,
      description: `${unreadInquiries} unread messages`,
      alert: unreadInquiries > 0,
    },
    {
      title: "Sponsored Listings",
      value: sponsoredListings,
      icon: Star,
      description: "Featured cars",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.alert ? "text-red-500" : ""}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {subscription && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Tier</p>
                <p className="text-xl font-bold capitalize">{subscription.tier.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seller Type</p>
                <p className="text-xl font-bold capitalize">{subscription.sellerType.toLowerCase()}</p>
              </div>
              {subscription.dealerName && (
                 <div>
                 <p className="text-sm font-medium text-muted-foreground">Dealer Name</p>
                 <p className="text-xl font-bold">{subscription.dealerName}</p>
               </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
