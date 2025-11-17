import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "3");

    // Build query
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.targetCategory = category;
    }

    // Get active ads
    const ads = await db.advertisement.findMany({
      where,
      take: limit,
      orderBy: [
        { views: "desc" }, // Prioritize ads with more views (popular)
        { createdAt: "desc" }, // Then by newest
      ],
      include: {
        user: {
          select: {
            name: true,
            subscriptions: {
              where: {
                status: {
                  in: ["ACTIVE", "TRIALING"],
                },
              },
              select: {
                tier: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}
