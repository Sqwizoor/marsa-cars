import React from "react";
import { getAdminProducts } from "@/queries/product";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import { ProductApprovalStatus } from "@prisma/client";

export default async function AdminProductsPage() {
  // Fetch pending products by default, or all if preferred.
  // Let's fetch PENDING products primarily.
  // Actually, seeing all might be better, we can filter in the table.
  // Getting all products for admin might be heavy, so let's start with PENDING.
  // If we want tabs, we can add them later.

  const products = await getAdminProducts(ProductApprovalStatus.PENDING);
  
  // Need to map to match AdminProductType strictly if needed, but Prisma type usually matches well enough 
  // except for JSON or weird fields.
  // Let's rely on Prisma return type.
  
  return (
    <div className="p-6">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Review</h1>
          <p className="text-muted-foreground">
            Review and approve pending products from sellers.
          </p>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={products as any} // Typing loose for now to speed up
        filterValue="name"
        searchPlaceholder="Search products..."
        noHeader={true}
      />
    </div>
  );
}
