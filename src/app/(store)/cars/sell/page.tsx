import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SellCarClient from "./sell-car-client";

export const metadata: Metadata = {
  title: "Sell Your Car | List Your Vehicle for Sale",
  description: "Sell your car quickly and easily. List your vehicle with photos and reach thousands of potential buyers.",
};

export default async function SellCarPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/cars/sell");
  }

  // Check if user has active car subscription
  const subscription = await db.carSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  return <SellCarClient initialSubscription={subscription} />;
}
