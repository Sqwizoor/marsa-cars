import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only in development" }, { status: 403 });
  }

  try {
    const merchantId = process.env.PAYFAST_MERCHANT_ID || "10043652";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "aebbqm4eftntm";
    const passphrase = process.env.PAYFAST_PASSPHRASE || "blessedsibanda";

    // Test data
    const testData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: "http://localhost:3000/checkout/payfast-return",
      cancel_url: "http://localhost:3000/checkout/payfast-cancel",
      notify_url: "http://localhost:3000/api/payments/payfast/itn",
      amount: "100.00",
      item_name: "Test+Item",
      m_payment_id: "test-123",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
    };

    // Calculate signature exactly like PayFast expects
    const entries = Object.keys(testData)
      .filter((k) => testData[k as keyof typeof testData] !== undefined && testData[k as keyof typeof testData] !== null && testData[k as keyof typeof testData] !== "")
      .sort()
      .map((k) => [k, String(testData[k as keyof typeof testData]).trim()] as const);

    const baseStr = entries
      .map(([k, v]) => `${k}=${v.replace(/ /g, "+")}`)
      .join("&");

    const sigStr = `${baseStr}&passphrase=${passphrase.trim().replace(/ /g, "+")}`;
    const signature = crypto.createHash("md5").update(sigStr).digest("hex");

    return NextResponse.json({
      testData,
      signatureString: sigStr,
      signature,
      note: "Compare this signature with what PayFast calculates",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
