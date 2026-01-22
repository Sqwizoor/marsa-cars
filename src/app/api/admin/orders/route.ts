import { NextResponse } from "next/server";
import { getAdminOrders } from "@/queries/admin";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const statusParam = searchParams.get("status");
    const status = statusParam && statusParam !== "ALL" ? statusParam : undefined;
    const search = searchParams.get("search") || "";
    
    const { orders, total } = await getAdminOrders(status, page, 10, search);
    return NextResponse.json({ orders, total });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
