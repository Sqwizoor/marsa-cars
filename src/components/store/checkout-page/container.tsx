"use client";
import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types";
import { BobGoRate } from "@/lib/bobgo/types";
import { Country, ShippingAddress } from "@prisma/client";
import { FC, useEffect, useRef, useState } from "react";
import UserShippingAddresses from "../shared/shipping-addresses/shipping-addresses";
import CheckoutProductCard from "../cards/checkout-product";
import PlaceOrderCard from "../cards/place-order";
import { Country as CountryType } from "@/lib/types";
import CountryNote from "../shared/country-note";
import { updateCheckoutProductstWithLatest } from "@/queries/user";
import { trackCheckoutStarted } from "@/lib/posthog-tracking";

interface Props {
  cart: CartWithCartItemsType;
  countries: Country[];
  addresses: UserShippingAddressType[];
  userCountry: CountryType;
}

const CheckoutContainer: FC<Props> = ({
  cart,
  countries,
  addresses,
  userCountry,
}) => {
  const [cartData, setCartData] = useState<CartWithCartItemsType>(cart);

  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);

  const [shippingRates, setShippingRates] = useState<BobGoRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<BobGoRate | null>(null);
  const selectedRateRef = useRef<BobGoRate | null>(null);

  const activeCountry = addresses.find(
    (add) => add.countryId === selectedAddress?.countryId
  )?.country;

  const { cartItems } = cart;

  useEffect(() => {
    trackCheckoutStarted({
      total: cart.total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      contentIds: cartItems.map((item) => item.productId),
    });
  }, [cart.id]);

  const applyRateToCart = (
    prev: CartWithCartItemsType,
    rate: BobGoRate
  ): CartWithCartItemsType => {
    const discount = prev.coupon
      ? (prev.subTotal * prev.coupon.discount) / 100
      : 0;
    return {
      ...prev,
      shippingFees: rate.total_charge,
      total: Math.max(0, prev.subTotal + rate.total_charge - discount),
    };
  };

  useEffect(() => {
    let cancelled = false;

    const fetchRates = async () => {
      if (!selectedAddress || !cartItems.length) {
        setShippingRates([]);
        setSelectedRate(null);
        selectedRateRef.current = null;
        return;
      }

      setLoadingRates(true);
      setSelectedRate(null);
      selectedRateRef.current = null;

      try {
        // Construct rate request using cart quantities for parcel weight estimation
        const parcels = cartItems.map((item) => ({
          submitted_length_cm: 30,
          submitted_width_cm: 20,
          submitted_height_cm: 10,
          submitted_weight_kg: Math.max(1, item.quantity || 1),
        }));

        // Warehouse collection address (Johannesburg, ZA)
        const collection_address = {
          street_address: "123 Main St",
          local_area: "Sandton",
          city: "Johannesburg",
          zone: "Gauteng",
          country: "ZA",
          code: "2196",
        };

        const delivery_address = {
          street_address: selectedAddress.address1,
          local_area: selectedAddress.city,
          city: selectedAddress.city,
          zone: selectedAddress.state,
          country: activeCountry?.code || "ZA",
          code: selectedAddress.zip_code,
        };

        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collection_address,
            delivery_address,
            parcels,
          }),
        });

        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data.rates) && data.rates.length > 0) {
          const sortedRates: BobGoRate[] = [...data.rates].sort(
            (a, b) => a.total_charge - b.total_charge
          );
          setShippingRates(sortedRates);

          // Automatically apply the cheapest location-based BobGo rate
          const defaultRate = sortedRates[0];
          setSelectedRate(defaultRate);
          selectedRateRef.current = defaultRate;
          setCartData((prev) => applyRateToCart(prev, defaultRate));
        } else {
          setShippingRates([]);
        }
      } catch (error) {
        console.error("Failed to fetch shipping rates:", error);
        if (!cancelled) {
          setShippingRates([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRates(false);
        }
      }
    };

    fetchRates();

    return () => {
      cancelled = true;
    };
  }, [selectedAddress, cartItems, activeCountry?.code]);

  const handleRateSelect = (rate: BobGoRate) => {
    setSelectedRate(rate);
    selectedRateRef.current = rate;
    // Update local cart data with new shipping fee
    setCartData((prev) => applyRateToCart(prev, rate));
  };

  useEffect(() => {
    const hydrateCheckoutCart = async () => {
      if (!cartItems.length) return;
      try {
        const updatedCart = await updateCheckoutProductstWithLatest(
          cartItems,
          activeCountry
        );
        setCartData(
          selectedRateRef.current
            ? applyRateToCart(updatedCart, selectedRateRef.current)
            : updatedCart
        );
      } catch (error) {
        console.error("Failed to fetch latest checkout cart:", error);
      }
    };

    if (activeCountry) {
      void hydrateCheckoutCart();
    }
  }, [activeCountry, cartItems]);
  const effectiveCountryName =
    activeCountry?.name ||
    (selectedAddress?.countryId
      ? countries.find((c) => c.id === selectedAddress.countryId)?.name
      : undefined) ||
    (addresses.length > 0 && addresses[0]?.country?.name
      ? addresses[0].country.name
      : undefined) ||
    (userCountry?.name &&
    userCountry.name !== "United States" &&
    userCountry.name !== "United Kingdom"
      ? userCountry.name
      : "South Africa");

  return (
    <div className="flex flex-col lg:flex-row px-1 sm:px-3 lg:px-0 gap-4">
      <div className="flex-1 min-w-0 order-1">
        <UserShippingAddresses
          addresses={addresses}
          countries={countries}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />
        <div className="my-2">
          <CountryNote country={effectiveCountryName} />
        </div>
        <div className="w-full py-4 px-2 sm:px-4 bg-white my-3 rounded-xl shadow-sm border border-slate-100">
          <div className="relative">
            {cartData.cartItems.map((product) => (
              <CheckoutProductCard
                key={product.variantId}
                product={product}
                isDiscounted={cartData.coupon?.storeId === product.storeId}
                deliveryLabel={
                  loadingRates
                    ? "Calculating BobGo rates..."
                    : selectedRate
                    ? `BobGo · ${selectedRate.courier_name}`
                    : "Calculated via BobGo"
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div className="order-2 w-full lg:w-[380px] shrink-0">
        <PlaceOrderCard
          cartData={cartData}
          setCartData={setCartData}
          shippingAddress={selectedAddress}
          shippingRates={shippingRates}
          selectedRate={selectedRate}
          onSelectRate={handleRateSelect}
          loadingRates={loadingRates}
        />
      </div>
    </div>
  );
};

export default CheckoutContainer;
