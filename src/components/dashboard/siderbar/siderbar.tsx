// React, Next.js

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Custom Ui Components
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import SidebarNavSeller from "./nav-seller";
import SidebarNavCars from "./nav-cars";

// Menu links
import {
  SellerDashboardSidebarOptions,
  adminDashboardSidebarOptions,
  CarsDashboardSidebarOptions,
} from "@/constants/data";

// Prisma models
import { Store } from "@prisma/client";
import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  isAdmin?: boolean;
  isCarSeller?: boolean;
  stores?: Store[];
}

const Sidebar = async ({ isAdmin, isCarSeller, stores }: SidebarProps) => {
  const user = await currentUser();
  return (
    <div id="tour-sidebar" className="w-full h-screen p-4 flex flex-col bg-background border-r overflow-y-auto">
      {/* <Logo width="100%" height="180px" /> */}
      <span className="mt-3" />
      {user && <UserInfo user={user} />}
      {!isAdmin && !isCarSeller && stores && <StoreSwitcher stores={stores} className="tour-store-switcher" />}
      {isAdmin ? (
        <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
      ) : isCarSeller ? (
        <SidebarNavCars menuLinks={CarsDashboardSidebarOptions} />
      ) : (
        <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />
      )}
    </div>
  );
};

export default Sidebar;