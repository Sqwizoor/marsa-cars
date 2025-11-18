// Queries
import { getAllCoupons } from "@/queries/admin-coupon";

// Data table
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function AdminCouponsPage() {
  // Fetching coupons data from the database
  const coupons = await getAllCoupons();

  // Checking if no coupons are found
  if (!coupons) return null;

  return (
    <DataTable
      filterValue="code"
      data={coupons}
      searchPlaceholder="Search coupon code..."
      columns={columns}
    />
  );
}
