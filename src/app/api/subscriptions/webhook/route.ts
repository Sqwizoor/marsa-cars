import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPayFastConfig } from "@/lib/payfast/config";
import { generateSignature } from "@/lib/payfast/signature";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("PayFast Subscription Webhook received:", data);

    // Verify signature
    const config = getPayFastConfig();
    const receivedSignature = data.signature;
    delete data.signature; // Remove signature before validation

    const calculatedSignature = generateSignature(data, config.passphrase);

    if (receivedSignature !== calculatedSignature) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Extract payment details
    const subscriptionId = data.m_payment_id;
    const paymentStatus = data.payment_status;
    const paymentId = data.pf_payment_id;

    // Find subscription
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Update subscription based on payment status
    if (paymentStatus === "COMPLETE") {
      // Calculate subscription period (30 days)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          paymentStatus: "COMPLETE",
          paymentId: paymentId,
          startDate: startDate,
          endDate: endDate,
        },
      });

      // Update user role to ADVERTISER
      await db.user.update({
        where: { id: subscription.userId },
        data: {
          role: "ADVERTISER",
        },
      });

      console.log("Subscription activated:", subscriptionId);
    } else {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
          paymentStatus: paymentStatus,
          paymentId: paymentId,
        },
      });

      console.log("Subscription payment failed:", subscriptionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing subscription webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
