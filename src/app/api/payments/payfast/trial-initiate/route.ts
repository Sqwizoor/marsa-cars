import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getPayFastConfig } from "@/lib/payfast/config";
import { buildRedirectUrl } from "@/lib/payfast/utils";
import type { StoreType } from "@/lib/types";
import { getSubscriptionPlanByTier, type SubscriptionPlanTier } from "@/constants/subscription-plans";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = (await req.json()) as { store: StoreType; plan: SubscriptionPlanTier };
    if (!body?.store) {
      return NextResponse.json({ error: "Missing store data" }, { status: 400 });
    }

    const selectedPlan = getSubscriptionPlanByTier(body.plan);
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    let dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
          picture: user.imageUrl || "",
          role: (user.privateMetadata.role as "USER" | "ADMIN" | "SELLER") || "USER",
        },
      });
    }

    await db.storeApplication.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        data: body.store,
      },
      update: {
        data: body.store,
      },
    });

    let cfg;
    try {
      cfg = getPayFastConfig();
    } catch (configError: any) {
      console.error("PayFast configuration error:", configError.message);
      return NextResponse.json(
        { 
          error: "Payment system not configured", 
          details: "PayFast credentials are missing. Please contact support."
        },
        { status: 503 }
      );
    }
    const email =
      user.emailAddresses?.[0]?.emailAddress ||
      user.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const amountStr = selectedPlan.price.toFixed(2);
    const paymentId = `sub_${selectedPlan.tier}_${user.id}_${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? "https://marsa-cars.vercel.app" : "http://localhost:3000");

    const entries: Array<[string, string]> = [
      ["merchant_id", cfg.merchantId],
      ["merchant_key", cfg.merchantKey],
      ["return_url", `${appUrl}/seller/apply/success`],
      ["cancel_url", `${appUrl}/seller/apply/cancel`],
      ["notify_url", `${appUrl}/api/payments/payfast/trial-itn`],
      ["name_first", user.firstName || ""],
      ["name_last", user.lastName || ""],
      ["email_address", email],
      ["m_payment_id", paymentId],
      ["amount", amountStr],
      ["item_name", `${selectedPlan.name} Subscription`],
      ["subscription_type", "1"], // 1 = Subscription
      ["billing_date", new Date().toISOString().split('T')[0]], // Start immediately
      ["recurring_amount", amountStr],
      ["frequency", "3"], // 3 = Monthly
      ["cycles", "0"], // 0 = Indefinite
      ["custom_str1", selectedPlan.tier], // Pass plan tier to ITN
    ];

    const paymentRequest: Record<string, string> = {};
    for (const [k, v] of entries) {
      if (v !== undefined && v !== null && String(v) !== "") {
        paymentRequest[k] = v;
      }
    }

    const redirect = buildRedirectUrl(paymentRequest as any);
    return NextResponse.json({ redirect });
  } catch (e: any) {
    console.error("PayFast trial initiate error", e);
    return NextResponse.json(
      { error: "Server error", details: e.message },
      { status: 500 },
    );
  }
}
