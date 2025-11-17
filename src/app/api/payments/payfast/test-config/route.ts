import { NextRequest, NextResponse } from "next/server";
import { getPayFastConfig } from "@/lib/payfast/config";
import { generateSignature } from "@/lib/payfast/signature";

// Test endpoint to validate PayFast configuration (only in development)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const cfg = getPayFastConfig();

    // Test data matching PayFast sandbox requirements
    const testData = {
      merchant_id: cfg.merchantId,
      merchant_key: cfg.merchantKey,
      return_url: cfg.returnUrl,
      cancel_url: cfg.cancelUrl,
      notify_url: cfg.notifyUrl,
      m_payment_id: "test-order-123",
      amount: "100.00",
      item_name: "Test Order",
      item_description: "Test payment",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
      email_confirmation: 1,
    };

    const signature = generateSignature(testData, cfg.passphrase);

    return NextResponse.json({
      success: true,
      config: {
        mode: cfg.mode,
        merchantId: cfg.merchantId,
        merchantKeyLength: cfg.merchantKey.length,
        hasPassphrase: !!cfg.passphrase,
        passphraseLength: cfg.passphrase?.length || 0,
        returnUrl: cfg.returnUrl,
        cancelUrl: cfg.cancelUrl,
        notifyUrl: cfg.notifyUrl,
      },
      testSignature: signature,
      testData,
      notes: [
        "Sandbox max amount: ~10,000 ZAR",
        "Amount must be formatted with 2 decimal places",
        "All URLs must be accessible (consider using ngrok for localhost)",
        "Email address must be valid format",
        cfg.passphrase ? "Passphrase is configured" : "No passphrase set (optional but recommended)",
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message,
      notes: "Check your .env file for PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY"
    }, { status: 500 });
  }
}
