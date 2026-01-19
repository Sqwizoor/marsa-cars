"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationControlProps {
  total: number;
  page: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default PaginationControl;

function PaginationControl({
  total,
  page,
  pageSize = 10,
  onPageChange,
}: PaginationControlProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const handlePageClick = (pageNumber: number) => {
    if (onPageChange) onPageChange(pageNumber);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <button onClick={() => handlePageClick(1)} className="px-3 py-1 rounded hover:bg-gray-200">1</button>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <button
            onClick={() => handlePageClick(i)}
            className={
              "px-3 py-1 rounded " +
              (i === page ? "bg-pink-600 text-white" : "hover:bg-gray-200")
            }
            disabled={i === page}
          >
            {i}
          </button>
        </PaginationItem>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <button onClick={() => handlePageClick(totalPages)} className="px-3 py-1 rounded hover:bg-gray-200">{totalPages}</button>
        </PaginationItem>
      );
    }
    return pages;
  };

  return (
    <Pagination className="mt-8 justify-end">
      <PaginationContent>
        <PaginationItem>
          <button
            onClick={() => handlePageClick(Math.max(1, page - 1))}
            className={page <= 1 ? "pointer-events-none opacity-50 px-3 py-1" : "cursor-pointer px-3 py-1 hover:bg-gray-200"}
            disabled={page <= 1}
          >
            Prev
          </button>
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <button
            onClick={() => handlePageClick(Math.min(totalPages, page + 1))}
            className={page >= totalPages ? "pointer-events-none opacity-50 px-3 py-1" : "cursor-pointer px-3 py-1 hover:bg-gray-200"}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
