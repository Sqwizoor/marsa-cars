"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, ShoppingCart, MessageSquare, Home, List, Heart, Package, Store, Sparkles, Car, Plus } from "lucide-react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import Logo from "@/components/shared/logo";

export default function MobileMenu({ role }: { role?: string }) {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white lg:hidden hover:bg-white/10">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto z-[100]">
        <SheetHeader>
          <SheetTitle className="text-left">
             <div className="w-[100px] h-[77px]">
                <Logo width="100%" height="100%" />
              </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 mt-6">
            {/* User Section */}
            <div className="flex flex-col gap-2">
                {isLoaded && user ? (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <Image 
                            src={user.imageUrl} 
                            alt={user.fullName || "User"} 
                            width={40} 
                            height={40} 
                            className="rounded-full"
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-sm truncate">{user.fullName}</span>
                            <span className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" asChild onClick={() => setOpen(false)}>
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild onClick={() => setOpen(false)} className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Link href="/sign-up">Register</Link>
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Seller CTA */}
            <div className="px-2 py-2">
                {role === "SELLER" ? (
                    <Link
                        href="/dashboard/seller"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-md transition-all duration-300"
                    >
                        <Store className="w-5 h-5" />
                        <span className="font-bold tracking-wide">Switch to Seller Dashboard</span>
                    </Link>
                ) : role === "ADVERTISER" ? (
                    <Link
                        href="/dashboard/advertiser"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md transition-all duration-300"
                    >
                        <Store className="w-5 h-5" />
                        <span className="font-bold tracking-wide">Advertiser Dashboard</span>
                    </Link>
                ) : role === "ADMIN" ? (
                    <Link
                        href="/dashboard/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-md transition-all duration-300"
                    >
                        <Store className="w-5 h-5" />
                        <span className="font-bold tracking-wide">Admin Dashboard</span>
                    </Link>
                ) : (
                    <Link 
                        href="/subscriptions" 
                        onClick={() => setOpen(false)}
                        className="group relative flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <Store className="w-5 h-5 fill-white/20" />
                        <span className="font-bold tracking-wide">Become A Seller</span>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                    </Link>
                )}
            </div>

            {/* Main Navigation */}
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Menu</h3>
                <Link 
                    href="/" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <Home className="h-4 w-4" />
                    Home
                </Link>
                <Link 
                    href="/cars" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <Car className="h-4 w-4 text-blue-600" />
                    Buy & Sell Cars
                </Link>
                <Link 
                    href="/parts/sell" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <Plus className="h-4 w-4" />
                    + Car Parts
                </Link>
                 {/* <Link 
                    href="/categories" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <List className="h-4 w-4" />
                    Categories
                </Link> */}
            </div>

            <Separator />

            {/* User Links */}
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Account</h3>
                <Link 
                    href="/cart" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                </Link>
                <Link 
                    href="/profile/orders" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <Package className="h-4 w-4" />
                    My Orders
                </Link>
                 <Link 
                    href="/profile/wishlist" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <Heart className="h-4 w-4" />
                    Wishlist
                </Link>
                 <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setOpen(false)}
                >
                    <User className="h-4 w-4" />
                    Profile Settings
                </Link>
            </div>

            {isLoaded && user && (
                <>
                    <Separator />
                    <div className="px-2">
                        <SignOutButton>
                            <Button variant="destructive" className="w-full justify-start" size="sm">
                                Sign Out
                            </Button>
                        </SignOutButton>
                    </div>
                </>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
