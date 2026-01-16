import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      make,
      model,
      year,
      variant,
      price,
      priceNegotiable,
      mileage,
      fuelType,
      transmission,
      condition,
      bodyType,
      color,
      engineSize,
      drivetrain,
      doors,
      seats,
      vin,
      regNumber,
      province,
      city,
      features,
      images,
    } = body;

    // Validate required fields
    if (!title || !description || !make || !model || !year || !price || !mileage || !fuelType || !transmission || !condition || !province || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get active subscription
    const subscription = await db.carSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "You need an active car subscription to create listings" },
        { status: 403 }
      );
    }

    // Check listing limit
    if (
      subscription.listingLimit !== -1 &&
      subscription.listingsUsed >= subscription.listingLimit
    ) {
      return NextResponse.json(
        { error: "You have reached your listing limit. Upgrade your plan to list more cars." },
        { status: 403 }
      );
    }

    // Generate unique slug
    const baseSlug = `${make}-${model}-${year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create listing with images
    const listing = await db.carListing.create({
      data: {
        title,
        slug: uniqueSlug,
        description,
        make,
        model,
        year: parseInt(year),
        variant: variant || null,
        price: parseFloat(price),
        priceNegotiable: priceNegotiable || false,
        mileage: parseInt(mileage),
        fuelType,
        transmission,
        condition,
        bodyType: bodyType || null,
        color: color || null,
        engineSize: engineSize || null,
        drivetrain: drivetrain || null,
        doors: doors ? parseInt(doors) : null,
        seats: seats ? parseInt(seats) : null,
        vin: vin || null,
        regNumber: regNumber || null,
        province,
        city,
        features: features || [],
        status: "PENDING",
        userId,
        carSubscriptionId: subscription.id,
        images: images?.length > 0
          ? {
              create: images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
                url: img.url,
                isPrimary: img.isPrimary || index === 0,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });

    // Increment listings used
    await db.carSubscription.update({
      where: { id: subscription.id },
      data: { listingsUsed: { increment: 1 } },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Error creating car listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
