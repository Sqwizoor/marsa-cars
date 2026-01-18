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
import { useEffect, useRef, useState } from "react";

export default function ProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");

  const initialRender = useRef(true);

  // Debounce search
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page when filter changes
    params.set("page", "1");

    if (value && value !== "ALL") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const handleSearch = (term: string) => {
    // Only update if the search term is different from current URL param
    const currentSearch = searchParams.get("search") || "";
    if (term === currentSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset page
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`); // Use replace instead of push for search typing
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    router.push(`${pathname}?${createQueryString("status", value)}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative w-full sm:max-w-sm">
        <div className="absolute left-2.5 top-2.5 bg-pink-500 p-1.5 rounded-md shadow-sm">
            <Search className="h-3 w-3 text-white" />
        </div>
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12"
        />
      </div>
      
      <Select value={status} onValueChange={handleStatusChange}>
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
