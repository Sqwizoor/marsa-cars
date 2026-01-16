import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership through car listing
    const inquiry = await db.carInquiry.findFirst({
      where: { id },
      include: { carListing: true },
    });

    if (!inquiry || inquiry.carListing.userId !== userId) {
      return NextResponse.json(
        { error: "Inquiry not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.carInquiry.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking inquiry as read:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
