import { ShippingAddress } from "@prisma/client";
import { BobGoRate } from "@/lib/bobgo/types";
import { Dispatch, SetStateAction } from "react";
import PayFastButton from "@/components/store/checkout-page/payfast-button";
import FastDelivery from "./fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import { cn } from "@/lib/utils"; 
import { CartWithCartItemsType } from "@/lib/types";
import ApplyCouponForm from "../forms/apply-coupon";

interface Props {
  shippingAddress: ShippingAddress | null;
  cartData: CartWithCartItemsType;
  setCartData: Dispatch<SetStateAction<CartWithCartItemsType>>;
  shippingRates: BobGoRate[];
  selectedRate: BobGoRate | null;
  onSelectRate: (rate: BobGoRate) => void;
  loadingRates: boolean;
}

const PlaceOrderCard = ({
  shippingAddress,
  setCartData,
  cartData,
  shippingRates,
  selectedRate,
  onSelectRate,
  loadingRates
}: Props) => {
  const { id, coupon, subTotal, shippingFees, total } = cartData;

  let discountedAmount = 0;
  const applicableStoreItems = cartData.cartItems.filter(
    (item) => item.storeId === coupon?.storeId
  );

  const storeSubTotal = applicableStoreItems.reduce(
    (acc, item) => acc + item.price * item.quantity + item.shippingFee,
    0
  );

  if (coupon) {
    discountedAmount = (storeSubTotal * coupon.discount) / 100;
  }

  return (
    <div className="lg:sticky lg:top-4 w-full max-h-max space-y-2">
      <div className="relative py-4 px-4 sm:px-6 bg-white rounded-xl shadow-sm border border-slate-100">
         <h1 className="text-gray-900 text-lg sm:text-xl font-bold mb-2">Shipping Method</h1>
         {loadingRates && <p className="text-sm text-gray-500">Calculating BobGo courier rates...</p>}
         {!loadingRates && shippingRates.length === 0 && shippingAddress && (
             <p className="text-sm text-red-500">No shipping rates available for this address.</p>
         )}
         {!shippingAddress && <p className="text-sm text-gray-500">Select an address to calculate location-based shipping rates.</p>}
         
         <div className="space-y-2 mt-2">
             {shippingRates.map(rate => {
                 const isSelected = selectedRate?.service_level_id === rate.service_level_id;
                 const etaLabel =
                   rate.delivery_time_min === rate.delivery_time_max
                     ? `${rate.delivery_time_min} business day${rate.delivery_time_min === 1 ? "" : "s"}`
                     : `${rate.delivery_time_min}-${rate.delivery_time_max} business days`;
                 return (
                 <div 
                    key={rate.service_level_id} 
                    className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center gap-3 transition-colors ${isSelected ? 'border-blue-600 bg-blue-50/70' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => onSelectRate(rate)}
                 >
                     <div className="min-w-0">
                         <p className="font-medium text-sm truncate text-gray-900">{rate.courier_name}</p>
                         <p className="text-xs text-gray-500">{rate.service_level_name} ({etaLabel})</p>
                     </div>
                     <p className="font-bold text-sm shrink-0 whitespace-nowrap text-gray-900">R{rate.total_charge.toFixed(2)}</p>
                 </div>
                 );
             })}
         </div>
      </div>

      <div className="relative py-4 px-4 sm:px-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-gray-900 text-xl sm:text-2xl font-bold mb-4">Summary</h1>
        <Info title="Subtotal" text={`R${subTotal.toFixed(2)}`} />
        <Info
          title="Shipping Fees"
          text={
            selectedRate || shippingFees > 0
              ? `+R${shippingFees.toFixed(2)}`
              : "Calculated via BobGo"
          }
        />
        <Info title="Taxes" text="+R0.00" />
        {coupon && (
          <Info
            title={`Coupon (${coupon.code}) (-${coupon.discount}%)`}
            text={`-R${discountedAmount.toFixed(2)}`}
          />
        )}
        <Info title="Total" text={`R${total.toFixed(2)}`} isBold noBorder />
      </div>
      <div>
        {coupon ? (
          <div className="flex bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 min-h-[88px]">
            <div className="w-3 bg-[#66cdaa] shrink-0" />
            <div className="px-3 py-2.5 overflow-hidden w-full">
              <p className="text-lg sm:text-xl font-bold text-[#66cdaa] leading-7 truncate">
                Coupon applied !
              </p>
              <p className="text-sm leading-5 break-words text-zinc-500">
                ({coupon.code}) ({coupon.discount}%) discount
              </p>
              <p className="text-xs sm:text-sm leading-5 break-words text-zinc-400">
                Coupon applied only to items from {coupon.store.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <ApplyCouponForm cartId={id} setCartData={setCartData} />
          </div>
        )}
      </div>
      <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
        {!shippingAddress && (
          <p className="text-sm text-orange-500 text-center py-2 mb-2">Please select a shipping address first</p>
        )}
        {shippingAddress && loadingRates && (
          <p className="text-sm text-gray-500 text-center py-2 mb-2">Calculating delivery cost...</p>
        )}
        <PayFastButton 
          cartId={cartData.id} 
          shippingAddressId={shippingAddress?.id || ""}
          shippingFee={selectedRate?.total_charge}
          shippingService={selectedRate ? `${selectedRate.courier_name} - ${selectedRate.service_level_name}` : undefined}
          disabled={!shippingAddress || loadingRates || (shippingRates.length > 0 && !selectedRate)}
        />
      </div>
      <div className="p-4 bg-white px-4 sm:px-6 rounded-xl shadow-sm border border-slate-100">
        <FastDelivery />
      </div>
      <div className="p-4 bg-white px-4 sm:px-6 rounded-xl shadow-sm border border-slate-100">
        <SecurityPrivacyCard />
      </div>
    </div>
  );
};

export default PlaceOrderCard;

const Info = ({
  title,
  text,
  isBold,
  noBorder,
}: {
  title: string;
  text: string;
  isBold?: boolean;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={cn(
        "mt-2 font-medium flex items-center justify-between gap-2 text-[#222] text-sm pb-1 border-b",
        {
          "font-bold": isBold,
          "border-b-0": noBorder,
        }
      )}
    >
      <h2 className="truncate">
        {title}
      </h2>
      <h3 className="shrink-0 text-right">
        <div className="px-0.5 text-black">
          <span className="text-black text-base sm:text-lg inline-block whitespace-nowrap">
            {text}
          </span>
        </div>
      </h3>
    </div>
  );
};
