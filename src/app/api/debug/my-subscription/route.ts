import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ 
      userId,
      count: subscriptions.length,
      subscriptions 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
