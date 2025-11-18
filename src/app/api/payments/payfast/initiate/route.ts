import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getPayFastConfig } from "@/lib/payfast/config";
import { buildRedirectUrl } from "@/lib/payfast/utils";
import { db } from "@/lib/db";

// Initiate a PayFast payment: expects JSON { orderId: string }
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId, userId: user.id },
      include: { paymentDetails: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If already paid
    if (order.paymentStatus === "Paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    let cfg;
    try {
      cfg = getPayFastConfig();
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

    // PayFast sandbox limits: max amount ~10,000 ZAR
    let amount = order.total;
    if (cfg.mode === "sandbox" && amount > 10000) {
      console.warn(`PayFast sandbox: amount ${amount} exceeds limit, capping at 10000`);
      amount = 10000;
    }
    const amountStr = amount.toFixed(2);

    // Get email and validate format
    const email = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Build payment request in the exact order specified by PayFast docs
    // 1) Merchant details, 2) Customer details, 3) Transaction details, 4) Options, 5) Payment method
    const entries: Array<[string, string]> = [
      // Merchant details
      ["merchant_id", cfg.merchantId],
      ["merchant_key", cfg.merchantKey],
      ["return_url", cfg.returnUrl],
      ["cancel_url", cfg.cancelUrl],
      ["notify_url", cfg.notifyUrl],
      // Customer details
      ["name_first", user.firstName || ""],
      ["name_last", user.lastName || ""],
      ["email_address", email],
      // ["cell_number", ""], // not used
      // Transaction details
      ["m_payment_id", order.id],
      ["amount", amountStr],
      ["item_name", `Order ${order.id}`],
      // ["item_description", ""],
      // Options
      // ["email_confirmation", "1"],
      // ["confirmation_address", email],
      // Payment method (optional)
      // ["payment_method", "cc"],
    ];

    // Filter out any blank values while preserving order
    const paymentRequest: Record<string, string> = {};
    for (const [k, v] of entries) {
      if (v !== undefined && v !== null && String(v) !== "") {
        paymentRequest[k] = v;
      }
    }

    const redirect = buildRedirectUrl(paymentRequest as any);

    console.log("PayFast redirect URL:", redirect);
    
    return NextResponse.json({ redirect });
  } catch (e: any) {
    console.error("PayFast initiate error", e);
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 });
  }
}
