"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PartRequest } from "@prisma/client";
import { MoreHorizontal, Trash, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePartRequest, updatePartRequestStatus } from "@/queries/part-requests";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<PartRequest>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: "partName",
    header: "Part Name",
    cell: ({ row }) => <span className="font-medium">{row.original.partName}</span>,
  },
  {
    accessorKey: "vehicleDetails",
    header: "Vehicle",
    cell: ({ row }) => <span className="text-sm line-clamp-1">{row.original.vehicleDetails}</span>,
  },
  {
    accessorKey: "userName",
    header: "User",
  },
  {
    accessorKey: "contactInfo",
    header: "Contact",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "RESOLVED" ? "default" : "secondary"} className={status === "RESOLVED" ? "bg-green-500 hover:bg-green-600" : ""}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions rowData={row.original} />,
  },
];

const CellActions = ({ rowData }: { rowData: PartRequest }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await updatePartRequestStatus(rowData.id, newStatus);
      toast({ title: `Status updated to ${newStatus}` });
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => onUpdateStatus("RESOLVED")}
          >
            <CheckCircle size={15} className="text-green-600" /> Mark Resolved
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => onUpdateStatus("PENDING")}
          >
            <Clock size={15} className="text-blue-600" /> Move to Pending
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-600">
              <Trash size={15} /> Delete Request
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the request for "{rowData.partName}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              setLoading(true);
              try {
                await deletePartRequest(rowData.id);
                toast({ title: "Request deleted" });
                router.refresh();
              } catch (error) {
                toast({ variant: "destructive", title: "Failed to delete" });
              } finally {
                setLoading(false);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
