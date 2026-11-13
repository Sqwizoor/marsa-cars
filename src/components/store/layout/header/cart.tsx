"use client";
import Link from "next/link";
import { CartIcon } from "@/components/store/icons";
import { useCartStore } from "@/cart-store/useCartStore";
import useFromStore from "@/hooks/useFromStore";

export default function Cart() {
  // Get total items in the cart
  const totalItems = useFromStore(useCartStore, (state) => state.totalItems);
  
  return (
    <>
      {/* Compact mobile cart pill */}
      <Link
        href="/cart"
        aria-label="Cart"
        className="lg:hidden relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/15 hover:bg-white/20 text-white transition-colors"
      >
        <span className="text-[20px] leading-none">
          <CartIcon />
        </span>
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
          {totalItems ?? 0}
        </span>
      </Link>

      {/* Desktop cart */}
      <div className="hidden lg:flex relative h-11 items-center px-2 cursor-pointer">
        <Link href="/cart" className="flex items-center text-white">
          <span className="text-[32px] inline-block">
            <CartIcon />
          </span>
          <div className="ml-1">
            <div className="min-h-3 min-w-6 -mt-1.5">
              <span className="inline-block text-xs text-black leading-4 bg-white rounded-lg text-center font-bold min-h-3 px-1 min-w-6">
                {totalItems ?? 0}
              </span>
            </div>
            <b className="text-xs font-bold text-wrap leading-4">Cart</b>
          </div>
        </Link>
      </div>
    </>
  );
}
