-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'TRIALING';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
