import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCarSubscriptionPlanByTier, CarSubscriptionTier } from "@/constants/car-subscription-plans";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db.carSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        carListings: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching car subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tier, sellerType = "INDIVIDUAL" } = body;

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier is required" },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    const existingSubscription = await db.carSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active car subscription" },
        { status: 400 }
      );
    }

    const plan = getCarSubscriptionPlanByTier(tier as CarSubscriptionTier);
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    let dbUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      // This shouldn't happen if user is authenticated, but handle it gracefully
      return NextResponse.json(
        { error: "User not found. Please try again." },
        { status: 400 }
      );
    }

    const startDate = new Date();
    // Free tier doesn't expire, paid tiers last 30 days
    const endDate = tier === "INDIVIDUAL"
      ? null
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await db.carSubscription.create({
      data: {
        tier: tier as CarSubscriptionTier,
        status: tier === "INDIVIDUAL" ? "ACTIVE" : "PENDING",
        amount: plan.price,
        currency: "ZAR",
        listingLimit: plan.listingLimit,
        listingsUsed: 0,
        sponsoredLimit: plan.sponsoredLimit,
        sponsoredUsed: 0,
        sellerType,
        startDate,
        endDate,
        paymentStatus: tier === "INDIVIDUAL" ? "COMPLETE" : "PENDING",
        userId,
      },
    });

    // Track car subscription started event
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: 'car_subscription_started',
      properties: {
        subscription_id: subscription.id,
        tier: tier,
        seller_type: sellerType,
        amount: plan.price,
        currency: 'ZAR',
        listing_limit: plan.listingLimit,
        sponsored_limit: plan.sponsoredLimit,
        is_free_tier: tier === "INDIVIDUAL",
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error creating car subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
