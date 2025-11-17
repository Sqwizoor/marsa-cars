import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Test multiple signature calculation methods to find which one PayFast accepts
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Development only" }, { status: 403 });
  }

  const merchantId = "10043652";
  const merchantKey = "aebbqm4eftntm";
  const passphrase = "blessedsibanda";

  // Minimal test parameters
  const params = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    amount: "100.00",
    item_name: "Test Item",
  };

  // Method 1: Current approach - all params including merchant_key
  const method1Entries = Object.keys(params)
    .sort()
    .map((k) => [k, String(params[k as keyof typeof params])] as const);
  const method1Str = method1Entries.map(([k, v]) => `${k}=${v.replace(/ /g, "+")}`).join("&");
  const method1SigStr = `${method1Str}&passphrase=${passphrase}`;
  const method1Sig = crypto.createHash("md5").update(method1SigStr).digest("hex");

  // Method 2: Exclude merchant_key from signature (some gateways do this)
  const method2Entries = Object.keys(params)
    .filter((k) => k !== "merchant_key")
    .sort()
    .map((k) => [k, String(params[k as keyof typeof params])] as const);
  const method2Str = method2Entries.map(([k, v]) => `${k}=${v.replace(/ /g, "+")}`).join("&");
  const method2SigStr = `${method2Str}&passphrase=${passphrase}`;
  const method2Sig = crypto.createHash("md5").update(method2SigStr).digest("hex");

  // Method 3: Exclude merchant_id and merchant_key (data-only)
  const method3Entries = Object.keys(params)
    .filter((k) => k !== "merchant_key" && k !== "merchant_id")
    .sort()
    .map((k) => [k, String(params[k as keyof typeof params])] as const);
  const method3Str = method3Entries.map(([k, v]) => `${k}=${v.replace(/ /g, "+")}`).join("&");
  const method3SigStr = `${method3Str}&passphrase=${passphrase}`;
  const method3Sig = crypto.createHash("md5").update(method3SigStr).digest("hex");

  return NextResponse.json({
    credentials: {
      merchantId,
      merchantKey: `${merchantKey.substring(0, 3)}...`,
      passphrase: `${passphrase.substring(0, 3)}...`,
    },
    methods: {
      method1: {
        name: "Include all params + passphrase (CURRENT)",
        paramString: method1Str,
        fullString: method1SigStr,
        signature: method1Sig,
      },
      method2: {
        name: "Exclude merchant_key + passphrase",
        paramString: method2Str,
        fullString: method2SigStr,
        signature: method2Sig,
      },
      method3: {
        name: "Exclude merchant_id & merchant_key + passphrase",
        paramString: method3Str,
        fullString: method3SigStr,
        signature: method3Sig,
      },
    },
    instructions:
      "Check PayFast dashboard - it should show you the expected signature. Try each method and see which matches.",
  });
}
