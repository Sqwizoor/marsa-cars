"use client";
import { useCartStore } from "@/cart-store/useCartStore";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType, Country } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import CartHeader from "./car-header";
import CartProduct from "../cards/cart-product";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import EmptyCart from "./empty-cat";
import { updateCartWithLatest } from "@/queries/user";
import CountryNote from "../shared/country-note";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartContainer({
  userCountry,
}: {
  userCountry: Country;
}) {
  const cartItems = useFromStore(useCartStore, (state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);

  const [loading, setLoading] = useState<boolean>(true);

  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [totalShipping, setTotalShipping] = useState<number>(0);
  const lastSyncedSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setLoading(false);
      lastSyncedSnapshotRef.current = null;
      return;
    }

    const snapshot = JSON.stringify(cartItems);
    if (lastSyncedSnapshotRef.current === snapshot) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadAndSyncCart = async () => {
      try {
        const updatedCart = await updateCartWithLatest(cartItems);
        const updatedSnapshot = JSON.stringify(updatedCart);
        lastSyncedSnapshotRef.current = updatedSnapshot;

        if (snapshot !== updatedSnapshot) {
          setCart(updatedCart);
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
        lastSyncedSnapshotRef.current = snapshot;
      } finally {
        setLoading(false);
      }
    };

    void loadAndSyncCart();
  }, [cartItems, setCart]);

  return (
    <div>
      {cartItems && cartItems.length > 0 ? (
        <>
          {loading ? (
            <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)]">
              <div className="max-w-[1200px] mx-auto py-6 flex flex-col lg:flex-row px-2 gap-5">
                <div className="min-w-0 flex-1 order-1">
                  <div className="mb-3">
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="my-2">
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <div className="space-y-3 mt-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
                <div className="w-full lg:w-[380px] max-h-max order-2 lg:sticky lg:top-4">
                  <div className="p-4 bg-white space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)]">
              <div className="max-w-[1200px] mx-auto py-6 flex flex-col lg:flex-row px-2 gap-5">
                <div className="min-w-0 flex-1 order-1">
                  {/* Cart header */}
                  <CartHeader
                    cartItems={cartItems}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                  />
                  <div className="my-2">
                    <CountryNote country={userCountry.name} />
                  </div>
                  <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                    {/* Cart items */}
                    {cartItems.map((product) => (
                      <CartProduct
                        key={product.id || `${product.productId}-${product.variantId}-${product.sizeId}`}
                        product={product}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        setTotalShipping={setTotalShipping}
                        userCountry={userCountry}
                      />
                    ))}
                  </div>
                </div>
                {/* Cart side */}
                <div className="w-full lg:w-[380px] max-h-max order-2 lg:sticky lg:top-4">
                  {/* Cart summary */}
                  <CartSummary
                    cartItems={cartItems}
                    shippingFees={totalShipping}
                  />
                  <div className="mt-2 p-4 bg-white px-6">
                    <FastDelivery />
                  </div>
                  <div className="mt-2 p-4 bg-white px-6">
                    <SecurityPrivacyCard />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
