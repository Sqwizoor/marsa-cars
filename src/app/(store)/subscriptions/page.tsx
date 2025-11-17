"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_TRIAL_DAYS,
} from "@/constants/subscription-plans";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    setLoading(tier);

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create subscription");
        setLoading(null);
        return;
      }

      if (data.trialStarted) {
        toast.success(
          `Free trial activated! Ends on ${new Date(
            data.trialEndsAt
          ).toLocaleDateString()}`
        );
        setLoading(null);
        router.push("/dashboard/advertiser");
        return;
      }

      if (!data.paymentUrl || !data.paymentData) {
        toast.error("Unable to initialize payment. Please try again.");
        setLoading(null);
        return;
      }

      // Create a form and submit to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;

      Object.keys(data.paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data.paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to create subscription");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Advertise Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan, unlock a {SUBSCRIPTION_TRIAL_DAYS}-day free trial, and only start paying once you are confident in your reach.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "hover:scale-105"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-12">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">R{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-8">
                  <Button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={loading !== null}
                    className={`w-full ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }`}
                    size="lg"
                  >
                    {loading === plan.tier ? "Processing..." : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ/Info Section */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-sm text-muted-foreground">
                Select the subscription tier that best fits your advertising needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Complete Payment</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment via PayFast - your subscription activates immediately
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Advertising</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage your ads to reach thousands of customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
