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
  Shield, 
  Users, 
  TrendingUp,
  Eye,
  Clock,
  MessageCircle,
  Camera,
  Zap,
  Star,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { CarSubscription } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

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
      toast.error(error.message);
    }
    setLoading(false);
  };

  const benefits = [
    {
      icon: Eye,
      title: "Maximum Visibility",
      description: "Your car listing reaches thousands of verified buyers daily"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Verified buyers and secure messaging protect your privacy"
    },
    {
      icon: TrendingUp,
      title: "Best Price Guarantee",
      description: "Our market data helps you price your car competitively"
    },
    {
      icon: Clock,
      title: "Quick Sales",
      description: "Most cars sell within 2-4 weeks of listing"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with interested buyers through our platform"
    },
    {
      icon: Camera,
      title: "Professional Presentation",
      description: "Easy photo upload with tips for showcasing your vehicle"
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Buyers" },
    { value: "15K+", label: "Cars Sold" },
    { value: "4.8★", label: "Seller Rating" },
    { value: "14 Days", label: "Avg. Sale Time" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-pink-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1" />
              South Africa&apos;s Trusted Car Marketplace
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Sell Your Car
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
                Fast & Hassle-Free
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of sellers who trust us to connect them with serious buyers. 
              List your car today and get offers within days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-pink-500/25"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Selling Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-full"
                asChild
              >
                <Link href="/cars">
                  Browse Cars First
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Sell With Us?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We make selling your car simple, secure, and profitable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-pink-500/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              List your car in minutes and start receiving offers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Your Plan", desc: "Free for individuals or upgrade for more listings" },
              { step: "2", title: "Add Car Details", desc: "Fill in your vehicle info and upload photos" },
              { step: "3", title: "Get Verified", desc: "We review your listing for quality" },
              { step: "4", title: "Receive Offers", desc: "Buyers contact you directly" },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-pink-500/50 to-purple-500/50" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
              Choose Your Plan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Selling Today
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Whether you&apos;re selling one car or running a dealership, we have a plan for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {CAR_SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.tier}
                className={`relative cursor-pointer transition-all duration-300 bg-gray-900 border-gray-800 hover:border-pink-500/50 ${
                  selectedPlan === plan.tier
                    ? "ring-2 ring-pink-500 border-pink-500 scale-[1.02]"
                    : ""
                } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                onClick={() => setSelectedPlan(plan.tier)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8 pb-4">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}
                  >
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-white">
                      {plan.price === 0 ? "FREE" : `R${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Car className="w-4 h-4 text-blue-400" />
                      </div>
                      <span>
                        <strong className="text-white">{getListingLimitDisplay(plan.listingLimit)}</strong>{" "}
                        car listing{plan.listingLimit !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <span>
                        <strong className="text-white">{plan.sponsoredLimit}</strong> sponsored ads
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-6 space-y-3">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                      <div className="text-sm text-pink-400 font-medium">
                        +{plan.features.length - 5} more features
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full mt-6 py-6 text-base rounded-xl transition-all ${
                      selectedPlan === plan.tier
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/25"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.tier);
                    }}
                  >
                    {selectedPlan === plan.tier ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Selected
                      </>
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={handleSelectPlan}
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-12 py-7 text-lg rounded-full shadow-xl shadow-pink-500/25 transition-all hover:scale-105"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {selectedPlan === "INDIVIDUAL" ? "Start Free" : "Continue to Payment"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              {selectedPlan === "INDIVIDUAL" 
                ? "No credit card required • Start listing immediately"
                : "Secure payment • Cancel anytime"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-gray-800">
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-white font-medium mb-6">
              &ldquo;I sold my BMW within 10 days of listing! The process was incredibly smooth and I got 
              more than I expected. Highly recommend to anyone looking to sell their car.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                TM
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Thabo Mokoena</div>
                <div className="text-gray-400 text-sm">Sold BMW 3 Series</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Sell Your Car?
          </h2>
          <p className="text-pink-100 mb-8 text-lg">
            Join thousands of happy sellers. Your next buyer is waiting.
          </p>
          <Button
            size="lg"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-pink-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-full font-semibold shadow-xl"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
