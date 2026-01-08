import { ReactNode } from "react";
import ProfileSidebar from "@/components/store/layout/profile-sidebar/sidebar";
import ProfileSidebarWrapper from "@/components/store/layout/profile-sidebar/sidebar-wrapper";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <ProfileSidebar />
      </div>

      {/* Mobile Sidebar - visible on mobile only */}
      <div className="md:hidden">
        <ProfileSidebarWrapper>
          <ProfileSidebar />
        </ProfileSidebarWrapper>
      </div>

      <div className="max-w-container mx-auto md:flex gap-4 p-2 sm:p-4">
        {/* Spacer for desktop sidebar */}
        <div className="hidden md:block w-[296px] flex-shrink-0" />
        
        <div className="w-full mt-12 md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
