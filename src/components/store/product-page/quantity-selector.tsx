import { useCartStore } from "@/cart-store/useCartStore";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";

interface QuantitySelectorProps {
  productId: string;
  variantId: string;
  sizeId: string | null;
  quantity: number;
  stock: number;
  handleChange: (
    property: keyof CartProductType,
    value: CartProductType[keyof CartProductType]
  ) => void;
}

const QuantitySelector = ({
  handleChange,
  productId,
  quantity,
  sizeId,
  variantId,
  stock,
}: QuantitySelectorProps) => {
  const cart = useFromStore(useCartStore, (state) => state.cart);

  // useEffect hook to handle changes when sizeId updates
  useEffect(() => {
    if (!sizeId) return;
    handleChange("quantity", 1);
  }, [sizeId, handleChange]);

  const maxQty = useMemo(() => {
    if (!sizeId) return 0;
    const search_product = cart?.find(
      (p) =>
        p.productId === productId &&
        p.variantId === variantId &&
        p.sizeId === sizeId
    );
    if (!search_product) {
      return stock;
    }

    const remaining = search_product.stock - search_product.quantity;
    return Math.max(remaining, 0);
  }, [cart, productId, variantId, sizeId, stock]);

  // If no sizeId is provided, return null to prevent rendering the component
  if (!sizeId) return null;

  // Function to handle increasing the quantity of the product
  const handleIncrease = () => {
    if (quantity < maxQty) {
      handleChange("quantity", quantity + 1);
    }
  };

  // Function to handle decreasing the quantity of the product
  const handleDecrease = () => {
    if (quantity > 1) {
      handleChange("quantity", quantity - 1);
    }
  };

  return (
    <div className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-5">
        <div className="grow">
          <span className="block text-xs text-gray-500">Select quantity</span>
          <span className="block text-xs text-gray-500">
            {maxQty !== stock &&
              `(You already have ${
                stock - maxQty
              } pieces of this product in cart)`}
          </span>
          <input
            type="number"
            className="w-full p-0 bg-transparent border-0 focus:outline-0 text-gray-800"
            min={1}
            value={maxQty <= 0 ? 0 : quantity}
            max={maxQty}
            readOnly
          />
        </div>
        <div className="flex justify-end items-center gap-x-1.5">
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleDecrease}
            disabled={quantity === 1}
          >
            <Minus className="w-3" />
          </button>
          <button
            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleIncrease}
            disabled={quantity >= maxQty || maxQty <= 0}
          >
            <Plus className="w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelector;
