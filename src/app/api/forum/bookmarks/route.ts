import { NextRequest, NextResponse } from "next/server";
import { toggleBookmark } from "@/queries/forum";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId, notes } = body;

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }

    const result = await toggleBookmark({ threadId, notes });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/forum/bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
