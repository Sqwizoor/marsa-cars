"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

interface CarListing {
  id: string;
  title: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  isSponsored: boolean;
  createdAt: Date;
  images: { url: string }[];
}

interface CarListingsTableProps {
  listings: CarListing[];
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    ACTIVE: { variant: "default", className: "bg-green-100 text-green-700" },
    PENDING: { variant: "secondary", className: "bg-yellow-100 text-yellow-700" },
    SOLD: { variant: "secondary", className: "bg-blue-100 text-blue-700" },
    EXPIRED: { variant: "secondary", className: "bg-gray-100 text-gray-700" },
    REJECTED: { variant: "destructive", className: "" },
    DRAFT: { variant: "outline", className: "" },
  };

  const config = variants[status] || variants.DRAFT;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};

export default function CarListingsTable({ listings }: CarListingsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/cars/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }

      toast.success("Listing deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete listing");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleSponsor = async (id: string) => {
    try {
      const response = await fetch(`/api/cars/${id}/sponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays: 7 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sponsor listing");
      }

      toast.success("Listing is now sponsored!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Inquiries</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {listing.images[0] ? (
                        <Image
                          src={listing.images[0].url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {listing.year} {listing.make} {listing.model}
                        {listing.isSponsored && (
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Listed {new Date(listing.createdAt).toLocaleDateString("en-ZA")}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{formatPrice(listing.price)}</span>
                </TableCell>
                <TableCell>{getStatusBadge(listing.status)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {listing.views}
                  </div>
                </TableCell>
                <TableCell className="text-center">{listing.inquiries}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cars/${listing.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Listing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/cars/${listing.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {!listing.isSponsored && listing.status === "ACTIVE" && (
                        <DropdownMenuItem onClick={() => handleSponsor(listing.id)}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Sponsor
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(listing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
