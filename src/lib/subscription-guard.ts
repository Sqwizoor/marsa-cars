import { SubscriptionStatus } from "@prisma/client";
import { db } from "./db";

const SELLER_ALLOWED_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
];

/**
 * Ensures the given user has an active paid plan or an unexpired trial.
 * Throws a descriptive error when the subscription requirement is not met.
 */
export async function ensureSellerSubscription(userId: string) {
  let subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: {
        in: SELLER_ALLOWED_STATUSES,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Self-healing: If no active subscription found, try to recover/fix it
  if (!subscription) {
    subscription = await tryRecoverSubscription(userId);
  }

  if (!subscription) {
    throw new Error(
      "An active subscription or trial is required to perform seller actions."
    );
  }

  const now = new Date();
  
  // Check expiration if dates are present
  const expiresAt =
    subscription.status === SubscriptionStatus.TRIALING
      ? subscription.trialEndsAt
      : subscription.endDate;

  if (expiresAt && now > expiresAt) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });

    throw new Error(
      "Your subscription period has ended. Please renew to continue selling."
    );
  }

  return subscription;
}

async function tryRecoverSubscription(userId: string) {
  // 1. Check recent subscriptions (last 5)
  const recentSubs = await db.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let candidateToRestore = null;

  for (const sub of recentSubs) {
    let isCandidate = false;

    // Check if it's recent enough
    if (sub.createdAt > sevenDaysAgo) {
      // Restore if it was working but expired prematurely
      if (sub.status === SubscriptionStatus.EXPIRED) isCandidate = true;
      
      // Restore if it was a trial attempt that got stuck in PENDING
      if (sub.status === SubscriptionStatus.PENDING && sub.isTrial) isCandidate = true;
      
      // Restore if it was a trial attempt that got stuck in PENDING (even if isTrial is false, if it's the only one)
      if (sub.status === SubscriptionStatus.PENDING && sub.amount === 10) isCandidate = true; 
    }
    
    // Restore if it's TRIALING but broken (missing date)
    if (sub.status === SubscriptionStatus.TRIALING && !sub.trialEndsAt) isCandidate = true;

    if (isCandidate) {
      candidateToRestore = sub;
      break;
    }
  }

  if (candidateToRestore) {
    const newTrialEnd = new Date();
    newTrialEnd.setDate(newTrialEnd.getDate() + 30); // Give them 30 days from NOW

    const updated = await db.subscription.update({
      where: { id: candidateToRestore.id },
      data: { 
        status: SubscriptionStatus.TRIALING, 
        trialEndsAt: newTrialEnd,
        isTrial: true
      }
    });
    
    return updated;
  }

  // 2. SELLER/ADVERTISER GUARANTEE: If still no subscription found, but user is a SELLER or ADVERTISER, force create/restore one
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, stores: { take: 1 } }
  });

  const hasStore = dbUser?.stores && dbUser.stores.length > 0;
  const isSellerOrAdvertiser = dbUser?.role === 'SELLER' || dbUser?.role === 'ADVERTISER';

  if (isSellerOrAdvertiser || hasStore) {
    // Fix role if needed
    if (hasStore && dbUser?.role !== 'SELLER') {
       await db.user.update({
          where: { id: userId },
          data: { role: 'SELLER' }
       });
    }

    // Try to find ANY subscription to restore
    const anySub = await db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const newTrialEnd = new Date();
    newTrialEnd.setDate(newTrialEnd.getDate() + 30);

    if (anySub) {
      // Restore the latest one found
      const updated = await db.subscription.update({
        where: { id: anySub.id },
        data: { 
          status: SubscriptionStatus.TRIALING, 
          trialEndsAt: newTrialEnd,
          isTrial: true,
          tier: "BRONZE", // Ensure it has a valid tier
          adLimit: 10     // Ensure it has limits
        }
      });
      return updated;
    } else {
      // Create a brand new one if absolutely nothing exists
      const newSub = await db.subscription.create({
        data: {
          userId,
          tier: "BRONZE",
          status: SubscriptionStatus.TRIALING,
          isTrial: true,
          trialEndsAt: newTrialEnd,
          amount: 10,
          currency: "ZAR",
          adLimit: 10,
          adsUsed: 0,
        }
      });
      return newSub;
    }
  }

  return null;
}
