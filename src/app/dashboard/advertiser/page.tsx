"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Eye,
  MousePointer,
  Plus,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Subscription {
  id: string;
  tier: string;
  status: string;
  amount: number;
  adLimit: number;
  adsUsed: number;
  startDate: string | null;
  endDate: string | null;
  remainingAds: number;
  phase?: "TRIAL" | "PAID";
  expiresAt?: string | null;
}

const TRIAL_DAYS = 60;

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string | null;
  isActive: boolean;
  views: number;
  clicks: number;
  createdAt: string;
}

export default function AdvertiserDashboard() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch subscription
      const subResponse = await fetch("/api/subscriptions/current");
      const subData = await subResponse.json();
      setSubscription(subData.subscription);

      // Fetch ads
      const adsResponse = await fetch("/api/advertisements/my-ads");
      const adsData = await adsResponse.json();
      setAds(adsData.ads || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl">No Active Subscription</CardTitle>
              <CardDescription>
                Start your {TRIAL_DAYS}-day free trial to unlock the advertiser dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/subscriptions")}
                size="lg"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tierColors = {
    BRONZE: "from-orange-400 to-orange-600",
    SILVER: "from-gray-400 to-gray-600",
    GOLD: "from-yellow-400 to-yellow-600",
  };

  const usagePercentage =
    subscription.adLimit === -1
      ? 0
      : (subscription.adsUsed / subscription.adLimit) * 100;

  const isTrial =
    subscription.phase === "TRIAL" || subscription.status === "TRIALING";
  const expirationDate = subscription.expiresAt || subscription.endDate;
  const expirationLabel = expirationDate
    ? new Date(expirationDate).toLocaleDateString()
    : "N/A";

  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const activeAds = ads.filter((ad) => ad.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advertiser Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your advertisements and track performance
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/advertiser/create-ad")}
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Ad
          </Button>
        </div>

        {/* Subscription Info */}
        <Card
          className={`bg-gradient-to-br ${
            tierColors[subscription.tier as keyof typeof tierColors]
          } text-white border-0`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {subscription.tier} Plan
                </CardTitle>
                <CardDescription className="text-white/80">
                  {isTrial ? "Trial ends" : "Renews"} {" "}
                  {expirationLabel}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {isTrial ? "Trial • " : ""}R{subscription.amount}/month
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ads Used</span>
                <span className="font-semibold">
                  {subscription.adsUsed} /{" "}
                  {subscription.adLimit === -1
                    ? "Unlimited"
                    : subscription.adLimit}
                </span>
              </div>
              {subscription.adLimit !== -1 && (
                <Progress value={usagePercentage} className="bg-white/30" />
              )}
                {isTrial && (
                  <p className="text-xs text-white/80">
                    Free trial ends on {expirationLabel}. Upgrade any time to keep ads running.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Ads
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAds}</div>
              <p className="text-xs text-muted-foreground">
                {ads.length - activeAds} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Across all ads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                Click-through rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Ads
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription.remainingAds === -1
                  ? "∞"
                  : subscription.remainingAds}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to create
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ads List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Advertisements</CardTitle>
            <CardDescription>
              Manage and track all your active advertisements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ads.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  You haven't created any ads yet
                </p>
                <Button
                  onClick={() =>
                    router.push("/dashboard/advertiser/create-ad")
                  }
                >
                  Create Your First Ad
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <Card key={ad.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {ad.image && (
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{ad.title}</h3>
                          <Badge variant={ad.isActive ? "default" : "secondary"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {ad.description}
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{ad.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            <span>{ad.clicks} clicks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(ad.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
