import { NextRequest, NextResponse } from "next/server";
import { searchForum } from "@/queries/forum";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const results = await searchForum(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/forum/search:", error);
    return NextResponse.json(
      { error: "Failed to search forum" },
      { status: 500 }
    );
  }
}
