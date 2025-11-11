"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks
import { useToast } from "@/hooks/use-toast";

// Icons
import { MoreHorizontal, Package, PackageX, Edit2 } from "lucide-react";

// Queries
import { updateProductStock } from "@/queries/product";

// Tanstack React Table
import type { ColumnDef } from "@tanstack/react-table";

// Types
export type InventoryItem = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  size: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
  category: string;
  subCategory: string;
};

// Stock Status Badge Component
const StockStatusBadge = ({ quantity }: { quantity: number }) => {
  if (quantity === 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <PackageX size={12} />
        Out of Stock
      </Badge>
    );
  }
  if (quantity < 10) {
    return (
      <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-200">
        <Package size={12} />
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-200">
      <Package size={12} />
      In Stock
    </Badge>
  );
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      return (
        <div className="relative w-16 h-16">
          <Image
            src={row.original.image || "/placeholder.png"}
            alt={row.original.productName}
            fill
            className="rounded-md object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.productName}</span>
          <span className="text-sm text-muted-foreground">{row.original.variantName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      return <span className="font-mono text-sm">{row.original.sku}</span>;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-medium">
          {row.original.size}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{row.original.category}</span>
          <span className="text-muted-foreground">{row.original.subCategory}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price;
      const discount = row.original.discount;
      const finalPrice = price - (price * discount) / 100;

      return (
        <div className="flex flex-col">
          <span className="font-semibold">${finalPrice.toFixed(2)}</span>
          {discount > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-xs line-through text-muted-foreground">${price.toFixed(2)}</span>
              <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                -{discount}%
              </Badge>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-lg">{row.original.quantity}</span>
          <StockStatusBadge quantity={row.original.quantity} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return <CellActions item={item} />;
    },
  },
];

// Cell Actions Component
interface CellActionsProps {
  item: InventoryItem;
}

const CellActions: React.FC<CellActionsProps> = ({ item }) => {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState(item.quantity);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdateStock = async () => {
    setLoading(true);
    try {
      await updateProductStock(item.id, newQuantity);
      
      toast({
        title: "Stock Updated",
        description: `Stock quantity updated to ${newQuantity}`,
      });
      
      router.refresh();
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update stock";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2">
              <Edit2 size={15} /> Update Stock
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Stock Quantity</AlertDialogTitle>
          <AlertDialogDescription>
            Update the stock quantity for {item.productName} - {item.variantName} ({item.size})
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Current Quantity: {item.quantity}</label>
            <Input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              placeholder="Enter new quantity"
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || newQuantity === item.quantity}
            onClick={handleUpdateStock}
          >
            {loading ? "Updating..." : "Update Stock"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
