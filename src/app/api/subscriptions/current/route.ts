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

    // 1. Try to find a valid active/trialing subscription first
    let subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. If not found, check if we have a recently expired or pending one that we can fix
    if (!subscription) {
       const recentSub = await db.subscription.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" }
       });

       if (recentSub) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          // Case A: Subscription is EXPIRED but created recently (likely premature expiration)
          // Case B: Subscription is PENDING but created recently and is a Trial (likely ITN failure)
          // Case C: Subscription is TRIALING but missing trialEndsAt (data integrity)
          
          let shouldFix = false;
          
          if (recentSub.createdAt > sevenDaysAgo) {
             if (recentSub.status === "EXPIRED") shouldFix = true;
             if (recentSub.status === "PENDING" && recentSub.isTrial) shouldFix = true;
          }
          
          if (recentSub.status === "TRIALING" && !recentSub.trialEndsAt) shouldFix = true;

          if (shouldFix) {
             const newTrialEnd = new Date();
             newTrialEnd.setDate(newTrialEnd.getDate() + 30); // Give them 30 days from NOW

             await db.subscription.update({
               where: { id: recentSub.id },
               data: { 
                 status: "TRIALING", 
                 trialEndsAt: newTrialEnd,
                 isTrial: true
               }
             });
             
             // Use this fixed subscription
             subscription = {
                ...recentSub,
                status: "TRIALING",
                trialEndsAt: newTrialEnd,
                isTrial: true
             } as any;
          }
       }
    }

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Double check expiration for the found subscription
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
