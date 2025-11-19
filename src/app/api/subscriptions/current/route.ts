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
       // Fetch ALL subscriptions for this user, not just the latest one
       const recentSubs = await db.subscription.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5 // Check the last 5 attempts
       });

       const sevenDaysAgo = new Date();
       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

       // Find the best candidate to restore
       let candidateToRestore = null;

       for (const sub of recentSubs) {
          let isCandidate = false;

          // Check if it's recent enough
          if (sub.createdAt > sevenDaysAgo) {
             // Restore if it was working but expired prematurely
             if (sub.status === "EXPIRED") isCandidate = true;
             
             // Restore if it was a trial attempt that got stuck in PENDING
             if (sub.status === "PENDING" && sub.isTrial) isCandidate = true;
             
             // Restore if it was a trial attempt that got stuck in PENDING (even if isTrial is false, if it's the only one)
             // Sometimes isTrial might not be set correctly on older migrations
             if (sub.status === "PENDING" && sub.amount === 10) isCandidate = true; 
          }
          
          // Restore if it's TRIALING but broken (missing date)
          if (sub.status === "TRIALING" && !sub.trialEndsAt) isCandidate = true;

          if (isCandidate) {
             candidateToRestore = sub;
             break; // Found one, stop looking
          }
       }

       if (candidateToRestore) {
          const newTrialEnd = new Date();
          newTrialEnd.setDate(newTrialEnd.getDate() + 30); // Give them 30 days from NOW

          await db.subscription.update({
            where: { id: candidateToRestore.id },
            data: { 
              status: "TRIALING", 
              trialEndsAt: newTrialEnd,
              isTrial: true
            }
          });
          
          // Use this fixed subscription
          subscription = {
             ...candidateToRestore,
             status: "TRIALING",
             trialEndsAt: newTrialEnd,
             isTrial: true
          } as any;
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
