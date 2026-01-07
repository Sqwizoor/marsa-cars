import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/siderbar/siderbar";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import DashboardTour from "@/components/dashboard/dashboard-tour";

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
  // Get the store
  const store = await db.store.findUnique({
    where: {
      url: storeUrl,
    },
  });

  if (!store) {
    redirect("/dashboard/seller");
  }

  // Get all stores
  const stores = await db.store.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="h-full w-full">
      <Sidebar stores={stores} />
      <Header />
      <div id="tour-content-area" className="md:pl-[300px] pt-[75px] h-full w-full bg-slate-50 dark:bg-slate-900/50">
        <div className="p-6 h-full">
          {children}
        </div>
      </div>
      <DashboardTour />
    </div>
  );
};

export default SellerStoreDashboardLayout;