import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await db.carListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Create inquiry
    const inquiry = await db.carInquiry.create({
      data: {
        carListingId: id,
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    // Increment inquiries count
    await db.carListing.update({
      where: { id },
      data: { inquiries: { increment: 1 } },
    });

    return NextResponse.json({ inquiry, success: true });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    );
  }
}
