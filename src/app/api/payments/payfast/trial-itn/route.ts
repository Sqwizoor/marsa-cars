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

    if (!mPaymentId || !mPaymentId.startsWith("trial_")) {
      console.warn("ITN is not a trial payment", mPaymentId);
      return NextResponse.json({ status: "ignored" });
    }

    if (paymentStatus !== "COMPLETE") {
      console.warn("Trial payment not complete", paymentStatus);
      return NextResponse.json({ status: "pending" });
    }

    const parts = mPaymentId.split("_");
    const userId = parts[1];
    if (!userId) {
      console.error("No userId in trial m_payment_id");
      return NextResponse.json({ status: "error" });
    }

    await activateSellerTrial(userId);

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("Error in PayFast trial ITN", e);
    return NextResponse.json({ status: "error" });
  }
}
