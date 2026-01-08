import { NextRequest, NextResponse } from "next/server";
import { validateITNWithPayFast, verifyITNSignature } from "@/lib/payfast/utils";
import { activateSellerTrial } from "@/lib/store-activation";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const itn: Record<string, string> = {};
    params.forEach((value, key) => {
      itn[key] = value;
    });

    const signatureValid = verifyITNSignature(itn);
    if (!signatureValid) {
      console.warn("Invalid PayFast ITN signature for trial");
      return NextResponse.json({ status: "invalid signature" });
    }

    const validWithPayFast = await validateITNWithPayFast(bodyText);
    if (!validWithPayFast) {
      console.warn("PayFast ITN not validated for trial");
      return NextResponse.json({ status: "not valid with PayFast" });
    }

    const paymentStatus = itn["payment_status"];
    const mPaymentId = itn["m_payment_id"];

    // Accept both old trial_ and new sub_ prefixes
    if (!mPaymentId || (!mPaymentId.startsWith("trial_") && !mPaymentId.startsWith("sub_"))) {
      console.warn("ITN is not a trial/subscription payment", mPaymentId);
      return NextResponse.json({ status: "ignored" });
    }

    if (paymentStatus !== "COMPLETE") {
      console.warn("Payment not complete", paymentStatus);
      return NextResponse.json({ status: "pending" });
    }

    // sub_TIER_USERID_TIMESTAMP
    const parts = mPaymentId.split("_");
    const userId = mPaymentId.startsWith("trial_") ? parts[1] : parts[2];
    
    if (!userId) {
      console.error("No userId in m_payment_id");
      return NextResponse.json({ status: "error" });
    }

    const planTier = itn["custom_str1"] || "BRONZE";
    const amount = parseFloat(itn["amount_gross"] || "0");

    await activateSellerTrial(userId, planTier, amount);

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("Error in PayFast trial ITN", e);
    return NextResponse.json({ status: "error" });
  }
}
