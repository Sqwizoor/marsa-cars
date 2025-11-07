import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/siderbar/siderbar";

import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
// Make sure this path is correct

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default async function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const user = await currentUser();

  if (!user || user.privateMetadata.role !== "ADMIN") redirect("/");

  return (
    <ClerkProvider>
      <>
        <div className="w-full h-full">
          {/* Sidebar */}

          <div className="fixed left-0 top-0 w-[300px] h-full">
            {/* Add your sidebar content here */}
            <Sidebar isAdmin />
          </div>
          {/* Main content */}
          <div className="ml-[300px]">
            <Header />
            <div className="w-full mt-[75px] p-4">{children}</div>
          </div>
        </div>
      </>
    </ClerkProvider>
  );
}
