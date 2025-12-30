"use client";

import { MessageIcon, OrderIcon, WishlistIcon } from "@/components/store/icons";
import { Button } from "@/components/store/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { ChevronDown, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch("/api/subscriptions/current", { 
          cache: "no-store"
        });
        const json = await res.json();
        setSubscription(json.subscription || null);
      } catch (e) {
        console.error("Failed to fetch subscription in dropdown", e);
        setSubscription(null);
      } finally {
        setSubLoading(false);
      }
    }
    
    fetchSub();
  }, []);

  if (!isLoaded) return null;
  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {user ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName!}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded-full"
          />
        ) : (
          <div className="flex h-11 items-center py-0 mx-2 cursor-pointer">
            <span className="text-2xl">
              <UserIcon />
            </span>
            <div className="ml-1">
              <b className="font-bold text-xs text-white leading-4">
                <span>Sign in</span>
                <span className="text-white scale-[60%] align-middle inline-block">
                  <ChevronDown />
                </span>
              </b>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div
        className={cn(
          "absolute top-0 -left-20 cursor-pointer",
          {
            "-left-[200px] lg:-left-[148px]": user,
            "hidden": !isOpen,
            "block": isOpen,
          }
        )}
      >
        <div className="relative left-2 mt-10 right-auto bottom-auto pt-2.5 text-[#222] p-0 text-sm z-40">
          {/* Triangle */}
          <div className="w-0 h-0 absolute left-[149px] top-1 right-24 !border-l-[10px] !border-l-transparent !border-r-[10px] !border-r-transparent !border-b-[10px] border-b-white"></div>
          {/* Menu */}
          <div className="rounded-3xl bg-white text-sm text-[#222] shadow-lg">
            <div className="w-[305px]">
              <div className="pt-5 px-6 pb-0">
                {user ? (
                  <div className="user-avatar flex flex-col items-center justify-center">
                    <UserButton />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link href="/sign-in">
                      <Button>Sign in</Button>
                    </Link>
                    <Link
                      href="/sign-up"
                      className="h-10 text-sm hover:underline text-main-primary flex items-center justify-center cursor-pointer"
                    >
                      Register
                    </Link>
                  </div>
                )}
                {user && (
                  <p className="my-3 text-center text-sm text-main-primary cursor-pointer">
                    <SignOutButton />
                  </p>
                )}
                {user && !subLoading && subscription && (
                  <>
                    <div className="my-2 flex items-center justify-center">
                      <Link
                        href="/dashboard/advertiser/manage"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/80 to-purple-600/80 px-3 py-1 text-xs font-semibold text-white shadow hover:from-indigo-500 hover:to-purple-600 transition"
                        title="View subscription details"
                      >
                        <span>{subscription.phase === "TRIAL" ? "Trial" : subscription.tier}</span>
                        <span className="rounded bg-white/20 px-2 py-0.5">
                          {subscription.remainingAds === -1 ? "∞" : `${subscription.remainingAds} left`}
                        </span>
                        {(subscription.phase === "TRIAL" || subscription.status === "TRIALING") && (subscription.expiresAt || subscription.trialEndsAt) && (
                            <span className="ml-1 border-l border-white/20 pl-2">
                                {Math.ceil((new Date(subscription.expiresAt || subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </span>
                        )}
                      </Link>
                    </div>
                  </>
                )}
                {user && !subLoading && !subscription && (
                  <div className="my-2 flex items-center justify-center">
                    <Link
                      href="/subscriptions"
                      className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 text-yellow-700 px-3 py-1 text-xs font-semibold hover:bg-yellow-500/30 transition"
                      title="No active ads plan"
                    >
                      <span>No Ads Plan</span>
                    </Link>
                  </div>
                )}
                <Separator />
              </div>
              {/* Links */}
              <div className="max-w-[calc(100vh-180px)] text-main-secondary overflow-y-auto overflow-x-hidden pt-0 px-2 pb-4">
                <ul className="grid grid-cols-3 gap-2 py-2.5 ^px-4 w-full">
                  {links.map((item) => (
                    <li key={item.title} className="grid place-items-center">
                      <Link href={item.link} className="space-y-2">
                        <div className="w-14 h-14 rounded-full p-2 grid place-items-center bg-gray-100 hover:bg-gray-200">
                          <span className="text-gray-500">{item.icon}</span>
                        </div>
                        <span className="block text-xs">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Separator className="!max-w-[257px] mx-auto" />
                <ul className="pt-2.5 pr-4 pb-1 pl-4 w-[288px]">
                  {extraLinks.map((item, i) => (
                    <li key={i}>
                      <Link 
                        href={item.link}
                        className="block text-sm text-main-primary py-1.5 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const links = [
  {
    icon: <OrderIcon />,
    title: "My Orders",
    link: "/profile/orders",
  },
  {
    icon: <MessageIcon />,
    title: "Messages",
    link: "/profile/messages",
  },
  {
    icon: <WishlistIcon />,
    title: "WishList",
    link: "/profile/wishlist",
  },
];
const extraLinks = [
  {
    title: "Profile",
    link: "/profile",
  },
  {
    title: "Settings",
    link: "/",
  },
  {
    title: "Become a Seller",
    link: "/subscriptions",
  },
  {
    title: "Help Center",
    link: "",
  },
  {
    title: "Return & Refund Policy",
    link: "/",
  },
  {
    title: "Legal & Privacy",
    link: "",
  },
  {
    title: "Discounts & Offers",
    link: "",
  },
  {
    title: "Order Dispute Resolution",
    link: "",
  },
  {
    title: "Report a Problem",
    link: "",
  },
];
