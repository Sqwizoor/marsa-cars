"use client";

// React, Next.js imports
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// UI components
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Hooks and utilities
import { useToast } from "@/hooks/use-toast";

// Lucide icons
import {
  MoreHorizontal,
  Trash,
  Store,
  Calendar,
  Percent,
  ShoppingCart,
  Users,
  ExternalLink,
} from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Queries
import { adminDeleteCoupon } from "@/queries/admin-coupon";

// Types
type CouponWithStore = {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  discount: number;
  store: {
    id: string;
    name: string;
    url: string;
  };
  _count: {
    orders: number;
    users: number;
  };
  createdAt: Date;
};

export const columns: ColumnDef<CouponWithStore>[] = [
  {
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono font-bold text-[#FF1744] border-[#FF1744]">
            {row.original.code}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "store",
    header: "Store",
    cell: ({ row }) => {
      return (
        <Link
          href={`/store/${row.original.store.url}`}
          target="_blank"
          className="flex items-center gap-2 hover:text-[#FF1744] transition-colors"
        >
          <Store className="h-4 w-4" />
          <span className="font-medium">{row.original.store.name}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
          <Percent className="h-4 w-4" />
          {row.original.discount}%
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          {new Date(row.original.startDate).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = new Date(row.original.endDate);
      const isExpired = endDate < new Date();
      return (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={isExpired ? "text-red-500" : ""}>
            {endDate.toLocaleDateString()}
          </span>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "usage",
    header: "Usage",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <span>{row.original._count.orders} orders</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{row.original._count.users} users</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;
      return <CellActions rowData={rowData} />;
    },
  },
];

// Define props interface for CellActions component
interface CellActionsProps {
  rowData: CouponWithStore;
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (!rowData || !rowData.id) return null;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(rowData.code)}
          >
            Copy coupon code
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/store/${rowData.store.url}`} target="_blank">
              View store
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-600">
              <Trash size={15} /> Delete coupon
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            coupon <span className="font-bold">{rowData.code}</span> from{" "}
            <span className="font-bold">{rowData.store.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              setLoading(true);
              try {
                await adminDeleteCoupon(rowData.id);
                toast({
                  title: "Deleted coupon",
                  description: `The coupon ${rowData.code} has been deleted.`,
                });
                router.refresh();
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to delete coupon.",
                  variant: "destructive",
                });
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
