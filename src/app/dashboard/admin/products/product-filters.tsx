"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductApprovalStatus } from "@prisma/client";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function ProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Get values directly from URL (single source of truth)
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when filters change
    params.set("page", "1");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, pathname, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Debounce by using a small delay - but for simplicity, update immediately
    updateParams({ search: value || null });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === "ALL" ? null : value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative w-full sm:max-w-sm">
        <div className="absolute left-2.5 top-2.5 bg-pink-500 p-1.5 rounded-md shadow-sm">
            <Search className="h-3 w-3 text-white" />
        </div>
        <Input
          placeholder="Search products..."
          defaultValue={currentSearch}
          onChange={handleSearchChange}
          className="pl-12 h-12"
        />
      </div>
      
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px] h-12">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value={ProductApprovalStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={ProductApprovalStatus.APPROVED}>Approved</SelectItem>
          <SelectItem value={ProductApprovalStatus.REJECTED}>Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
