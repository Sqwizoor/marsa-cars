import React from "react";
import { getAllAdminOrders } from "@/queries/admin";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import { ShoppingCart } from "lucide-react";

export default async function AdminOrdersPage() {
  // Fetching orders data from the database
  const orders = await getAllAdminOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-[#FF1744]" />
            All Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all customer orders across the platform
          </p>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Orders: <span className="font-bold text-lg">{orders.length}</span>
        </div>


      </div>

      {/* Data Table */}
      <DataTable
        filterValue="user"
        data={orders}
        searchPlaceholder="Search by customer name or order ID..."
        columns={columns}
      />
    </div>
  );
}
