"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileSidebar() {
  const pathname = usePathname();
  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="py-3 w-full md:w-[296px] min-h-72">
          <div className="font-bold text-main-primary flex h-9 items-center px-4">
            <div className="whitespace-nowrap overflow-ellipsis overflow-hidden">
              Account
            </div>
          </div>
          {/* Links */}
          {menu.map((item) => (
            <Link key={item.link} href={item.link}>
              <div
                className={cn(
                  "relative flex h-9 items-center text-sm px-4 cursor-pointer hover:bg-[#f5f5f5]",
                  {
                    "bg-[#f5f5f5] user-menu-item":
                      item.link &&
                      (pathname === item.link ||
                        (pathname.startsWith(item.link) &&
                          item.link !== "/profile")),
                  }
                )}
              >
                <span>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const menu = [
  {
    title: "Overview",
    link: "/profile",
  },
  {
    title: "Orders",
    link: "/profile/orders",
  },
  {
    title: "Payment",
    link: "/profile/payment",
  },
  {
    title: "Shipping address",
    link: "/profile/addresses",
  },
  {
    title: "Reviews",
    link: "/profile/reviews",
  },
  {
    title: "History",
    link: "/profile/history/1",
  },
  {
    title: "Wishlist",
    link: "/profile/wishlist/1",
  },
  {
    title: "Following",
    link: "/profile/following/1",
  },
];
