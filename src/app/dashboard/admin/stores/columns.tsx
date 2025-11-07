"use client"

import type React from "react"

// React, Next.js imports
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Custom components
import CustomModal from "@/components/dashboard/shared/custom-modal"

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
import { BadgeCheck, BadgeMinus, Expand, MoreHorizontal, Trash } from "lucide-react"

// Queries
import { deleteStore } from "@/queries/store"

// Tanstack React Table
import type { ColumnDef } from "@tanstack/react-table"

// Prisma models
import type { AdminStoreType, StoreStatus } from "@/lib/types"
import StoreStatusSelect from "@/components/dashboard/forms/store-status-select"
import StoreSummary from "@/components/dashboard/shared/store-summary"

export const columns: ColumnDef<AdminStoreType>[] = [
  {
    accessorKey: "cover",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="relative h-18 w-22 sm:h-28 sm:w-36 rounded-xl overflow-hidden">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20 z-10 rounded-md"></div>

          <Image
            src={row.original.cover || "/placeholder.svg"}
            alt=""
            width={150}
            height={100}
            className="w-full h-full rounded-md object-cover shadow-sm"
          />
          <div className="absolute bottom-2 left-2 z-20">
            <Image
              src={row.original.logo || "/placeholder.svg"}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span className="font-bold text-base sm:text-lg capitalize line-clamp-2">{row.original.name}</span>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <span className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 max-w-[200px] sm:max-w-[300px]">
          {row.original.description}
        </span>
      )
    },
  },

  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      return <span className="text-xs sm:text-sm">/{row.original.url}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StoreStatusSelect storeId={row.original.id} status={row.original.status as StoreStatus} />
    },
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground flex justify-center">
          {row.original.featured ? <BadgeCheck className="stroke-green-300" /> : <BadgeMinus />}
        </span>
      )
    },
  },
  {
    accessorKey: "open",
    header: "",
    cell: ({ row }) => {
      const { setOpen } = useModal()
      return (
        <div>
          <button
            className="font-sans flex justify-center gap-1 sm:gap-2 items-center mx-auto text-sm sm:text-base text-gray-50 bg-[#0A0D2D] backdrop-blur-md font-medium sm:font-semibold relative z-10 px-3 py-1.5 sm:px-4 sm:py-2 overflow-hidden border-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
            onClick={() => {
              setOpen(
                <CustomModal maxWidth="!max-w-3xl">
                  <StoreSummary store={row.original} />
                </CustomModal>,
              )
            }}
          >
            View
            <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white grid place-items-center">
              <Expand className="w-3 sm:w-5 stroke-black" />
            </span>
          </button>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions storeId={rowData.id} />
    },
  },
]

// Define props interface for CellActions component
interface CellActionsProps {
  storeId: string
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ storeId }) => {
  // Hooks
  const { setOpen, setClose } = useModal()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Return null if rowData or rowData.id don't exist
  if (!storeId) return null

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
              <Trash size={15} /> Delete store
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the store and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              setLoading(true)
              await deleteStore(storeId)
              toast({
                title: "Deleted store",
                description: "The store has been deleted.",
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

