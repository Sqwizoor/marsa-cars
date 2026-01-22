import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CarListingForm from "./car-listing-form";

export const metadata: Metadata = {
  title: "Create Car Listing | Dashboard",
  description: "List your car for sale",
};

export default async function NewCarListingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/dashboard/cars/new");
  }

  // Check if user has active car subscription
  const subscription = await db.carSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  // If no subscription, redirect to sell page to choose a plan
  if (!subscription) {
    redirect("/cars/sell");
  }

  // Check listing limit
  const canCreateListing = 
    subscription.listingLimit === -1 || 
    subscription.listingsUsed < subscription.listingLimit;

  return (
    <CarListingForm 
      subscription={subscription} 
      canCreate={canCreateListing} 
    />
  );
}
