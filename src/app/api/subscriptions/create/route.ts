import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getPayFastConfig, getPayFastBaseUrl } from "@/lib/payfast/config";
import { appendSignature } from "@/lib/payfast/signature";
import { PayFastPaymentRequest } from "@/lib/payfast/types";

// Subscription tier pricing and limits
const SUBSCRIPTION_PLANS = {
  BRONZE: {
    price: 499,
    adLimit: 100,
    name: "Bronze Plan",
    description: "100 ads per month",
  },
  SILVER: {
    price: 699,
    adLimit: 250,
    name: "Silver Plan",
    description: "250 ads per month",
  },
  GOLD: {
    price: 1399,
    adLimit: -1, // unlimited
    name: "Gold Plan",
    description: "Unlimited ads",
  },
};

const TRIAL_DURATION_DAYS = 60;

function getSubscriptionModel() {
  const client: any = db as any;
  if (!client.subscription) {
    console.error("Prisma client missing 'subscription' model. Run 'npx prisma generate'.");
    return null;
  }
  return client.subscription as any;
}

const ACTIVE_STATUSES = ["ACTIVE", "TRIALING", "PENDING"] as const;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    // Validate tier
    if (!tier || !["BRONZE", "SILVER", "GOLD"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptionModel = getSubscriptionModel();
    if (!subscriptionModel) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Check for existing active/trial/pending subscription
    const latestSubscription = await subscriptionModel.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES as unknown as string[] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    if (latestSubscription) {
      const hasExpiredPaidPlan =
        latestSubscription.status === "ACTIVE" &&
        latestSubscription.endDate &&
        latestSubscription.endDate < now;

      const hasExpiredTrial =
        latestSubscription.status === "TRIALING" &&
        latestSubscription.trialEndsAt &&
        latestSubscription.trialEndsAt < now;

      if (hasExpiredPaidPlan || hasExpiredTrial) {
        await subscriptionModel.update({
          where: { id: latestSubscription.id },
          data: {
            status: "EXPIRED",
          },
        });
      } else {
        // If subscription hasn't expired yet, block duplicate request
        return NextResponse.json(
          {
            error:
              latestSubscription.status === "TRIALING"
                ? "You already have an active trial"
                : "You already have an active subscription",
            subscription: latestSubscription,
          },
          { status: 400 }
        );
      }
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[tier as keyof typeof SUBSCRIPTION_PLANS];

    // If user never had a trial, start it automatically
    const existingTrial = await subscriptionModel.findFirst({
      where: {
        userId,
        isTrial: true,
      },
    });

    if (!existingTrial) {
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

      const trialSubscription = await subscriptionModel.create({
        data: {
          userId,
          tier,
          status: "TRIALING",
          isTrial: true,
          trialEndsAt,
          startDate: now,
          amount: plan.price,
          currency: "ZAR",
          adLimit: plan.adLimit,
          adsUsed: 0,
          paymentStatus: "TRIAL",
        },
      });

      return NextResponse.json({
        subscription: trialSubscription,
        trialStarted: true,
        trialEndsAt,
      });
    }

    // Create subscription record for paid plan
    const subscription = await subscriptionModel.create({
      data: {
        userId: userId,
        tier: tier,
        status: "PENDING",
        amount: plan.price,
        currency: "ZAR",
        adLimit: plan.adLimit,
        adsUsed: 0,
      },
    });

    // Create PayFast payment request
    let config;
    try {
      config = getPayFastConfig();
    } catch (error) {
      console.error("PayFast config error:", error);
      
      // Check if it's a missing credentials error
      if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
        return NextResponse.json({
          error: "PayFast payment gateway is not configured. Please contact support.",
          details: "Missing payment gateway credentials"
        }, { status: 503 });
      }
      
      return NextResponse.json({
        error: "Payment configuration error",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    const baseUrl = getPayFastBaseUrl(config.mode);

    const paymentData: PayFastPaymentRequest = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions/success?subscription_id=${subscription.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/webhook`,
      m_payment_id: subscription.id,
      amount: plan.price.toFixed(2),
      item_name: plan.name,
      item_description: plan.description,
      email_address: user.email,
      name_first: user.name.split(" ")[0] || user.name,
      name_last: user.name.split(" ").slice(1).join(" ") || "",
      custom_str1: tier,
      custom_str2: userId,
    };

    // Add signature
    const signedPayment = appendSignature(paymentData, config.passphrase);

    // Return payment URL and data
    return NextResponse.json({
      subscription,
      paymentUrl: `${baseUrl}/eng/process`,
      paymentData: signedPayment,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
