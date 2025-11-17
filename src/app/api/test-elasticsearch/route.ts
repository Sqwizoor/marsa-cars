import client from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test connection
    const info = await client.info();
    
    // Check if products index exists
    const indexExists = await client.indices.exists({ index: "products" });
    
    return NextResponse.json({
      success: true,
      connected: true,
      clusterName: info.cluster_name,
      version: info.version.number,
      indexExists,
      message: indexExists 
        ? "Elasticsearch is connected and products index exists" 
        : "Elasticsearch is connected but products index does not exist. Visit /api/index-products?action=create to create it."
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      connected: false,
      error: errorMessage,
      hint: "Check your ELASTICSEARCH_CLOUD_ID and ELASTICSEARCH_API_KEY in .env file"
    }, { status: 500 });
  }
}
