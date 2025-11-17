import { NextResponse } from "next/server";
import { generateSignature, buildParameterString } from "@/lib/payfast/signature";
import { getPayFastConfig } from "@/lib/payfast/config";

// Test signature generation with known values
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const cfg = getPayFastConfig();

    // Test case 1: Simple test data (no passphrase)
    const testData1 = {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount: "100.00",
      item_name: "Test Item",
    };

    const paramString1 = buildParameterString(testData1);
    const signature1 = generateSignature(testData1);

    // Test case 2: Full payment data (with your actual config)
    const testData2 = {
      merchant_id: cfg.merchantId,
      merchant_key: cfg.merchantKey,
      return_url: cfg.returnUrl,
      cancel_url: cfg.cancelUrl,
      notify_url: cfg.notifyUrl,
      m_payment_id: "test-123",
      amount: "100.00",
      item_name: "Test Order",
      item_description: "Test payment",
      email_address: "test@example.com",
      name_first: "Test",
      name_last: "User",
      email_confirmation: "1",
    };

    const paramString2 = buildParameterString(testData2, cfg.passphrase);
    const signature2 = generateSignature(testData2, cfg.passphrase);

    return NextResponse.json({
      success: true,
      config: {
        hasPassphrase: !!cfg.passphrase,
        passphrase: cfg.passphrase ? `***${cfg.passphrase.slice(-3)}` : "(empty)",
      },
      test1: {
        description: "Simple test (no passphrase)",
        data: testData1,
        parameterString: paramString1,
        signature: signature1,
      },
      test2: {
        description: "Full test (with your config)",
        data: testData2,
        parameterString: paramString2,
        signature: signature2,
      },
      notes: [
        "The parameter string should NOT be URL encoded for signature generation",
        "Signature is MD5 hash of the parameter string",
        "If you have a passphrase set in PayFast dashboard, it MUST match your .env",
        "In sandbox, passphrase is optional but recommended",
        "All parameter keys must be sorted alphabetically",
      ],
      troubleshooting: {
        step1: "Check if PAYFAST_PASSPHRASE in .env matches your PayFast dashboard",
        step2: "If no passphrase in dashboard, ensure PAYFAST_PASSPHRASE is empty in .env",
        step3: "Verify all field values match exactly (including trailing spaces)",
        step4: "Check that email_confirmation is sent as '1' (string), not 1 (number)",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
