"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import OrderFilters from "./order-filters";
import PaginationControl from "@/components/ui/pagination-control";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";

async function fetchOrders({ status, page, search }: { status: string; page: number; search: string }) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  params.set("page", String(page));
  const res = await fetch(`/api/admin/orders?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export default function AdminOrdersPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial state from URL params
  const getInitialPage = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  };

  const getInitialStatus = () => {
    return searchParams.get("status") || "ALL";
  };

  const getInitialSearch = () => {
    return searchParams.get("search") || "";
  };

  const [filterState, setFilterState] = useState({
    page: getInitialPage(),
    status: getInitialStatus(),
    search: getInitialSearch(),
  });

  const [data, setData] = useState({ orders: [], total: 0 });
  const [isPending, startTransition] = useTransition();

  // Update URL when filter state changes
  const updateURL = useCallback((newState: { page: number; status: string; search: string }) => {
    const params = new URLSearchParams();
    if (newState.status && newState.status !== "ALL") {
      params.set("status", newState.status);
    }
    if (newState.search) {
      params.set("search", newState.search);
    }
    if (newState.page > 1) {
      params.set("page", String(newState.page));
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [pathname, router]);

  // Sync URL changes back to state (for browser back/forward navigation)
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    setFilterState({
      page: pageParam ? parseInt(pageParam, 10) : 1,
      status: statusParam || "ALL",
      search: searchParam || "",
    });
  }, [searchParams]);

  // Fetch data when filter state changes
  useEffect(() => {
    let ignore = false;
    startTransition(() => {
      fetchOrders(filterState).then((res) => {
        if (!ignore) setData(res);
      });
    });
    return () => { ignore = true; };
  }, [filterState]);

  const handleFilterChange = (updates: Partial<{ status: string; page: number; search: string }>) => {
    const newState = { ...filterState, ...updates, page: 1 }; // Reset to page 1 on filter change
    setFilterState(newState);
    updateURL(newState);
  };

  const handlePageChange = (page: number) => {
    const newState = { ...filterState, page };
    setFilterState(newState);
    updateURL(newState);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-[#FF1744]" />
            All Orders
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and view all customer orders across the platform
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Orders: <span className="font-bold text-lg">{data.total}</span>
        </div>
      </div>
      
      <OrderFilters
        status={filterState.status}
        search={filterState.search}
        onChange={handleFilterChange}
      />
      <DataTable
        columns={columns}
        data={data.orders}
        filterValue="user"
        searchPlaceholder="Search orders..."
        noHeader={true}
        hideSearch={true}
      />
      <PaginationControl
        total={data.total}
        page={filterState.page}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
