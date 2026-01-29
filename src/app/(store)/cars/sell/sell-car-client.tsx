"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CAR_SUBSCRIPTION_PLANS,
  getListingLimitDisplay,
} from "@/constants/car-subscription-plans";
import {
  Check,
  Car,
  ArrowRight,
  Sparkles,
  Star,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { CarSubscription } from "@prisma/client";
import posthog from 'posthog-js';

interface SellCarClientProps {
  initialSubscription: CarSubscription | null;
}

export default function SellCarClient({ initialSubscription }: SellCarClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("INDIVIDUAL");
  const [loading, setLoading] = useState(false);

  // If user already has a subscription, redirect to dashboard
  if (initialSubscription) {
    router.push("/dashboard/cars");
    return null;
  }

  const handleSelectPlan = async () => {
    setLoading(true);

    // Track subscription plan selection
    const plan = CAR_SUBSCRIPTION_PLANS.find(p => p.tier === selectedPlan);
    posthog.capture('subscription_plan_selected', {
      plan_tier: selectedPlan,
      plan_name: plan?.name,
      plan_price: plan?.price,
      seller_type: selectedPlan === "DEALER" ? "DEALER" : "INDIVIDUAL",
    });

    try {
      const response = await fetch("/api/cars/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan,
          sellerType: selectedPlan === "DEALER" ? "DEALER" : "INDIVIDUAL",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // For free tier (Individual), redirect to dashboard
      if (selectedPlan === "INDIVIDUAL") {
        toast.success("Welcome! You can now list your car.");
        router.push("/dashboard/cars");
      } else {
        // For paid tiers, redirect to payment
        router.push(`/dashboard/cars/subscription/payment?tier=${selectedPlan}`);
      }
    } catch (error: any) {
      posthog.captureException(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Sell Your Car Today
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Reach thousands of buyers. List your vehicle in minutes.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {CAR_SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.tier}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPlan === plan.tier
                    ? "ring-2 ring-pink-500 border-pink-500"
                    : "border-gray-200 hover:border-gray-300"
                } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                onClick={() => setSelectedPlan(plan.tier)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-pink-500 text-white px-3">
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8 pb-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-3`}
                  >
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? "Free" : `R${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Car className="w-4 h-4 text-pink-500" />
                      <span>
                        <strong>{getListingLimitDisplay(plan.listingLimit)}</strong>{" "}
                        listing{plan.listingLimit !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>
                        <strong>{plan.sponsoredLimit}</strong> sponsored ads
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t mt-4 pt-4 space-y-2">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full mt-5 ${
                      selectedPlan === plan.tier
                        ? "bg-pink-500 hover:bg-pink-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    variant={selectedPlan === plan.tier ? "default" : "ghost"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.tier);
                    }}
                  >
                    {selectedPlan === plan.tier ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={handleSelectPlan}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-6 text-lg rounded-full"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {selectedPlan === "INDIVIDUAL" ? "Start Free" : "Continue"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="mt-3 text-sm text-gray-500">
              {selectedPlan === "INDIVIDUAL" 
                ? "No credit card required"
                : "Secure payment"
              }
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
