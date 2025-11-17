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
    const { title, description, image, url, targetCategory, targetSubCategory } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Check for active or trialing subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "You need an active subscription to create ads" },
        { status: 403 }
      );
    }

    const expiresAt =
      subscription.status === "TRIALING"
        ? subscription.trialEndsAt
        : subscription.endDate;

    // Check if subscription has expired
    if (expiresAt && new Date() > expiresAt) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { error: "Your subscription period has ended" },
        { status: 403 }
      );
    }

    // Check ad limit (unless unlimited)
    if (
      subscription.adLimit !== -1 &&
      subscription.adsUsed >= subscription.adLimit
    ) {
      return NextResponse.json(
        {
          error: "You have reached your ad limit. Upgrade your plan to create more ads.",
        },
        { status: 403 }
      );
    }

    // Create advertisement
    const ad = await db.advertisement.create({
      data: {
        userId: userId,
        title,
        description,
        image: image || null,
        url: url || null,
        targetCategory: targetCategory || null,
        targetSubCategory: targetSubCategory || null,
        isActive: true,
      },
    });

    // Increment ads used in subscription
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        adsUsed: subscription.adsUsed + 1,
      },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    );
  }
}
