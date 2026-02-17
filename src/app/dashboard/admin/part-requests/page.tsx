import { getPartRequests } from "@/queries/part-requests";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function AdminPartRequestsPage() {
  const requests = await getPartRequests();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Car Part Requests</h1>
      </div>
      
      <DataTable
        filterValue="partName"
        data={requests as any}
        searchPlaceholder="Search by part name..."
        columns={columns as any}
        hideSearch={false}
      />
    </div>
  );
}
