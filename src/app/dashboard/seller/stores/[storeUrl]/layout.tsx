import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/siderbar/siderbar";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import DashboardTour from "@/components/dashboard/dashboard-tour";
import SidebarWrapper from "@/components/dashboard/siderbar/sidebar-wrapper";
import { currentUser } from "@clerk/nextjs/server";

interface SellerStoreDashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    storeUrl: string;
  }>;
}

const SellerStoreDashboardLayout = async ({
  children,
  params,
}: SellerStoreDashboardLayoutProps) => {
  const { storeUrl } = await params;
  const normalizedStoreUrl = (() => {
    try {
      return decodeURIComponent(storeUrl).trim();
    } catch {
      return storeUrl.trim();
    }
  })();

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const isAdmin = user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

  // Get the store
  const store = await db.store.findFirst({
    where: {
      url: {
        equals: normalizedStoreUrl,
        mode: "insensitive",
      },
    },
  });

  if (!store) {
    redirect("/dashboard/seller");
  }

  // Get all stores
  const stores = await db.store.findMany({
    where: isAdmin
      ? undefined
      : {
          OR: [{ userId: user.id }, { members: { some: { id: user.id } } }],
        },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="h-full w-full">
      {/* Desktop Sidebar - hidden on mobile, fixed on desktop */}
      <div className="hidden md:block fixed left-0 top-0 w-[300px] h-full border-r bg-background z-30">
        <Sidebar stores={stores} />
      </div>

      {/* Mobile Sidebar - visible on mobile, hidden on desktop */}
      <div className="md:hidden">
        <SidebarWrapper>
          <Sidebar stores={stores} />
        </SidebarWrapper>
      </div>

      <Header />
      
      <div id="tour-content-area" className="w-full md:pl-[300px] pt-[75px] h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="p-2 sm:p-4 md:p-6 h-full">
          {children}
        </div>
      </div>
      <DashboardTour />
    </div>
  );
};

export default SellerStoreDashboardLayout;
