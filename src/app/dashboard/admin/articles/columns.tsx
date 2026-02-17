"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Article } from "@prisma/client";
import Image from "next/image";
import { BadgeCheck, BadgeMinus, Edit, MoreHorizontal, Trash } from "lucide-react";
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
import { useModal } from "@/app/providers/modal-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteArticle } from "@/queries/articles";
import CustomModal from "@/components/dashboard/shared/custom-modal";
import ArticleDetails from "@/components/dashboard/forms/article-details";

export const columns: ColumnDef<Article & { author: { name: string } }>[] = [
  {
    accessorKey: "coverImage",
    header: "Cover",
    cell: ({ row }) => (
      <div className="relative w-16 h-10 rounded overflow-hidden">
        <Image
          src={row.original.coverImage}
          alt={row.original.title}
          fill
          className="object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <span className="font-medium line-clamp-1">{row.original.title}</span>,
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => <span>{row.original.author.name}</span>,
  },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.published ? (
          <BadgeCheck className="text-green-500" />
        ) : (
          <BadgeMinus className="text-gray-400" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "views",
    header: "Views",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions rowData={row.original} />,
  },
];

const CellActions = ({ rowData }: { rowData: Article & { author: { name: string } } }) => {
  const { setOpen, setClose } = useModal();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
            onClick={() => {
              setOpen(
                <CustomModal>
                  <ArticleDetails data={rowData} />
                </CustomModal>
              );
            }}
          >
            <Edit size={15} /> Edit Article
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2 text-red-600">
              <Trash size={15} /> Delete Article
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the article "{rowData.title}". This action cannot be undone.
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
                await deleteArticle(rowData.id);
                toast({ title: "Article deleted" });
                router.refresh();
              } catch (error) {
                toast({ variant: "destructive", title: "Failed to delete" });
              } finally {
                setLoading(false);
                setClose();
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
