import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { durationDays = 7 } = body;

    // Get subscription
    const subscription = await db.carSubscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "You need an active subscription" },
        { status: 403 }
      );
    }

    // Check sponsored limit
    if (subscription.sponsoredUsed >= subscription.sponsoredLimit) {
      return NextResponse.json(
        { error: "You have reached your sponsored ad limit. Upgrade your plan for more slots." },
        { status: 403 }
      );
    }

    // Verify ownership
    const listing = await db.carListing.findFirst({
      where: { id, userId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

    if (listing.isSponsored) {
      return NextResponse.json(
        { error: "This listing is already sponsored" },
        { status: 400 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active listings can be sponsored" },
        { status: 400 }
      );
    }

    const sponsoredUntil = new Date();
    sponsoredUntil.setDate(sponsoredUntil.getDate() + durationDays);

    await db.carListing.update({
      where: { id },
      data: {
        isSponsored: true,
        sponsoredUntil,
      },
    });

    await db.carSubscription.update({
      where: { id: subscription.id },
      data: { sponsoredUsed: { increment: 1 } },
    });

    return NextResponse.json({ success: true, sponsoredUntil });
  } catch (error) {
    console.error("Error sponsoring listing:", error);
    return NextResponse.json(
      { error: "Failed to sponsor listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const listing = await db.carListing.findFirst({
      where: { id, userId },
      include: { carSubscription: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!listing.isSponsored) {
      return NextResponse.json(
        { error: "This listing is not sponsored" },
        { status: 400 }
      );
    }

    await db.carListing.update({
      where: { id },
      data: {
        isSponsored: false,
        sponsoredUntil: null,
      },
    });

    if (listing.carSubscription) {
      await db.carSubscription.update({
        where: { id: listing.carSubscriptionId },
        data: {
          sponsoredUsed: Math.max(0, listing.carSubscription.sponsoredUsed - 1),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing sponsorship:", error);
    return NextResponse.json(
      { error: "Failed to remove sponsorship" },
      { status: 500 }
    );
  }
}
