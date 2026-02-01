import { CartProductType } from "@/lib/types";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveUserCart } from "@/queries/user";

interface Props {
  cartItems: CartProductType[];
  shippingFees: number;
}

const CartSummary: FC<Props> = ({ cartItems, shippingFees }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate subtotal from cartItems
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate total price including shipping fees
  const total = subtotal + shippingFees;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    try {
      setLoading(true);
      const res = await saveUserCart(cartItems);
      if (res) {
        // Use replace to prevent back button issues on mobile
        router.push("/checkout");
      } else {
        toast.error("Failed to save cart. Please try again.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to proceed to checkout"
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative py-4 px-4 sm:px-6 bg-white rounded-lg">
      <h1 className="text-gray-900 text-xl sm:text-2xl font-bold mb-4">Summary</h1>
      <div className="mt-4 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
          Subtotal
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right">
          <span className="px-0.5 text-black">
            <div className="text-black text-base sm:text-lg inline-block break-all">
              R{subtotal.toFixed(2)}
            </div>
          </span>
        </h3>
      </div>
      <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
          Shipping Fees
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right">
          <span className="px-0.5 text-black">
            <div className="text-black text-base sm:text-lg inline-block break-all">
              R{shippingFees.toFixed(2)}
            </div>
          </span>
        </h3>
      </div>
      <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
          Taxes
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right">
          <span className="px-0.5 text-black">
            <div className="text-black text-base sm:text-lg inline-block break-all">
              R0.00
            </div>
          </span>
        </h3>
      </div>
      <div className="mt-2 font-bold flex items-center text-[#222] text-sm">
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
          Total
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right">
          <span className="px-0.5 text-black">
            <div className="text-black text-base sm:text-lg inline-block break-all">
              R{total.toFixed(2)}
            </div>
          </span>
        </h3>
      </div>
      <div className="mt-4">
        <Button 
          onClick={() => handleCheckout()} 
          disabled={loading || cartItems.length === 0}
          className="w-full py-3 text-base font-semibold"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            <span>Proceed to Checkout ({cartItems.length})</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
