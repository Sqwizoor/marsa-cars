"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
  MoreHorizontal,
  ExternalLink,
  Eye,
  MapPin,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";

export type AdminOrder = {
  id: string;
  total: number;
  paymentStatus: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: { emailAddress: string }[];
  };
  groups: {
    id: string;
    status: string;
    total: number;
    store: {
      id: string;
      name: string;
      url: string;
    };
    _count: {
      items: number;
    };
  }[];
  shippingAddress: {
    country: {
      name: string;
    };
  } | null;
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const columns: ColumnDef<AdminOrder>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-semibold">
        {row.original.id.slice(0, 8).toUpperCase()}...
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";
      const email = user.emailAddresses[0]?.emailAddress || "N/A";
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">{name}</span>
          </div>
          <span className="text-xs text-gray-500">{email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "groups",
    header: "Stores",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.groups.map((group) => (
          <Badge key={group.id} variant="outline" className="w-fit text-xs">
            {group.store.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-semibold">
        <DollarSign className="w-4 h-4 text-gray-500" />
        R{row.original.total.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`${getPaymentStatusColor(row.original.paymentStatus)} font-semibold`}
      >
        {row.original.paymentStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "shippingAddress",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-gray-500" />
        {row.original.shippingAddress?.country.name || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/orders/${row.original.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/profile/orders/${row.original.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              View Customer Order
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
