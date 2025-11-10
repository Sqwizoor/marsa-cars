import { CartProductType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FC, useEffect } from "react";

interface SimplifiedSize {
  id: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
}
interface Props {
  sizeId?: string | undefined;
  sizes: SimplifiedSize[];
  isCard?: boolean;
  handleChange: (
    property: keyof CartProductType,
    value: CartProductType[keyof CartProductType]
  ) => void;
}

const ProductPrice: FC<Props> = ({ sizeId, sizes, isCard, handleChange }) => {
  const hasSizes = Array.isArray(sizes) && sizes.length > 0;
  const selectedSize = sizeId
    ? sizes.find((size) => size.id === sizeId)
    : undefined;
  const discountedPrice = selectedSize
    ? selectedSize.price * (1 - selectedSize.discount / 100)
    : null;

  useEffect(() => {
    if (!selectedSize || discountedPrice === null) return;
    handleChange("price", discountedPrice);
    handleChange("stock", selectedSize.quantity);
  }, [selectedSize, discountedPrice, handleChange]);

  if (!hasSizes) {
    return null;
  }

  // Scenario 1: No sizeId passed, calculate range of prices and total quantity
  if (!sizeId || !selectedSize) {
    // Calculate discounted prices for all sizes
    const discountedPrices = sizes.map(
      (size) => size.price * (1 - size.discount / 100)
    );

    const totalQuantity = sizes.reduce(
      (total, size) => total + size.quantity,
      0
    );

    const minPrice = Math.min(...discountedPrices).toFixed(2);
    const maxPrice = Math.max(...discountedPrices).toFixed(2);

    // If all prices are the same, return a single price; otherwise, return range
    const priceDisplay =
      minPrice === maxPrice ? `R${minPrice}` : `R${minPrice} - R${maxPrice}`;

    return (
      <div>
        <div className="text-orange-primary inline-block font-bold leading-none mr-2.5">
          <span
            className={cn("inline-block text-4xl text-nowrap", {
              "text-lg": isCard,
            })}
          >
            {priceDisplay}
          </span>
        </div>
        {!sizeId && !isCard && (
          <div className="text-orange-background text-xs leading-4 mt-1">
            <span>Note : Select a size to see the exact price</span>
          </div>
        )}
        {!sizeId && !isCard && (
          <p className="mt-2 text-xs">{totalQuantity} pieces</p>
        )}
      </div>
    );
  }

  // Scenario 2: SizeId passed, find the specific size and return its details
  if (!selectedSize || discountedPrice === null) {
    return null;
  }

  return (
    <div>
      <div className="text-orange-primary inline-block font-bold leading-none mr-2.5">
        <span className="inline-block text-4xl">
          R{discountedPrice.toFixed(2)}
        </span>
      </div>
      {selectedSize.price !== discountedPrice && (
        <span className="text-[#999] inline-block text-xl font-normal leading-6 mr-2 line-through">
          R{selectedSize.price.toFixed(2)}
        </span>
      )}
      {selectedSize.discount > 0 && (
        <span className="inline-block text-orange-seconadry text-xl leading-6">
          {selectedSize.discount} % off
        </span>
      )}
      <p className="mt-2 text-xs">
        {selectedSize.quantity > 0 ? (
          `${selectedSize.quantity} items`
        ) : (
          <span className="text-red-500">Out of stock</span>
        )}
      </p>
    </div>
  );
};

export default ProductPrice;
