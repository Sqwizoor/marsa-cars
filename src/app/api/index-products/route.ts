import client from "@/lib/elasticsearch";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "search";

  try {
    // If action is "create", try to create the index
    if (action === "create") {
      // First check if index already exists
      try {
        const exists = await client.indices.exists({ index: "products" });
        
        if (exists) {
          return NextResponse.json({ 
            success: true, 
            message: "Index 'products' already exists" 
          });
        }
        
        // Create the index if it doesn't exist
        await client.indices.create({ index: "products" });
        
        // Add a sample document
        await client.index({
          index: "products",
          id: "sample1",
          body: {
            name: "Sample Product",
            description: "This is a sample product"
          },
          refresh: true
        });
        
        return NextResponse.json({ 
          success: true, 
          message: "Successfully created 'products' index and added a sample document" 
        });
      } catch (createError: any) {
        return NextResponse.json({ 
          success: false, 
          message: "Failed to create index", 
          error: createError.message 
        }, { status: 500 });
      }
    }
    
    // For regular search requests
    // First check if the index exists
    const indexExists = await client.indices.exists({ index: "products" });
    
    if (!indexExists) {
      return NextResponse.json({ 
        success: false, 
        message: "Index 'products' doesn't exist. Add ?action=create to create it." 
      }, { status: 404 });
    }
    
    // If we reach here, the index exists, so proceed with search
    const response = await client.search({
      index: "products",
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      hits: response.hits.hits,
      total: response.hits.total
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Error processing request", 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}