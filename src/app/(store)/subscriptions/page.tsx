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
} from "@/constants/subscription-plans";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    // Redirect to seller application with selected plan
    router.push(`/seller/apply?plan=${tier}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Start Selling & Advertising Today
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful sellers. Choose a plan to launch your store and boost your reach with premium advertising features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                  plan.popular
                    ? "border-primary shadow-lg scale-100 md:scale-105"
                    : "hover:scale-100 md:hover:scale-105"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-6 md:pb-8 pt-8 md:pt-12">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm md:text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl md:text-5xl font-bold">R{plan.price}</span>
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
                    {loading === plan.tier ? "Processing..." : "Start Selling"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ/Info Section */}
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-sm text-muted-foreground">
                Select the subscription tier that best fits your advertising needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Create Your Store</h3>
              <p className="text-sm text-muted-foreground">
                Set up your professional store profile and list your first products in minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Grow Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Manage orders, track sales, and reach more customers with built-in advertising tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
