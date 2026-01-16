"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CAR_SUBSCRIPTION_PLANS } from "@/constants/car-subscription-plans";
import { toast } from "sonner";

interface CarSubscription {
  id: string;
  tier: "INDIVIDUAL" | "PREMIUM" | "DEALER";
  status: string;
  currentPeriodEnd: string;
  listingsUsed: number;
  sponsoredAdsUsed: number;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<CarSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/cars/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    setUpgrading(tier);
    try {
      const res = await fetch("/api/cars/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setSubscription(data);
          toast.success("Successfully subscribed to the plan!");
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Failed to subscribe");
    } finally {
      setUpgrading(null);
    }
  };

  const getIcon = (tier: string) => {
    switch (tier) {
      case "INDIVIDUAL":
        return <Star className="w-6 h-6" />;
      case "PREMIUM":
        return <Zap className="w-6 h-6" />;
      case "DEALER":
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const isCurrentPlan = (tier: string) => {
    return subscription?.tier === tier && subscription?.status === "ACTIVE";
  };

  const canUpgrade = (tier: string) => {
    if (!subscription) return true;
    
    const tiers = ["INDIVIDUAL", "PREMIUM", "DEALER"];
    const currentIndex = tiers.indexOf(subscription.tier);
    const targetIndex = tiers.indexOf(tier);
    
    return targetIndex > currentIndex;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Car Subscription Plans</h1>
        <p className="text-gray-600 mt-2">
          Choose the perfect plan for your car selling needs
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && subscription.status === "ACTIVE" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl text-white">
                  {getIcon(subscription.tier)}
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Current Plan</p>
                  <p className="text-xl font-bold">{subscription.tier}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Usage This Period</p>
                <p className="font-medium">
                  {subscription.listingsUsed} listings • {subscription.sponsoredAdsUsed} sponsored ads
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {CAR_SUBSCRIPTION_PLANS.map((plan) => {
          const currentPlan = isCurrentPlan(plan.tier);
          const canUpgradeToPlan = canUpgrade(plan.tier);
          
          return (
            <Card
              key={plan.tier}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? "border-2 border-blue-600 shadow-lg" : ""
              } ${currentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              
              {currentPlan && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600">Current Plan</Badge>
                </div>
              )}

              <CardHeader className={`pb-4 ${plan.popular ? "pt-8" : ""}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.tier === "INDIVIDUAL" ? "bg-gray-100 text-gray-600" :
                  plan.tier === "PREMIUM" ? "bg-blue-100 text-blue-600" :
                  "bg-purple-100 text-purple-600"
                }`}>
                  {getIcon(plan.tier)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `R${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">/month</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Listings</span>
                    <span className="font-medium">
                      {plan.listingLimit === -1 ? "Unlimited" : plan.listingLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sponsored Ads</span>
                    <span className="font-medium">{plan.sponsoredLimit}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : ""
                  }`}
                  variant={currentPlan ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={currentPlan || !canUpgradeToPlan || upgrading === plan.tier}
                  onClick={() => handleSubscribe(plan.tier)}
                >
                  {upgrading === plan.tier ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : currentPlan ? (
                    "Current Plan"
                  ) : canUpgradeToPlan ? (
                    plan.price === 0 ? "Start Free" : "Upgrade"
                  ) : (
                    "Downgrade Not Available"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">How do sponsored ads work?</h4>
            <p className="text-sm text-gray-600">
              Sponsored ads appear in the featured section at the top of the car marketplace, 
              getting more visibility and clicks. Each plan includes a certain number of ads you can sponsor at a time.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I upgrade my plan anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes! You can upgrade your plan at any time. The new plan will be prorated based on your 
              current billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens if I reach my listing limit?</h4>
            <p className="text-sm text-gray-600">
              You&apos;ll need to either remove an existing listing or upgrade to a higher tier plan to add more cars.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Is the Individual plan really free?</h4>
            <p className="text-sm text-gray-600">
              Yes! The Individual plan is completely free and perfect for selling a single car. 
              You can list 1 car and sponsor up to 2 ads at a time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
