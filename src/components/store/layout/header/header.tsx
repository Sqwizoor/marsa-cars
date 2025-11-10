import Link from "next/link";
import UserMenu from "./user-menu/user-menu";
import Cart from "./cart";
import Search from "./search/search";
import { cookies } from "next/headers";
import { Country } from "@/lib/types";
import CountryLanguageCurrencySelector from "./country-lang-curr-selector";

export default async function Header() {
  // Get cookies from the store
  const cookieStore = cookies();
  const userCountryCookie = (await cookieStore).get("userCountry");

  // Set default country if cookie is missing
  let userCountry: Country = {
    name: "United States",
    city: "",
    code: "US",
    region: "",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-700/80 to-slate-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
      <div className="mx-auto h-full w-full max-w-7xl px-3 sm:px-4 lg:px-6 text-white">
        <div className="flex items-center gap-3 py-2 sm:py-3">
          {/* Left: Logo + mobile actions */}
          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold tracking-wider ring-1 ring-white/15">SA</span>
              <h1 className="font-semibold text-lg sm:text-xl tracking-tight">JaumasCars</h1>
            </Link>
            {/* Mobile quick actions */}
            <div className="flex items-center gap-1 lg:hidden">
              <UserMenu />
              <Cart />
            </div>
          </div>

          {/* Middle: Search */}
          <div className="hidden flex-1 items-center lg:flex">
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm ring-1 ring-inset ring-white/10">
              <Search />
            </div>
          </div>

          {/* Right: Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* <DownloadApp /> */}
            <CountryLanguageCurrencySelector userCountry={userCountry} />
            <UserMenu />
            <Cart />
          </div>
        </div>

        {/* Secondary row: Search on mobile */}
        <div className="pb-2 lg:hidden">
          <div className="rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm ring-1 ring-inset ring-white/10">
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
}
