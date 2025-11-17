import { NextResponse } from "next/server";
import crypto from "crypto";

// Manual PayFast signature verification using your exact credentials
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { params, passphrase } = body;

    if (!params) {
      return NextResponse.json({ error: "Provide 'params' object" }, { status: 400 });
    }

    // Method 1: Simple space-to-plus replacement
    const entries1 = Object.keys(params)
      .filter((k) => k !== "signature" && params[k] !== undefined && params[k] !== null && params[k] !== "")
      .sort()
      .map((k) => [k, String(params[k]).trim()] as const);

    const str1 = entries1.map(([k, v]) => `${k}=${v.replace(/ /g, "+")}`).join("&");
    const str1WithPass = passphrase ? `${str1}&passphrase=${String(passphrase).trim().replace(/ /g, "+")}` : str1;
    const sig1 = crypto.createHash("md5").update(str1WithPass).digest("hex");

    // Method 2: No encoding at all (raw)
    const str2 = entries1.map(([k, v]) => `${k}=${v}`).join("&");
    const str2WithPass = passphrase ? `${str2}&passphrase=${String(passphrase).trim()}` : str2;
    const sig2 = crypto.createHash("md5").update(str2WithPass).digest("hex");

    // Method 3: URL encode, then convert %20 to +
    const str3 = entries1
      .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
      .join("&");
    const str3WithPass = passphrase ? `${str3}&passphrase=${encodeURIComponent(String(passphrase).trim()).replace(/%20/g, "+")}` : str3;
    const sig3 = crypto.createHash("md5").update(str3WithPass).digest("hex");

    return NextResponse.json({
      method1: {
        description: "Spaces to +, raw otherwise",
        string: str1WithPass,
        signature: sig1,
      },
      method2: {
        description: "Completely raw, no encoding",
        string: str2WithPass,
        signature: sig2,
      },
      method3: {
        description: "URL encode, then %20 to +",
        string: str3WithPass,
        signature: sig3,
      },
      instructions: "Try each signature on PayFast; one should work",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
