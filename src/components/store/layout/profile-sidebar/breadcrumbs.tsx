"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileBreadcrumbs() {
  const pathname = usePathname();
  const path = pathname.split("/profile/")[1];
  const path_trim = path ? path.split("/")[0] : null;

  return (
    <div className="w-full p-4 text-xs text-[#999]">
      <span>
        <Link href="/">Home</Link>
        <span className="mx-2">&gt;</span>
      </span>
      <span>
        <Link href="/profile">Account</Link>
        {pathname !== "/profile" && <span className="mx-2">&gt;</span>}
      </span>
      {path && (
        <span>
          <Link href={pathname} className="capitalize">
            {path_trim || path}
          </Link>
        </span>
      )}
    </div>
  );
}
