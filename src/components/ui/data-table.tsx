"use client";

// Custom components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "../dashboard/shared/custom-modal";

// Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tanstack react table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Lucide icons
import { FilePlus2, Search } from "lucide-react";

// Modal provider hook

import Link from "next/link";
import { useModal } from "@/app/providers/modal-provider";

// Props interface for the table component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
  newTabLink?: string;
  searchPlaceholder: string;
  heading?: string;
  subheading?: string;
  noHeader?: true;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  modalChildren,
  actionButtonText,
  searchPlaceholder,
  heading,
  subheading,
  noHeader,
  newTabLink,
}: DataTableProps<TData, TValue>) {
  // Modal state
  const { setOpen } = useModal();

  // React table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleOpenModal = () => {
    if (modalChildren) {
      setOpen(
        <CustomModal
          heading={heading || "Modal"}
          subheading={subheading || ""}
        >
          {modalChildren}
        </CustomModal>
      );
    }
  };

  return (
    <>
      {/* Search input and action button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-pink-500 p-2.5 rounded-lg shadow-sm">
            <Search className="w-5 h-5 text-white" />
          </div>
          <Input
            id="tour-table-search"
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterValue)?.setFilterValue(event.target.value)
            }
            className="h-12 w-full"
          />
        </div>
        <div className="flex gap-x-2">
          {modalChildren && (
            <Button
              id="tour-table-modal-button"
              className="flex- gap-2"
              onClick={handleOpenModal}
            >
              {actionButtonText}
            </Button>
          )}
          {newTabLink && (
            <Link href={newTabLink}>
              <Button id="tour-table-new-tab-button" className="bg-primary hover:bg-primary/90">
                {!modalChildren && actionButtonText ? (
                  actionButtonText
                ) : (
                  <>
                    <FilePlus2 className="me-1" /> Create in new page
                  </>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div id="tour-data-table" className="border bg-background rounded-lg overflow-x-auto">
        <Table className="">
          {/* Table header */}
          {!noHeader && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}

          {/* Table body */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="max-w-[400px] break-words"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              // No results message
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}