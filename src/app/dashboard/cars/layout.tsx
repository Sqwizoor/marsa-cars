import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/siderbar/siderbar";
import SidebarWrapper from "@/components/dashboard/siderbar/sidebar-wrapper";

import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

interface CarsDashboardLayoutProps {
  children: ReactNode;
}

export default async function CarsDashboardLayout({
  children,
}: CarsDashboardLayoutProps) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  return (
    <ClerkProvider>
      <>
        <div className="w-full h-full">
          {/* Desktop Sidebar */}
          <div className="hidden md:block fixed left-0 top-0 w-[300px] h-full border-r bg-background">
             <Sidebar isCarSeller />
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            <SidebarWrapper>
              <Sidebar isCarSeller />
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
