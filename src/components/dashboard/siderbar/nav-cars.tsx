"use client"

import { Command, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import { icons } from "@/constants/icons"
import type { DashboardSidebarMenuInterface } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarNavCars({
  menuLinks,
}: {
  menuLinks: DashboardSidebarMenuInterface[]
}) {
  const pathname = usePathname()
  return (
    <nav className="relative grow">
      <Command className="rounded-lg overflow-visible bg-transparent">
        <CommandInput placeholder="Search..." />
        <CommandList className="py-2 overflow-visible">
          <CommandGroup className="overflow-visible pt-0 relative">
            {menuLinks.map((link, index) => {
              let icon
              const iconSearch = icons.find((icon) => icon.value === link.icon)
              if (iconSearch) icon = <iconSearch.path />
              
              // Exact match for dashboard root, startsWith for sub-pages
              const isActive = link.link === "/dashboard/cars" 
                ? pathname === "/dashboard/cars"
                : pathname.startsWith(link.link)

              return (
                <div key={index} className="px-1 py-0.5">
                  <Link
                    href={link.link}
                    className={cn(
                      "flex items-center gap-2 h-12 px-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-pink-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </div>
              )
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </nav>
  )
}
