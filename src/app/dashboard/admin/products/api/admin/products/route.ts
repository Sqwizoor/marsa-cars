import { NextResponse } from "next/server";
import { getAdminProducts } from "@/queries/product";
import { ProductApprovalStatus } from "@prisma/client";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const statusParam = searchParams.get("status");
  const status = statusParam && statusParam !== "ALL" && Object.values(ProductApprovalStatus).includes(statusParam)
    ? statusParam
    : undefined;
  const search = searchParams.get("search") || "";
  const { products, total } = await getAdminProducts(status, page, 10, search);
  return NextResponse.json({ products, total });
}
