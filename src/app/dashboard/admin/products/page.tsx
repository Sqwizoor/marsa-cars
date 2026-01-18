import React from "react";
import { getAdminProducts } from "@/queries/product";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import { ProductApprovalStatus } from "@prisma/client";
import ProductFilters from "./product-filters";
import PaginationControl from "@/components/ui/pagination-control";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  
  // Handle status parameter safely
  const statusParam = searchParams.status;
  const status = (typeof statusParam === 'string' && 
                  statusParam !== "ALL" && 
                  Object.values(ProductApprovalStatus).includes(statusParam as ProductApprovalStatus))
                  ? statusParam as ProductApprovalStatus 
                  : undefined;

  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const { products, total } = await getAdminProducts(status, page, 10, search);
  
  return (
    <div className="w-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Product Review</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and approve pending products from sellers.
          </p>
        </div>
      </div>
      
      <ProductFilters />

      <DataTable
        columns={columns}
        data={products}
        filterValue="name"
        searchPlaceholder="Search products..."
        noHeader={true}
        hideSearch={true}
      />

      <PaginationControl total={total} page={page} pageSize={10} />
    </div>
  );
}
