import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ subscription: null });
    }

    const paidStatuses = ["COMPLETE", "PAID", "Paid"];

    let subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [
          { paymentStatus: { in: paidStatuses } },
          { paymentId: { not: null } },
          { startDate: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) return NextResponse.json({ subscription: null });

    const now = new Date();
    const expiresAt =
      subscription.endDate;

    // Check if subscription has expired
    if (expiresAt && now > new Date(expiresAt)) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "EXPIRED",
        },
      });

      return NextResponse.json({ subscription: null });
    }

    const planMinLimit =
      subscription.tier === "BRONZE"
        ? 100
        : subscription.tier === "SILVER"
        ? 250
        : subscription.tier === "GOLD"
        ? -1
        : subscription.adLimit;

    if (planMinLimit !== -1 && subscription.adLimit !== planMinLimit) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { adLimit: planMinLimit },
      });
      subscription.adLimit = planMinLimit;
    }

    const activeAdsCount = await db.advertisement.count({
      where: { userId, isActive: true },
    });

    if (subscription.adsUsed !== activeAdsCount) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { adsUsed: activeAdsCount },
      });
      subscription.adsUsed = activeAdsCount;
    }

    const remaining =
      subscription.adLimit === -1
        ? -1
        : Math.max(0, subscription.adLimit - subscription.adsUsed);

    return NextResponse.json({
      subscription: {
        ...subscription,
        remainingAds: remaining,
        phase: "PAID",
        expiresAt: expiresAt ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
