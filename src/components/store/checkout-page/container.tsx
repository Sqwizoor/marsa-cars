"use client";
import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types";
import { BobGoRate } from "@/lib/bobgo/types";
import { Country, ShippingAddress } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import UserShippingAddresses from "../shared/shipping-addresses/shipping-addresses";
import CheckoutProductCard from "../cards/checkout-product";
import PlaceOrderCard from "../cards/place-order";
import { Country as CountryType } from "@/lib/types";
import CountryNote from "../shared/country-note";
import { updateCheckoutProductstWithLatest } from "@/queries/user";

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

  const activeCountry = addresses.find(
    (add) => add.countryId === selectedAddress?.countryId
  )?.country;

  const { cartItems } = cart;

  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedAddress || !cartItems.length) return;
      
      setLoadingRates(true);
      try {
        // Construct rate request
        // Using default dimensions as they are not on the ProductVariant model yet
        const parcels = cartItems.map(item => ({
          submitted_length_cm: 30, 
          submitted_width_cm: 20, 
          submitted_height_cm: 10, 
          submitted_weight_kg: 1, // Default to 1kg if weight logic is complex to retrieve on client without extra data
        }));

        // In a real app, we'd need the store's address as collection_address
        // For now, mocking collection address (e.g., main warehouse)
        const collection_address = {
            street_address: "123 Main St",
            local_area: "Sandton",
            city: "Johannesburg",
            zone: "Gauteng",
            country: "South Africa",
            code: "2196",
            lat: 0,
            lng: 0,
        };

        const delivery_address = {
            street_address: selectedAddress.address1,
            local_area: selectedAddress.city, // Approximation
            city: selectedAddress.city,
            zone: selectedAddress.state,
            country: "South Africa", // Assuming SA for BobGo
            code: selectedAddress.zip_code,
        };

        const res = await fetch('/api/shipping/rates', {
            method: 'POST',
            body: JSON.stringify({ collection_address, delivery_address, parcels }),
        });
        
        const data = await res.json();
        if (data.rates) {
            setShippingRates(data.rates);
        }
      } catch (error) {
        console.error("Failed to fetch shipping rates:", error);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, [selectedAddress, cartItems]);

  const handleRateSelect = (rate: BobGoRate) => {
    setSelectedRate(rate);
    // Update local cart data with new shipping fee
    setCartData(prev => ({
        ...prev,
        shippingFees: rate.total_charge,
        total: prev.subTotal + rate.total_charge - (prev.coupon ? (prev.subTotal * prev.coupon.discount / 100) : 0)
    }));
  };

  useEffect(() => {
    const hydrateCheckoutCart = async () => {
      if (!cartItems.length) return;
      try {
        const updatedCart = await updateCheckoutProductstWithLatest(
          cartItems,
          activeCountry
        );
        setCartData(updatedCart);
      } catch (error) {
        console.error("Failed to fetch latest checkout cart:", error);
      }
    };

    if (activeCountry) {
      void hydrateCheckoutCart();
    }
  }, [activeCountry, cartItems]);
  return (
    <div className="flex flex-col lg:flex-row px-3 lg:px-0 gap-4">
      <div className="flex-1 order-2 lg:order-1">
        <UserShippingAddresses
          addresses={addresses}
          countries={countries}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />
        <div className="my-2">
          <CountryNote
            country={activeCountry ? activeCountry.name : userCountry.name}
          />
        </div>
        <div className="w-full py-4 px-2 sm:px-4 bg-white my-3 rounded-lg">
          <div className="relative">
            {cartData.cartItems.map((product) => (
              <CheckoutProductCard
                key={product.variantId}
                product={product}
                isDiscounted={cartData.coupon?.storeId === product.storeId}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2 w-full lg:w-auto">
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
