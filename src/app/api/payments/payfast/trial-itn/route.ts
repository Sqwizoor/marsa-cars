import { NextRequest, NextResponse } from "next/server";
import { validateITNWithPayFast, verifyITNSignature, isFromPayFast } from "@/lib/payfast/utils";
import { getPayFastConfig } from "@/lib/payfast/config";
import { activateSellerTrial } from "@/lib/store-activation";
import { getSubscriptionPlanByTier, type SubscriptionPlanTier } from "@/constants/subscription-plans";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const itn: Record<string, string> = {};
    params.forEach((value, key) => {
      itn[key] = value;
    });

    // Log ITN receipt for debugging
    console.log("PayFast Trial ITN received:", {
      payment_status: itn["payment_status"],
      m_payment_id: itn["m_payment_id"],
      amount: itn["amount_gross"],
    });

    // 1. Verify signature
    const signatureValid = verifyITNSignature(itn);
    if (!signatureValid) {
      console.warn("Invalid PayFast ITN signature for trial");
      // Return 200 so PayFast stops retrying
      return new NextResponse("OK", { status: 200 });
    }

    // 2. Validate with PayFast servers
    const validWithPayFast = await validateITNWithPayFast(bodyText);
    if (!validWithPayFast) {
      console.warn("PayFast ITN not validated for trial");
      return new NextResponse("OK", { status: 200 });
    }

    // 3. IP Validation (critical security check in live mode)
    let cfg;
    try {
      cfg = getPayFastConfig();
    } catch (error) {
      console.error("PayFast config error in trial ITN:", error);
      return new NextResponse("OK", { status: 200 });
    }

    if (cfg.mode === "live") {
      const fwd = req.headers.get("x-forwarded-for");
      const clientIp = fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip");
      if (!isFromPayFast(clientIp)) {
        console.warn("Trial ITN from invalid IP:", clientIp);
        return new NextResponse("OK", { status: 200 });
      }
    }

    const paymentStatus = itn["payment_status"];
    const mPaymentId = itn["m_payment_id"];

    // Accept both old trial_ and new sub_ prefixes
    if (!mPaymentId || (!mPaymentId.startsWith("trial_") && !mPaymentId.startsWith("sub_"))) {
      console.warn("ITN is not a trial/subscription payment", mPaymentId);
      return new NextResponse("OK", { status: 200 });
    }

    if (paymentStatus !== "COMPLETE") {
      console.warn("Payment not complete", paymentStatus);
      return new NextResponse("OK", { status: 200 });
    }

    // 4. Amount Validation - verify paid amount matches expected plan price
    const planTier = (itn["custom_str1"] || "BRONZE") as SubscriptionPlanTier;
    const selectedPlan = getSubscriptionPlanByTier(planTier);
    const expectedAmount = selectedPlan?.price || 0;
    const paidAmount = parseFloat(itn["amount_gross"] || "0");

    // Allow small tolerance (1 ZAR) for rounding differences
    if (expectedAmount > 0 && Math.abs(expectedAmount - paidAmount) > 1) {
      console.warn("Trial ITN amount mismatch:", { 
        expected: expectedAmount, 
        paid: paidAmount,
        plan: planTier 
      });
      return new NextResponse("OK", { status: 200 });
    }

    // sub_TIER_USERID_TIMESTAMP
    const parts = mPaymentId.split("_");
    const userId = mPaymentId.startsWith("trial_") ? parts[1] : parts[2];
    
    if (!userId) {
      console.error("No userId in m_payment_id");
      return new NextResponse("OK", { status: 200 });
    }

    // All validations passed - activate the subscription
    console.log("Activating seller trial for user:", userId, "plan:", planTier);
    await activateSellerTrial(userId, planTier, paidAmount);

    return new NextResponse("OK", { status: 200 });
  } catch (e: any) {
    console.error("Error in PayFast trial ITN", e);
    // Always return 200 to prevent PayFast from retrying
    return new NextResponse("OK", { status: 200 });
  }
}
