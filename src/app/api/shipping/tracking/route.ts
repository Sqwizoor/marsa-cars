import { NextRequest, NextResponse } from "next/server";
import {
  getOrderGroupTracking,
  lookupOrderOrTracking,
  saveOrderGroupTracking,
} from "@/queries/tracking";

/**
 * GET /api/shipping/tracking?q=<ref_or_orderId>
 * GET /api/shipping/tracking?ref=<bobgo_tracking_reference>
 * GET /api/shipping/tracking?orderId=<orderId>
 * GET /api/shipping/tracking?groupId=<orderGroupId>
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const queryStr =
      searchParams.get("q") ||
      searchParams.get("ref") ||
      searchParams.get("orderId") ||
      "";

    if (groupId && !queryStr) {
      const tracking = await getOrderGroupTracking(groupId, true);
      return NextResponse.json({
        results: tracking ? [tracking] : [],
      });
    }

    if (!queryStr.trim()) {
      return NextResponse.json(
        { error: "Please provide a tracking reference or order ID." },
        { status: 400 }
      );
    }

    const results = await lookupOrderOrTracking(queryStr);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Bob Go Tracking API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve tracking information" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shipping/tracking
 * Seller/Admin endpoint to attach or update a Bob Go tracking reference on an OrderGroup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      storeId,
      orderGroupId,
      trackingReference,
      providerTrackingReference,
      courierName,
      serviceLevel,
      markAsShipped,
    } = body;

    if (!orderGroupId || !trackingReference) {
      return NextResponse.json(
        { error: "orderGroupId and trackingReference are required." },
        { status: 400 }
      );
    }

    const result = await saveOrderGroupTracking({
      storeId: storeId || "",
      orderGroupId,
      trackingReference,
      providerTrackingReference,
      courierName,
      serviceLevel,
      markAsShipped,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Save Bob Go Tracking Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save tracking reference" },
      { status: 500 }
    );
  }
}
