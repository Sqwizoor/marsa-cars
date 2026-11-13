"use client";

import { usePathname } from "next/navigation";
import Search from "./search/search";

/**
 * Renders the mobile header search row only on the homepage (`/`),
 * keeping non-homepage mobile pages compact with a single-row navbar.
 */
export default function MobileSearch() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="pb-2.5 pt-0.5 lg:hidden">
      <div className="w-full">
        <Search />
      </div>
    </div>
  );
}
