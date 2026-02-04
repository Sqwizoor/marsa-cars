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
    <div className="sticky top-0 z-[100] w-full bg-gradient-to-r from-slate-700/80 to-slate-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60 flex flex-col">

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
              <Link
                href="/cars/sell"
                className="flex items-center gap-1 px-3 py-1.5 mr-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition-all duration-200"
              >
                <Plus className="h-3 w-3" />
                <span>Free Post</span>
              </Link>
              <UserMenu />
              <Cart />
              <MobileMenu role={role} />
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
              href="/cars/sell"
              className="flex items-center gap-2 px-4 py-2 mr-4 rounded-full bg-pink-600 hover:bg-pink-700 transition-all duration-200 text-white font-bold text-sm shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Free Post</span>
            </Link>
            <Link
              href="/parts/sell"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-200 text-slate-900 font-bold text-sm shadow-sm hover:shadow-md"
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

        {/* Secondary row: Search on mobile */}
        <div className="pb-1 lg:hidden pr-3 sm:pr-4">
          <div className="rounded-xl w-[90%] mx-auto">
            <Search />
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <ScrollingNotice />
      </div>
    </div>
  );
}
