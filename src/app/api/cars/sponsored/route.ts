import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    const listings = await db.carListing.findMany({
      where: {
        status: "ACTIVE",
        isSponsored: true,
        OR: [
          { sponsoredUntil: null },
          { sponsoredUntil: { gte: now } },
        ],
      },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true },
        },
      },
      orderBy: [
        { sponsoredViews: "asc" }, // Show less viewed ones first for fairness
        { createdAt: "desc" },
      ],
      take: 10,
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Error fetching sponsored car listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsored listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, type } = await req.json();

    if (!listingId || !type) {
      return NextResponse.json(
        { error: "Missing listingId or type" },
        { status: 400 }
      );
    }

    // Track view or click
    if (type === "view") {
      await db.carListing.update({
        where: { id: listingId },
        data: { sponsoredViews: { increment: 1 } },
      });
    } else if (type === "click") {
      await db.carListing.update({
        where: { id: listingId },
        data: { sponsoredClicks: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking sponsored action:", error);
    return NextResponse.json(
      { error: "Failed to track action" },
      { status: 500 }
    );
  }
}
