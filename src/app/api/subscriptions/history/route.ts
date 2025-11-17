import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type StatusLiteral = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING" | "TRIALING";

// Fallback cast to avoid type issues if Prisma types aren't generated at dev time
const prisma: any = db;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "10");
    const statusParam = searchParams.get("status")?.toUpperCase() as StatusLiteral | undefined;

    // Sanitize pagination inputs
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitBase = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
    const limit = Math.min(limitBase, 100);
    const skip = (page - 1) * limit;

    // Optional status filter
    const validStatuses: StatusLiteral[] = [
      "ACTIVE",
      "EXPIRED",
      "CANCELLED",
      "PENDING",
      "TRIALING",
    ];
    if (statusParam && !validStatuses.includes(statusParam)) {
      return NextResponse.json(
      { error: "Invalid status filter" },
      { status: 400 }
      );
    }

    const where = {
      userId,
      ...(statusParam ? { status: statusParam } : {}),
    } as const;

    // Count total for pagination
  const total = await prisma.subscription.count({ where } );

    // Get paginated subscriptions for the user
    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const data = subscriptions.map((sub: any) => ({
      ...sub,
      remainingAds: sub.adLimit === -1 ? -1 : Math.max(0, sub.adLimit - sub.adsUsed),
      isExpired: sub.endDate ? new Date() > sub.endDate : false,
      payfast: {
        paymentId: sub.paymentId || null,
        paymentStatus: sub.paymentStatus || "PENDING",
      },
    }));

    // NOTE: For deeper PayFast connectivity (live re-validation of PENDING payments)
    // you can add a `sync=1` query param and for each PENDING subscription perform:
    // 1. Fetch the stored ITN raw post body (if you saved it) and POST back to validate URL.
    // 2. If VALID and payment_status COMPLETE, mark subscription ACTIVE.
    // This requires storing original ITN body. Current implementation relies on webhook updates only.

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription history" },
      { status: 500 }
    );
  }
}
