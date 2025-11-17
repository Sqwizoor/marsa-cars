import { NextResponse } from "next/server";
import crypto from "crypto";

// Manual signature calculator to compare with PayFast
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { data, passphrase } = body;

    if (!data) {
      return NextResponse.json({ error: "Provide 'data' object with payment fields" }, { status: 400 });
    }

    // Method 1: Without passphrase
    const filtered1 = Object.keys(data)
      .filter(k => k !== "signature" && data[k] !== undefined && data[k] !== null && data[k] !== "")
      .sort();

    const paramString1 = filtered1.map(k => `${k}=${data[k]}`).join("&");
    const signature1 = crypto.createHash("md5").update(paramString1).digest("hex");

    // Method 2: With passphrase (if provided)
    let signature2 = null;
    let paramString2 = null;
    if (passphrase) {
      paramString2 = `${paramString1}&passphrase=${passphrase}`;
      signature2 = crypto.createHash("md5").update(paramString2).digest("hex");
    }

    // PayFast's test data example
    const testData: Record<string, string> = {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount: "100.00",
      item_name: "Test Item"
    };
    
    const testParamString = Object.keys(testData).sort().map(k => `${k}=${testData[k]}`).join("&");
    const testSignature = crypto.createHash("md5").update(testParamString).digest("hex");

    return NextResponse.json({
      yourData: {
        fields: data,
        withoutPassphrase: {
          parameterString: paramString1,
          signature: signature1,
        },
        withPassphrase: passphrase ? {
          parameterString: paramString2,
          signature: signature2,
        } : "No passphrase provided",
      },
      testExample: {
        description: "PayFast documentation test example",
        data: testData,
        parameterString: testParamString,
        expectedSignature: testSignature,
        note: "This should match PayFast's documentation example"
      },
      instructions: {
        step1: "Copy your payment data from console logs",
        step2: "POST to this endpoint with: { data: {...}, passphrase: 'optional' }",
        step3: "Compare signatures with PayFast error message",
        step4: "Try both with and without passphrase to see which matches"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
