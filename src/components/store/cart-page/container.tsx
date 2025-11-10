"use client";
import { useCartStore } from "@/cart-store/useCartStore";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType, Country } from "@/lib/types";
import React, { useEffect, useState } from "react";
import CartHeader from "./car-header";
import CartProduct from "../cards/cart-product";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import EmptyCart from "./empty-cat";
import { updateCartWithLatest } from "@/queries/user";
import CountryNote from "../shared/country-note";

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

  useEffect(() => {
    const loadAndSyncCart = async () => {
      if (!cartItems?.length) {
        setLoading(false);
        return;
      }
      try {
        const updatedCart = await updateCartWithLatest(cartItems);
        setCart(updatedCart);
      } catch (error) {
        console.error("Failed to sync cart:", error);
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
            <div>loading...</div>
          ) : (
            <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)]">
              <div className="max-w-[1200px] mx-auto py-6 flex">
                <div className="min-w-0 flex-1">
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
                <div className="sticky top-4 ml-5 w-[380px] max-h-max">
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
