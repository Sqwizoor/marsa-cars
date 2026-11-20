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
import { MessageSquare, Plus } from "lucide-react";
import MobileMenu from "./mobile-menu";
import MobileSearch from "./mobile-search";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import ScrollingNotice from "./scrolling-notice";

export default async function Header() {
  // Get cookies from the store
  const cookieStore = cookies();
  const userCountryCookie = (await cookieStore).get("userCountry");

  // Get current user and role
  const user = await currentUser();
  let role = user?.privateMetadata.role as string | undefined;

  if (user) {
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        stores: { take: 1 },
        ads: { take: 1 },
      },
    });

    if (dbUser) {
      role = dbUser.role;
      if (role === "USER") {
        if (user.privateMetadata.role === "ADMIN") {
          role = "ADMIN";
        } else if (dbUser.stores.length > 0) {
          role = "SELLER";
        } else if (dbUser.ads.length > 0) {
          role = "ADVERTISER";
        }
      }
    }
  }

  // Set default country if cookie is missing
  let userCountry: Country = {
    name: "South Africa",
    city: "",
    code: "ZA",
    region: "",
  };

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country;
  }

  // Fetch offer tags
  const rawOfferTags = await getAllOfferTags();
  // Filter out "super-deals" from the navbar
  const offerTags = rawOfferTags.filter(tag => tag.url !== "super-deals");

  return (
    <div className="sticky top-0 z-30 w-full bg-slate-900/95 lg:bg-gradient-to-r lg:from-slate-700/80 lg:to-slate-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/85 lg:supports-[backdrop-filter]:bg-slate-900/60 border-b border-white/10 lg:border-b-0 shadow-sm flex flex-col">

      <div className="h-full w-full text-white px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 py-2 lg:py-1">
          {/* Left: Mobile Menu + Logo + mobile right actions */}
          <div className="flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-start">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="lg:hidden">
                <MobileMenu role={role} />
              </div>
              <Link href="/" className="inline-flex items-center shrink-0">
                <div className="w-[74px] h-[50px] sm:w-[100px] sm:h-[68px] lg:w-[140px] lg:h-[108px]">
                  <Logo width="100%" height="100%" />
                </div>
              </Link>
            </div>
            {/* Mobile quick actions */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <UserMenu />
              <Cart />
            </div>
          </div>

          {/* Middle: Search + Offer Tags */}
          <div className="hidden flex-1 items-center gap-3 lg:flex justify-center">
            <div className="w-full max-w-sm xl:max-w-md rounded-xl">
              <Search />
            </div>
            <div className="flex-shrink-0">
              <OfferTagsWrapper offerTags={offerTags} />
            </div>
          </div>

          {/* Right: Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/articles"
              className="text-white font-bold text-sm hover:text-gray-200 transition-colors mr-4"
            >
              Articles
            </Link>
            {role === "ADMIN" && (
              <Link
                href="/dashboard/admin"
                className="text-white font-bold text-sm bg-blue-600/50 hover:bg-blue-600 px-3 py-1 rounded-full transition-all mr-4"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/cars/sell"
              className="flex items-center gap-2 px-4 py-2 mr-4 rounded-full bg-pink-600 hover:bg-pink-700 transition-all duration-200 text-white font-bold text-sm shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Free Post</span>
            </Link>
            <Link
              href="/parts/sell"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 transition-all duration-200 text-white font-bold text-sm shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>+ Car Parts</span>
            </Link>
            {/* <DownloadApp /> */}
            <CountryLanguageCurrencySelector userCountry={userCountry} />
            <UserMenu />
            <Cart />
          </div>
        </div>

        {/* Secondary row: Sleek search bar on mobile (homepage only) */}
        <MobileSearch />
      </div>
      <ScrollingNotice />
    </div>
  );
}
