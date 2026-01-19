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

export default function ProductFilters({ status, search, onChange }: {
  status: string;
  search: string;
  onChange: (updates: Record<string, string>) => void;
}) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ search: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    onChange({ status: value });
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
          onChange={handleSearchChange}
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
