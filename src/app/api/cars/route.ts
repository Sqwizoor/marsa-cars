import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const yearMin = searchParams.get("yearMin");
    const yearMax = searchParams.get("yearMax");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const mileageMax = searchParams.get("mileageMax");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const condition = searchParams.get("condition");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const bodyType = searchParams.get("bodyType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    if (make) where.make = make;
    if (model) where.model = { contains: model, mode: "insensitive" };
    if (yearMin || yearMax) {
      where.year = {};
      if (yearMin) where.year.gte = parseInt(yearMin);
      if (yearMax) where.year.lte = parseInt(yearMax);
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }
    if (mileageMax) where.mileage = { lte: parseInt(mileageMax) };
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (condition) where.condition = condition;
    if (province) where.province = province;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (bodyType) where.bodyType = bodyType;

    // Build order by
    let orderBy: any = [{ isSponsored: "desc" }, { createdAt: "desc" }];
    
    switch (sortBy) {
      case "price-low":
        orderBy = [{ isSponsored: "desc" }, { price: "asc" }];
        break;
      case "price-high":
        orderBy = [{ isSponsored: "desc" }, { price: "desc" }];
        break;
      case "year-new":
        orderBy = [{ isSponsored: "desc" }, { year: "desc" }];
        break;
      case "year-old":
        orderBy = [{ isSponsored: "desc" }, { year: "asc" }];
        break;
      case "mileage-low":
        orderBy = [{ isSponsored: "desc" }, { mileage: "asc" }];
        break;
      case "views":
        orderBy = [{ isSponsored: "desc" }, { views: "desc" }];
        break;
      default:
        orderBy = [{ isSponsored: "desc" }, { createdAt: "desc" }];
    }

    const [listings, total] = await Promise.all([
      db.carListing.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          user: { select: { name: true, picture: true } },
          carSubscription: {
            select: { tier: true, sellerType: true, dealerName: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.carListing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching car listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch car listings" },
      { status: 500 }
    );
  }
}
