import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/siderbar/siderbar";
import SidebarWrapper from "@/components/dashboard/siderbar/sidebar-wrapper";

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
          {/* Desktop Sidebar - hidden on mobile, fixed on desktop */}
          <div className="hidden md:block fixed left-0 top-0 w-[300px] h-full border-r bg-background">
             <Sidebar isAdmin />
          </div>

          {/* Mobile Sidebar - visible on mobile, hidden on desktop */}
          <div className="md:hidden">
            <SidebarWrapper>
              <Sidebar isAdmin />
            </SidebarWrapper>
          </div>
          
          {/* Main content */}
          <div className="w-full md:pl-[300px] min-h-screen">
            <Header />
            <div className="w-full mt-[75px] p-2 sm:p-4 md:p-6">{children}</div>
          </div>
        </div>
      </>
    </ClerkProvider>
  );
}
