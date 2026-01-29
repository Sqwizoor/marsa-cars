import { NextRequest, NextResponse } from "next/server";
import { BobGoClient } from "@/lib/bobgo/client";
import { BobGoRateRequest } from "@/lib/bobgo/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection_address, delivery_address, parcels } = body as BobGoRateRequest;

    if (!collection_address || !delivery_address || !parcels) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const rates = await BobGoClient.getRates({
      collection_address,
      delivery_address,
      parcels,
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("Shipping Rates API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
