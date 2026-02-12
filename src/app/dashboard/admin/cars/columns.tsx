"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CarListingStatus, CarSubscriptionTier, CarSellerType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Check, X, Eye, Trash, Ban, Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { updateCarListingStatus, deleteCarListing } from "@/queries/cars";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

// Define the shape of the data for the table
export type AdminCarListingType = {
  id: string;
  title: string;
  slug: string;
  status: CarListingStatus;
  price: number;
  year: number;
  make: string;
  model: string;
  images: { url: string }[];
  user: {
    name: string;
    email: string;
    picture: string;
  };
  carSubscription: {
    tier: CarSubscriptionTier;
    sellerType: CarSellerType;
    dealerName?: string | null;
  };
  createdAt: Date;
};

const CarListingActions = ({ listing }: { listing: AdminCarListingType }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: CarListingStatus) => {
    try {
      const res = await updateCarListingStatus(listing.id, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Listing ${newStatus.toLowerCase()} successfully`);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await deleteCarListing(listing.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Listing deleted successfully");
        router.refresh();
        setOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the listing for "{listing.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/cars/${listing.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View Listing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {listing.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={() => handleStatusUpdate("ACTIVE")}>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate("REJECTED")}>
                <X className="mr-2 h-4 w-4 text-red-600" />
                Reject
              </DropdownMenuItem>
            </>
          )}

          {listing.status === "ACTIVE" && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("REJECTED")}>
              <Ban className="mr-2 h-4 w-4 text-orange-600" />
              Suspend/Reject
            </DropdownMenuItem>
          )}

          {(listing.status === "REJECTED" || listing.status === "DRAFT") && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("ACTIVE")}>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Approve / Activate
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<AdminCarListingType>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl =
        row.original.images[0]?.url ||
        "/assets/images/placeholder-car.jpg";

      return (
        <div className="relative w-16 h-16 rounded-md overflow-hidden border">
          <Image
            src={imageUrl}
            alt={row.original.title}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Listing",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]" title={row.original.title}>
            {row.original.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.year} {row.original.make} {row.original.model}
          </span>
          <span className="text-xs font-semibold">
            R {row.original.price.toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "seller",
    header: () => <span className="hidden md:inline">Seller</span>,
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span className="font-medium">
          {row.original.carSubscription.dealerName || row.original.user.name}
        </span>
        <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
        <Badge variant="outline" className="w-fit mt-1 text-[10px]">
          {row.original.carSubscription.sellerType}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "destructive" | "outline" | "secondary" = "default";

      switch (status) {
        case "ACTIVE":
          variant = "default"; // Greenish usually handled by class or theme
          break;
        case "PENDING":
          variant = "secondary";
          break;
        case "SOLD":
          variant = "outline";
          break;
        case "REJECTED":
          variant = "destructive";
          break;
        case "EXPIRED":
          variant = "destructive";
          break;
        default:
          variant = "outline";
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CarListingActions listing={row.original} />,
  },
];
