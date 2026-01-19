"use client";

import React, { useEffect, useState, useTransition } from "react";
import { ProductApprovalStatus } from "@prisma/client";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import ProductFilters from "./product-filters";
import PaginationControl from "@/components/ui/pagination-control";

async function fetchProducts({ status, page, search }) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  params.set("page", page);
  const res = await fetch(`/api/admin/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function AdminProductsPageClient() {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    status: "ALL",
    search: "",
  });
  const [data, setData] = useState({ products: [], total: 0 });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;
    startTransition(() => {
      fetchProducts(searchParams).then((res) => {
        if (!ignore) setData(res);
      });
    });
    return () => { ignore = true; };
  }, [searchParams]);

  const handleFilterChange = (updates) => {
    setSearchParams((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Product Review</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and approve pending products from sellers.
          </p>
        </div>
      </div>
      <ProductFilters
        status={searchParams.status}
        search={searchParams.search}
        onChange={handleFilterChange}
      />
      <DataTable
        columns={columns}
        data={data.products}
        filterValue="name"
        searchPlaceholder="Search products..."
        noHeader={true}
        hideSearch={true}
      />
      <PaginationControl
        total={data.total}
        page={searchParams.page}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
