import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.carListing.findUnique({
      where: { slug: id },
      include: {
        images: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, picture: true } },
        carSubscription: {
          select: { tier: true, sellerType: true, dealerName: true, dealerLogo: true, dealerPhone: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Increment view count (don't await to not slow response)
    db.carListing.update({
      where: { id: listing.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Error fetching car listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify ownership
    const existingListing = await db.carListing.findFirst({
      where: { id, userId },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

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
      province,
      city,
      features,
      images,
    } = body;

    // Update listing
    const listing = await db.carListing.update({
      where: { id },
      data: {
        title: title ?? existingListing.title,
        description: description ?? existingListing.description,
        make: make ?? existingListing.make,
        model: model ?? existingListing.model,
        year: year ? parseInt(year) : existingListing.year,
        variant: variant !== undefined ? variant : existingListing.variant,
        price: price ? parseFloat(price) : existingListing.price,
        priceNegotiable: priceNegotiable ?? existingListing.priceNegotiable,
        mileage: mileage ? parseInt(mileage) : existingListing.mileage,
        fuelType: fuelType ?? existingListing.fuelType,
        transmission: transmission ?? existingListing.transmission,
        condition: condition ?? existingListing.condition,
        bodyType: bodyType !== undefined ? bodyType : existingListing.bodyType,
        color: color !== undefined ? color : existingListing.color,
        engineSize: engineSize !== undefined ? engineSize : existingListing.engineSize,
        drivetrain: drivetrain !== undefined ? drivetrain : existingListing.drivetrain,
        doors: doors !== undefined ? (doors ? parseInt(doors) : null) : existingListing.doors,
        seats: seats !== undefined ? (seats ? parseInt(seats) : null) : existingListing.seats,
        province: province ?? existingListing.province,
        city: city ?? existingListing.city,
        features: features ?? existingListing.features,
        status: "PENDING", // Re-submit for approval on edit
      },
      include: {
        images: true,
      },
    });

    // Update images if provided
    if (images && images.length > 0) {
      await db.carImage.deleteMany({ where: { carListingId: id } });
      await db.carImage.createMany({
        data: images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
          carListingId: id,
          url: img.url,
          isPrimary: img.isPrimary || index === 0,
          order: index,
        })),
      });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Error updating car listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership and get subscription info
    const listing = await db.carListing.findFirst({
      where: { id, userId },
      include: { carSubscription: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete listing (images cascade)
    await db.carListing.delete({ where: { id } });

    // Decrement listings used
    if (listing.carSubscription) {
      await db.carSubscription.update({
        where: { id: listing.carSubscriptionId },
        data: {
          listingsUsed: Math.max(0, listing.carSubscription.listingsUsed - 1),
          sponsoredUsed: listing.isSponsored
            ? Math.max(0, listing.carSubscription.sponsoredUsed - 1)
            : listing.carSubscription.sponsoredUsed,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting car listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
