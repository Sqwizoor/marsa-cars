import Themetoggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function Header() {
  return (
    <div className="fixed z-[20] md:left-[300px] top-0 right-0 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px] h-[75px] px-4">
      <div className="flex items-center gap-2 ml-auto">
        <UserButton afterSignOutUrl="/" />
        <Themetoggle/>
      </div>
    </div>
  );
}