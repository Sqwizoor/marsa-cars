import React from "react";
import { getAdminCarListings } from "@/queries/cars";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function AdminCarsPage() {
  const listings = await getAdminCarListings();
  
  return (
    <div className="w-full">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Car Listings Review</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage car listings from sellers.
          </p>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={listings}
        filterValue="title"
        searchPlaceholder="Search by title..."
        noHeader={true}
      />
    </div>
  );
}
