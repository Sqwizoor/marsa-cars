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
}

export default function PaginationControl({
  total,
  page,
  pageSize = 10,
}: PaginationControlProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(total / pageSize);

  // Don't show pagination if there's only 1 page
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
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
          <PaginationLink href={createPageUrl(1)}>1</PaginationLink>
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
          <PaginationLink 
            href={createPageUrl(i)} 
            isActive={i === page}
            className={i === page ? "bg-pink-600 hover:bg-pink-700 text-white hover:text-white" : ""}
          >
            {i}
          </PaginationLink>
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
          <PaginationLink href={createPageUrl(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Pagination className="mt-8 justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={createPageUrl(Math.max(1, page - 1))}
            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext 
            href={createPageUrl(Math.min(totalPages, page + 1))}
            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
