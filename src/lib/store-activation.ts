import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function activateSellerTrial(userId: string) {
  const application = await db.storeApplication.findUnique({
    where: { userId },
  });

  if (!application) {
    throw new Error("No store application found");
  }

  const storeData = application.data as any;

  await db.$transaction(async (tx) => {
    // Check if subscription already exists to avoid duplicates
    const existingSub = await tx.subscription.findFirst({
      where: { userId },
    });

    if (!existingSub) {
      // Set trial end date to 30 days from now
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      await tx.subscription.create({
        data: {
          userId,
          tier: "BRONZE",
          status: "TRIALING",
          isTrial: true,
          trialEndsAt,
          amount: 10,
          currency: "ZAR",
          adLimit: 10,
          adsUsed: 0,
        },
      });
    }

    // Check if store already exists
    const existingStore = await tx.store.findFirst({
      where: { userId },
    });

    if (!existingStore) {
      await tx.store.create({
        data: {
          name: storeData.name,
          description: storeData.description,
          email: storeData.email,
          phone: storeData.phone,
          url: storeData.url,
          logo: storeData.logo,
          cover: storeData.cover,
          returnPolicy: storeData.returnPolicy || "Return in 30 days.",
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
    }

    await tx.user.update({
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
    console.log(
      `Successfully updated Clerk privateMetadata for user ${userId} to SELLER`
    );
  } catch (err) {
    console.error("Failed to update Clerk metadata for seller role", err);
  }
}
