"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileSidebarWrapperProps {
  children: React.ReactNode;
}

export default function ProfileSidebarWrapper({ children }: ProfileSidebarWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-20 left-4 z-50 md:hidden bg-background shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <>
            <X className="h-4 w-4 mr-2" />
            Close
          </>
        ) : (
          <>
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </>
        )}
      </Button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-[280px] z-40 transform transition-transform duration-300 ease-in-out bg-background md:hidden overflow-y-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className="pt-20">
          {children}
        </div>
      </div>
    </>
  );
}
