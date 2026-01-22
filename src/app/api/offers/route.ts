import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const offers = await db.offerTag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        url: true,
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ offers: [] });
  }
}
