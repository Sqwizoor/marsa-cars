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

    // 3. SELLER/ADVERTISER GUARANTEE: If still no subscription found, but user is a SELLER or ADVERTISER, force create/restore one
    if (!subscription) {
       const dbUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true }
       });

       if (dbUser?.role === 'SELLER' || dbUser?.role === 'ADVERTISER') {
          // Try to find ANY subscription to restore
          const anySub = await db.subscription.findFirst({
             where: { userId },
             orderBy: { createdAt: "desc" }
          });

          const newTrialEnd = new Date();
          newTrialEnd.setDate(newTrialEnd.getDate() + 30);

          if (anySub) {
             // Restore the latest one found
             await db.subscription.update({
                where: { id: anySub.id },
                data: { 
                   status: "TRIALING", 
                   trialEndsAt: newTrialEnd,
                   isTrial: true,
                   tier: "BRONZE", // Ensure it has a valid tier
                   adLimit: 10     // Ensure it has limits
                }
             });
             subscription = {
                ...anySub,
                status: "TRIALING",
                trialEndsAt: newTrialEnd,
                isTrial: true,
                tier: "BRONZE",
                adLimit: 10
             } as any;
          } else {
             // Create a brand new one if absolutely nothing exists
             subscription = await db.subscription.create({
                data: {
                   userId,
                   tier: "BRONZE",
                   status: "TRIALING",
                   isTrial: true,
                   trialEndsAt: newTrialEnd,
                   amount: 10,
                   currency: "ZAR",
                   adLimit: 10,
                   adsUsed: 0,
                }
             });
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
