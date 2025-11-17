import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { type } = await req.json();

    if (type === "view") {
      await db.advertisement.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } else if (type === "click") {
      await db.advertisement.update({
        where: { id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking ad:", error);
    return NextResponse.json(
      { error: "Failed to track ad" },
      { status: 500 }
    );
  }
}
