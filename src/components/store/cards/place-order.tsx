import { ShippingAddress } from "@prisma/client";
import { BobGoRate } from "@/lib/bobgo/types";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import PayFastButton from "@/components/store/checkout-page/payfast-button";
import FastDelivery from "./fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import toast from "react-hot-toast";
import { emptyUserCart, placeOrder } from "@/queries/user";
import { useCartStore } from "@/cart-store/useCartStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { CartWithCartItemsType } from "@/lib/types";
import ApplyCouponForm from "../forms/apply-coupon";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState<boolean>(false);
  const { id, coupon, subTotal, shippingFees, total } = cartData;
  const { push } = useRouter();
  const emptyCart = useCartStore((state) => state.emptyCart);
  const handlePlaceOrder = async () => {
    setLoading(true);
    if (!shippingAddress) {
      toast.error("Select a shipping address first !");
    } else {
      const order = await placeOrder(
        shippingAddress, 
        id, 
        selectedRate?.total_charge, 
        selectedRate ? `${selectedRate.courier_name} - ${selectedRate.service_level_name}` : undefined
      );
      if (order) {
        // Do not empty cart here for PayFast; keep existing flow for manual place order
        emptyCart();
        await emptyUserCart();
        push(`/order/${order.orderId}`);
      }
    }
    setLoading(false);
  };

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
    <div className="sticky top-4 mt-3 ml-5 w-[380px] max-h-max">
      <div className="relative py-4 px-6 bg-white mb-2">
         <h1 className="text-gray-900 text-xl font-bold mb-2">Shipping Method</h1>
         {loadingRates && <p className="text-sm text-gray-500">Loading rates...</p>}
         {!loadingRates && shippingRates.length === 0 && shippingAddress && (
             <p className="text-sm text-red-500">No shipping rates available for this address.</p>
         )}
         {!shippingAddress && <p className="text-sm text-gray-500">Select an address to see shipping rates.</p>}
         
         <div className="space-y-2 mt-2">
             {shippingRates.map(rate => (
                 <div 
                    key={rate.service_level_id} 
                    className={`p-2 border rounded cursor-pointer flex justify-between items-center ${selectedRate?.service_level_id === rate.service_level_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => onSelectRate(rate)}
                 >
                     <div>
                         <p className="font-medium text-sm">{rate.courier_name}</p>
                         <p className="text-xs text-gray-500">{rate.service_level_name} ({rate.delivery_time_min}-{rate.delivery_time_max} days)</p>
                     </div>
                     <p className="font-bold text-sm">R{rate.total_charge}</p>
                 </div>
             ))}
         </div>
      </div>

      <div className="relative py-4 px-6 bg-white">
        <h1 className="text-gray-900 text-2xl font-bold mb-4">Summary</h1>
        <Info title="Subtotal" text={`${subTotal.toFixed(2)}`} />
        <Info title="Shipping Fees" text={`+${shippingFees.toFixed(2)}`} />
        <Info title="Taxes" text="+0.00" />
        {coupon && (
          <Info
            title={`Coupon (${coupon.code}) (-${coupon.discount}%)`}
            text={`-$${discountedAmount.toFixed(2)}`}
          />
        )}
        <Info title="Total" text={`+${total.toFixed(2)}`} isBold noBorder />
      </div>
      <div className="mt-2">
        {coupon ? (
          <div className="flex bg-white">
            <svg width={16} height={96} xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 8 0 
         Q 4 4.8, 8 9.6 
         T 8 19.2 
         Q 4 24, 8 28.8 
         T 8 38.4 
         Q 4 43.2, 8 48 
         T 8 57.6 
         Q 4 62.4, 8 67.2 
         T 8 76.8 
         Q 4 81.6, 8 86.4 
         T 8 96 
         L 0 96 
         L 0 0 
         Z"
                fill="#66cdaa"
                stroke="#66cdaa"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
            <div className="mx-2 5 overflow-hidden w-full">
              <p className="mt-1.5 text-xl font-bold text-[#66cdaa] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">
                Coupon applied !
              </p>
              <p className="overflow-hidden leading-5 break-all text-zinc-400 max-h-10">
                ({coupon.code}) ({coupon.discount}%) discount
              </p>
              <p className="overflow-hidden text-sm leading-5 break-words text-zinc-400">
                Coupon applied only to items from {coupon.store.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white">
            <ApplyCouponForm cartId={id} setCartData={setCartData} />
          </div>
        )}
      </div>
      <div className="mt-2 p-4 bg-white space-y-2">
        <Button onClick={() => handlePlaceOrder()} className="w-full">
          {loading ? (
            <Skeleton className="h-4 w-20 bg-white/40" />
          ) : (
            <span>Place order</span>
          )}
        </Button>
        {/* Alternative: PayFast gateway - creates order first, then redirects */}
        {/* Only show when address is selected */}
        {shippingAddress && (
          <PayFastButton 
            cartId={cartData.id} 
            shippingAddressId={shippingAddress.id}
            shippingFee={selectedRate?.total_charge}
            shippingService={selectedRate ? `${selectedRate.courier_name} - ${selectedRate.service_level_name}` : undefined}
          />
        )}
      </div>
      <div className="mt-2 p-4 bg-white px-6">
        <FastDelivery />
      </div>
      <div className="mt-2 p-4 bg-white px-6">
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
        "mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b",
        {
          "font-bold": isBold,
          "border-b-0": noBorder,
        }
      )}
    >
      <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
        {title}
      </h2>
      <h3 className="flex-1 w-0 min-w-0 text-right">
        <div className="px-0.5 text-black">
          <span className="text-black text-lg inline-block break-all">
            {text}
          </span>
        </div>
      </h3>
    </div>
  );
};
