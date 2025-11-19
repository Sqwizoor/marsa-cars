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

    // Get latest active or trialing subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    const now = new Date();
    const expiresAt =
      subscription.status === "TRIALING"
        ? subscription.trialEndsAt
        : subscription.endDate;

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

    // Get remaining ads
    const remaining =
      subscription.adLimit === -1
        ? -1
        : subscription.adLimit - subscription.adsUsed;

    return NextResponse.json({
      subscription: {
        ...subscription,
        remainingAds: remaining,
        phase: subscription.status === "TRIALING" ? "TRIAL" : "PAID",
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
