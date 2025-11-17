import { SubscriptionStatus } from "@prisma/client";
import { db } from "./db";

// Temporary fallback: Prisma client types may not include TRIALING until generate runs.
const TRIALING_STATUS = "TRIALING" as unknown as SubscriptionStatus;

const SELLER_ALLOWED_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  TRIALING_STATUS,
];

/**
 * Ensures the given user has an active paid plan or an unexpired trial.
 * Throws a descriptive error when the subscription requirement is not met.
 */
export async function ensureSellerSubscription(userId: string) {
  const subscription = await db.subscription.findFirst({
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

  if (!subscription) {
    throw new Error(
      "An active subscription or trial is required to perform seller actions."
    );
  }

  const now = new Date();
  const subscriptionWithTrial = subscription as typeof subscription & {
    trialEndsAt?: Date | null;
  };

  const expiresAt =
    subscription.status === TRIALING_STATUS
      ? subscriptionWithTrial.trialEndsAt
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
