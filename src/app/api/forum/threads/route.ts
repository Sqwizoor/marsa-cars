import { NextRequest, NextResponse } from "next/server";
import { createThread, getThreads } from "@/queries/forum";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId") || undefined;
    const subforumId = searchParams.get("subforumId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = (searchParams.get("sortBy") as any) || "lastPostAt";
    const order = (searchParams.get("order") as any) || "desc";
    const searchQuery = searchParams.get("search") || undefined;
    const tags = searchParams.get("tags")?.split(",") || undefined;

    const result = await getThreads({
      categoryId,
      subforumId,
      page,
      limit,
      sortBy,
      order,
      searchQuery,
      tags,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/forum/threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, categoryId, subforumId, tags } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createThread({
      title,
      content,
      categoryId,
      subforumId,
      tags,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.thread, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/forum/threads:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
