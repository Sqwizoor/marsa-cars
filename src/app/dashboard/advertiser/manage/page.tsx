"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  CreditCard,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvertiserManagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/advertiser/subscriptions");
        if (!res.ok) throw new Error("Failed to load subscription data");
        const data = await res.json();
        setCurrentSubscription(data.current || null);
        setHistory(data.history || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "EXPIRED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      case "TRIALING":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="animate-pulse h-4 w-32 bg-primary/10 rounded-md" />
            <div className="animate-pulse h-24 w-full bg-primary/10 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

        {/* Current Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Current Plan</CardTitle>
                <CardDescription>
                  Your active subscription details
                </CardDescription>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {currentSubscription ? (
              (() => {
                const isTrial =
                  currentSubscription.phase === "TRIAL" ||
                  currentSubscription.status === "TRIALING";
                const expirationDate =
                  currentSubscription.expiresAt ||
                  currentSubscription.trialEndsAt ||
                  currentSubscription.endDate;
                const expirationLabel = expirationDate
                  ? new Date(expirationDate).toLocaleDateString()
                  : "N/A";

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {currentSubscription.tier} Plan
                        </h3>
                        <p className="text-muted-foreground">
                          {isTrial ? "Trial • " : ""}R{currentSubscription.amount}/month
                        </p>
                      </div>
                      <Badge className={getStatusColor(currentSubscription.status)}>
                        {isTrial ? "TRIAL" : currentSubscription.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Ads Used
                        </p>
                        <p className="text-lg font-semibold">
                          {currentSubscription.adsUsed} /{" "}
                          {currentSubscription.adLimit === -1
                            ? "Unlimited"
                            : currentSubscription.adLimit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Valid Until
                        </p>
                        <p className="text-lg font-semibold">
                          {expirationLabel}
                        </p>
                      </div>
                    </div>

                    {isTrial && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950/30 dark:via-rose-950/30 dark:to-purple-950/30 border-2 border-pink-200 dark:border-pink-800 p-4 shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-2xl -mt-8 -mr-8"></div>
                        <div className="relative flex items-start gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-xl shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
                              🎉 Trial Period Active
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              Your free trial ends on <span className="font-bold text-pink-600 dark:text-pink-400">{expirationLabel}</span>. Complete your paid subscription to keep your seller tools active.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => router.push("/subscriptions")}
                        className="flex-1"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have an active subscription
                </p>
                <Button onClick={() => router.push("/subscriptions")}>
                  Subscribe Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Subscription History</CardTitle>
                <CardDescription>
                  View all your past subscriptions
                </CardDescription>
              </div>
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No subscription history yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{sub.tier} Plan</h4>
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        R{sub.amount} • Created on{" "}
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                      {sub.startDate && sub.endDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sub.startDate).toLocaleDateString()} -{" "}
                          {new Date(sub.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {sub.adsUsed} /{" "}
                        {sub.adLimit === -1 ? "∞" : sub.adLimit} ads
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
