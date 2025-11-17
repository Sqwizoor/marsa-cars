import { NextResponse } from "next/server";
import { getPayFastConfig } from "@/lib/payfast/config";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const cfg = getPayFastConfig();

  return NextResponse.json({
    mode: cfg.mode,
    merchantId: cfg.merchantId,
    merchantKey: cfg.merchantKey,
    passphrase: cfg.passphrase ? `[${cfg.passphrase.length} chars]` : "[NOT SET]",
    baseUrl: "https://sandbox.payfast.co.za",
    env: {
      PAYFAST_MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID || "[NOT SET]",
      PAYFAST_MERCHANT_KEY: process.env.PAYFAST_MERCHANT_KEY || "[NOT SET]",
      PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE ? `[${process.env.PAYFAST_PASSPHRASE.length} chars]` : "[NOT SET]",
    },
  });
}
