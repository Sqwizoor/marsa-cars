import Link from "next/link";
import UserMenu from "./user-menu/user-menu";
import Cart from "./cart";
import Search from "./search/search";
import { cookies } from "next/headers";
import { Country } from "@/lib/types";
import CountryLanguageCurrencySelector from "./country-lang-curr-selector";
import Logo from "@/components/shared/logo";
import { getAllOfferTags } from "@/queries/offer-tag";
import OfferTagsWrapper from "./offer-tags-wrapper";

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

  // Fetch offer tags
  const offerTags = await getAllOfferTags();

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-700/80 to-slate-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
      <div className="mx-auto h-full w-full max-w-7xl text-white">
        <div className="flex items-center gap-3 py-0.5 sm:py-1 pr-3 sm:pr-4 lg:pr-6">
          {/* Left: Logo + mobile actions */}
          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
            <Link href="/" className="inline-flex items-center">
              <div className="w-[100px] h-[77px] sm:w-[120px] sm:h-[90px] md:w-[140px] md:h-[108px]">
                <Logo width="100%" height="100%" />
              </div>
            </Link>
            {/* Mobile quick actions */}
            <div className="flex items-center gap-1 lg:hidden pr-3 sm:pr-4">
              <UserMenu />
              <Cart />
            </div>
          </div>

          {/* Middle: Search + Offer Tags */}
          <div className="hidden flex-1 items-center gap-3 lg:flex">
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm ring-1 ring-inset ring-white/10">
              <Search />
            </div>
            <div className="flex-shrink-0">
              <OfferTagsWrapper offerTags={offerTags} />
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
        <div className="pb-0.5 lg:hidden pr-3 sm:pr-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm ring-1 ring-inset ring-white/10">
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
}
