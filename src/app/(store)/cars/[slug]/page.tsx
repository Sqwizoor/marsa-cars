import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CarDetailClient from "./car-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const listing = await db.carListing.findUnique({
    where: { slug },
    select: { title: true, make: true, model: true, year: true, price: true },
  });

  if (!listing) {
    return {
      title: "Car Not Found",
    };
  }

  const price = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return {
    title: `${listing.year} ${listing.make} ${listing.model} for Sale | ${price}`,
    description: `Buy this ${listing.year} ${listing.make} ${listing.model} for ${price}. View photos, specs, and contact the seller.`,
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const listing = await db.carListing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      user: { select: { id: true, name: true, picture: true } },
      carSubscription: {
        select: {
          tier: true,
          sellerType: true,
          dealerName: true,
          dealerLogo: true,
          dealerPhone: true,
          dealerAddress: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Increment view count
  await db.carListing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  });

  return <CarDetailClient listing={listing as any} />;
}
