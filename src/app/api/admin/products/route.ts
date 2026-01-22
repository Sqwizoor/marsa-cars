import { NextResponse } from "next/server";
import { getAdminProducts } from "@/queries/product";
import { ProductApprovalStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const statusParam = searchParams.get("status");
  const status = statusParam && statusParam !== "ALL" && Object.values(ProductApprovalStatus).includes(statusParam as ProductApprovalStatus)
    ? statusParam as ProductApprovalStatus
    : undefined;
  const search = searchParams.get("search") || "";
  const { products, total } = await getAdminProducts(status, page, 10, search);
  return NextResponse.json({ products, total });
}
