import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Eye,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Plus,
  Settings,
} from "lucide-react";
import { getCarSubscriptionPlanByTier, getListingLimitDisplay } from "@/constants/car-subscription-plans";
import CarListingsTable from "./car-listings-table";

export const metadata: Metadata = {
  title: "My Car Listings | Dashboard",
  description: "Manage your car listings and view performance",
};

export default async function CarsDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get subscription and listings
  const [subscription, listings, inquiries] = await Promise.all([
    db.carSubscription.findFirst({
      where: { userId, status: "ACTIVE" },
    }),
    db.carListing.findMany({
      where: { userId },
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.carInquiry.count({
      where: { carListing: { userId }, isRead: false },
    }),
  ]);

  // Calculate stats
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);
  const activeListings = listings.filter((l) => l.status === "ACTIVE").length;
  const sponsoredListings = listings.filter((l) => l.isSponsored).length;

  const plan = subscription
    ? getCarSubscriptionPlanByTier(subscription.tier)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Car Listings</h1>
          <p className="text-gray-500">Manage your vehicle listings and track performance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/cars/inquiries">
            <Button variant="outline" className="relative">
              <MessageSquare className="w-4 h-4 mr-2" />
              Inquiries
              {inquiries > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {inquiries}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/cars/sell">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Banner */}
      {!subscription && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Start Selling Your Car Today!
                </h3>
                <p className="text-white/80">
                  Create a free account to list your vehicle and reach thousands of buyers.
                </p>
              </div>
              <Link href="/cars/sell">
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Listings</p>
                <p className="text-3xl font-bold">{activeListings}</p>
                {subscription && (
                  <p className="text-xs text-gray-400 mt-1">
                    of {getListingLimitDisplay(subscription.listingLimit)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inquiries</p>
                <p className="text-3xl font-bold">{totalInquiries}</p>
                {inquiries > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {inquiries} unread
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sponsored Ads</p>
                <p className="text-3xl font-bold">{sponsoredListings}</p>
                {subscription && (
                  <p className="text-xs text-gray-400 mt-1">
                    of {subscription.sponsoredLimit}
                  </p>
                )}
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      {subscription && plan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${plan.gradient}`}
                >
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{plan.name} Plan</CardTitle>
                  <CardDescription>
                    {plan.price === 0 ? "Free" : `R${plan.price}/month`}
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/cars/subscription">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Listings Used:</span>
                <p className="font-semibold">
                  {subscription.listingsUsed} / {getListingLimitDisplay(subscription.listingLimit)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Sponsored Slots:</span>
                <p className="font-semibold">
                  {subscription.sponsoredUsed} / {subscription.sponsoredLimit}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p>
                  <Badge
                    variant={subscription.status === "ACTIVE" ? "default" : "secondary"}
                    className={
                      subscription.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {subscription.status}
                  </Badge>
                </p>
              </div>
              {subscription.endDate && (
                <div>
                  <span className="text-gray-500">Renews:</span>
                  <p className="font-semibold">
                    {new Date(subscription.endDate).toLocaleDateString("en-ZA")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>
            {listings.length} total listing{listings.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No listings yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first car listing and start selling!
              </p>
              <Link href="/cars/sell">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
            </div>
          ) : (
            <CarListingsTable listings={listings as any} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
