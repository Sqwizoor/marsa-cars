"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductApprovalStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Check, X, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateProductStatus } from "@/queries/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the shape of the data for the table
export type AdminProductType = {
  id: string;
  name: string;
  slug: string;
  status: ProductApprovalStatus;
  images: { url: string }[];
  store: {
    id: string;
    name: string;
    url: string;
  };
  category: {
    name: string;
  };
  createdAt: Date;
  variants: {
    id: string;
    images: { url: string }[];
  }[];
};

export const columns: ColumnDef<AdminProductType>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      // Try to get image from variant or main product images (if any)
      // Logic in query was tricky, let's assume we fetch enough data
      // For now, let's fallback to placeholder if no image
      const product = row.original;
      const imageUrl =
        product.variants[0]?.images[0]?.url ||
        "/placeholder.png"; // Add placeholder image path if needed

      return (
        <div className="relative w-16 h-16 rounded-md overflow-hidden border">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]" title={row.original.name}>
            {row.original.name}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.category.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "store",
    header: () => <span className="hidden md:inline">Store</span>,
    cell: ({ row }) => (
      <Link
        href={`/store/${row.original.store.url}`}
        className="text-blue-600 hover:underline items-center gap-1 hidden md:flex"
        target="_blank"
      >
        {row.original.store.name}
        <ExternalLink className="w-3 h-3" />
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "APPROVED"
              ? "default" // or success if available
              : status === "REJECTED"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="hidden lg:inline">Created At</span>,
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground hidden lg:inline-block">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const product = row.original;
        const router = useRouter();

        const handleStatusUpdate = async (status: ProductApprovalStatus) => {
            try {
                await updateProductStatus(product.id, status);
                toast.success(`Product ${status.toLowerCase()}`, {
                    description: `Product has been marked as ${status}.`,
                });
                router.refresh();
            } catch (error) {
                toast.error("Failed to update product status", {
                    description: "An error occurred while updating the product.",
                });
            }
        };

      return (
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
                onClick={() => router.push(`/dashboard/seller/stores/${product.store.url}/products/${product.id}/variants/${product.variants[0]?.id}/?adminView=true`)}
                // Note: I'm redirecting to the seller edit page.
                // Admin has permission because I updated ProductDetails to check role.
            >
              <Eye className="mr-2 h-4 w-4" /> Review / Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusUpdate("APPROVED")}>
              <Check className="mr-2 h-4 w-4 text-green-600" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("REJECTED")}>
              <X className="mr-2 h-4 w-4 text-red-600" /> Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
