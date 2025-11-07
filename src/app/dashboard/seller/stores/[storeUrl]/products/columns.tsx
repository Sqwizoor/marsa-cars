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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span></span>
    },
  },
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-3 p-0">
          {/* Product name */}
          <h1 className="font-bold truncate pb-3 border-b capitalize">{row.original.name}</h1>
          {/* Product variants */}
          <div className="relative flex flex-wrap gap-2">
            {row.original.variants?.map((variant) => (
              <div key={variant.id} className="mb-4 border-b pb-3 last:border-b-0">
                {/* Variant Name */}
                <h2 className="capitalize text-sm font-medium mb-2">{variant.variantName}</h2>

                {/* Variant Details */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Colors */}
                  <div className="flex gap-1 items-center">
                    <span className="text-xs text-muted-foreground">Colors:</span>
                    {variant.colors?.map((color) => (
                      <span
                        key={color.name}
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: color.name }}
                      />
                    ))}
                  </div>

                  {/* Sizes */}
                  <div className="flex flex-wrap gap-1">
                    {variant.sizes?.map((size) => (
                      <span
                        key={size.size}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium border bg-white/10"
                      >
                        {size.size} ({size.quantity}) - ${size.price}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Images - side by side */}
                <div className="flex flex-wrap gap-2">
                  {variant.images?.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image?.url || "/placeholder.png"}
                        alt={`${variant.variantName} image ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-20 h-20 rounded-md object-cover shadow-sm"
                      />
                      <Link
                        href={`/dashboard/seller/stores/${row.original.store?.url}/products/${row.original.id}/variants/${variant.id}`}
                      >
                        <div className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FilePenLine className="text-white w-4 h-4" />
                        </div>
                      </Link>
                    </div>
                  ))}
                  {/* Fallback if no images */}
                  {(!variant.images || variant.images.length === 0) && (
                    <div className="relative group">
                      <Image
                        src="/placeholder.png"
                        alt={`${variant.variantName} placeholder`}
                        width={100}
                        height={100}
                        className="w-20 h-20 rounded-md object-cover shadow-sm"
                      />
                      <Link
                        href={`/dashboard/seller/stores/${row.original.store?.url}/products/${row.original.id}/variants/${variant.id}`}
                      >
                        <div className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FilePenLine className="text-white w-4 h-4" />
                        </div>
                      </Link>
                    </div>
                  )}
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

