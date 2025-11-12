"use client"

import type React from "react"

// React, Next.js imports
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Hooks and utilities
import { useToast } from "@/hooks/use-toast"
import { useModal } from "@/app/providers/modal-provider"

// Lucide icons
import { CopyPlus, FilePenLine, MoreHorizontal, Trash } from "lucide-react"

// Queries
import { deleteProduct } from "@/queries/product"

// Tanstack React Table
import type { ColumnDef } from "@tanstack/react-table"

// Types
import type { StoreProductType } from "@/lib/types"
import Link from "next/link"

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-2 py-2">
          {/* Product name */}
          <h1 className="font-bold text-sm pb-2 border-b capitalize">{row.original.name}</h1>
          {/* Product variants */}
          <div className="relative flex flex-col gap-1.5">
            {row.original.variants?.map((variant) => (
              <div key={variant.id} className="flex items-center gap-2 pb-1.5 border-b last:border-b-0">
                {/* Variant image thumbnail */}
                <div className="relative group flex-shrink-0">
                  <Image
                    src={variant.images?.[0]?.url || "/placeholder.png"}
                    alt={variant.variantName}
                    width={60}
                    height={60}
                    className="w-12 h-12 rounded object-cover shadow-sm"
                  />
                  <Link
                    href={`/dashboard/seller/stores/${row.original.store?.url}/products/${row.original.id}/variants/${variant.id}`}
                  >
                    <div className="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FilePenLine className="text-white w-3 h-3" />
                    </div>
                  </Link>
                </div>

                {/* Variant details */}
                <div className="flex-1 min-w-0">
                  <h2 className="capitalize text-xs font-medium mb-1 truncate">{variant.variantName}</h2>
                  <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                    {/* Colors */}
                    {variant.colors?.slice(0, 3).map((color) => (
                      <span
                        key={color.name}
                        className="w-3 h-3 rounded-full shadow-sm border border-gray-300"
                        style={{ backgroundColor: color.name }}
                        title={color.name}
                      />
                    ))}
                    {variant.colors && variant.colors.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{variant.colors.length - 3}</span>
                    )}
                    {/* Size count */}
                    <span className="px-1 py-0.5 rounded text-[9px] bg-muted">
                      {variant.sizes?.length || 0} sizes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original.category.name}</span>
    },
  },
  {
    accessorKey: "subCategory",
    header: "SubCategory",
    cell: ({ row }) => {
      return <span>{row.original.subCategory.name}</span>
    },
  },
  {
    accessorKey: "offerTag",
    header: "Offer",
    cell: ({ row }) => {
      const offerTag = row.original.offerTag
      return <span>{offerTag ? offerTag.name : "-"}</span>
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      return <span>{row.original.brand}</span>
    },
  },

  {
    accessorKey: "new-variant",
    header: "",
    cell: ({ row }) => {
      return (
        <Link href={`/dashboard/seller/stores/${row.original.store?.url}/products/${row.original.id}/variants/new`}>
          <CopyPlus className="hover:text-blue-200" />
        </Link>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions productId={rowData.id} />
    },
  },
]

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ productId }) => {
  // Hooks
  const { setClose } = useModal()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Return null if rowData or rowData.id don't exist
  if (!productId) return null

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
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the product and variants that exist inside
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              setLoading(true)
              await deleteProduct(productId)
              toast({
                title: "Deleted product",
                description: "The product has been deleted.",
              })
              setLoading(false)
              router.refresh()
              setClose()
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

