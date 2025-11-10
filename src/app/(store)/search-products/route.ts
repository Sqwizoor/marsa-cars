import client from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search");

  if (!q || typeof q !== "string") {
    return NextResponse.json(
      {
        message: "Invalid search query",
      },
      { status: 400 }
    );
  }

  try {
    const response = await client.search({
      index: "products",
      body: {
        query: {
          match_phrase_prefix: {
            name: q,
          },
        },
      },
    });
    const results = response.hits.hits.map((hit) => hit._source);
    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
