import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateITNWithPayFast, verifyITNSignature } from "@/lib/payfast/utils";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const itn: Record<string, string> = {};
    params.forEach((value, key) => {
      itn[key] = value;
    });

    const signatureValid = verifyITNSignature(itn);
    if (!signatureValid) {
      console.warn("Invalid PayFast ITN signature for trial");
      return NextResponse.json({ status: "invalid signature" });
    }

    const validWithPayFast = await validateITNWithPayFast(bodyText);
    if (!validWithPayFast) {
      console.warn("PayFast ITN not validated for trial");
      return NextResponse.json({ status: "not valid with PayFast" });
    }

    const paymentStatus = itn["payment_status"];
    const mPaymentId = itn["m_payment_id"];

    if (!mPaymentId || !mPaymentId.startsWith("trial_")) {
      console.warn("ITN is not a trial payment", mPaymentId);
      return NextResponse.json({ status: "ignored" });
    }

    if (paymentStatus !== "COMPLETE") {
      console.warn("Trial payment not complete", paymentStatus);
      return NextResponse.json({ status: "pending" });
    }

    const parts = mPaymentId.split("_");
    const userId = parts[1];
    if (!userId) {
      console.error("No userId in trial m_payment_id");
      return NextResponse.json({ status: "error" });
    }

    const application = await db.storeApplication.findUnique({
      where: { userId },
    });
    if (!application) {
      console.error("No store application found for user", userId);
      return NextResponse.json({ status: "no application" });
    }

    const storeData = application.data as any;

    await db.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          userId,
          tier: "BRONZE",
          status: "TRIALING",
          isTrial: true,
          amount: 10,
          currency: "ZAR",
          adLimit: 10,
          adsUsed: 0,
        },
      });

      await tx.store.create({
        data: {
          name: storeData.name,
          description: storeData.description,
          email: storeData.email,
          phone: storeData.phone,
          url: storeData.url,
          logo: storeData.logo,
          cover: storeData.cover,
          returnPolicy:
            storeData.returnPolicy || "Return in 30 days.",
          defaultShippingService:
            storeData.defaultShippingService || "International Delivery",
          defaultShippingFeePerItem: storeData.defaultShippingFeePerItem ?? 0,
          defaultShippingFeeForAdditionalItem:
            storeData.defaultShippingFeeForAdditionalItem ?? 0,
          defaultShippingFeePerKg: storeData.defaultShippingFeePerKg ?? 0,
          defaultShippingFeeFixed: storeData.defaultShippingFeeFixed ?? 0,
          defaultDeliveryTimeMin: storeData.defaultDeliveryTimeMin ?? 7,
          defaultDeliveryTimeMax: storeData.defaultDeliveryTimeMax ?? 31,
          status: "ACTIVE",
          userId,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: "SELLER",
        },
      });

      await tx.storeApplication.delete({
        where: { userId },
      });
    });

    // Also sync role into Clerk metadata so UI immediately reflects seller status
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        privateMetadata: { role: "SELLER" },
      });
      console.log(`Successfully updated Clerk privateMetadata for user ${userId} to SELLER`);
    } catch (err) {
      console.error("Failed to update Clerk metadata for seller role", err);
    }

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("Error in PayFast trial ITN", e);
    return NextResponse.json({ status: "error" });
  }
}
