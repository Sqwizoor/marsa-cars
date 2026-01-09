import { ReactNode } from "react";
import ProfileSidebar from "@/components/store/layout/profile-sidebar/sidebar";
import ProfileSidebarWrapper from "@/components/store/layout/profile-sidebar/sidebar-wrapper";
import ProfileBreadcrumbs from "@/components/store/layout/profile-sidebar/breadcrumbs";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Mobile Sidebar - visible on mobile only */}
      <div className="md:hidden">
        <ProfileSidebarWrapper>
          <ProfileSidebar />
        </ProfileSidebarWrapper>
      </div>

      <div className="max-w-container mx-auto p-2 sm:p-4">
        <div className="hidden md:block">
          <ProfileBreadcrumbs />
        </div>
        
        <div className="md:flex gap-4">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-[296px] flex-shrink-0">
            <ProfileSidebar />
          </div>
          
          <div className="w-full mt-4 md:mt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
