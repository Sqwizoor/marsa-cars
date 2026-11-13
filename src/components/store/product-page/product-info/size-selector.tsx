import { CartProductType } from "@/lib/types";
import { Size } from "@prisma/client";
import { FC, useCallback, useEffect } from "react";

interface Props {
  sizes: Size[];
  sizeId: string | undefined;
  handleChange: (
    property: keyof CartProductType,
    value: CartProductType[keyof CartProductType]
  ) => void;
}

const SizeSelector: FC<Props> = ({ sizeId, sizes, handleChange }) => {
  const handleCartProductToBeAddedChange = useCallback(
    (size: Size) => {
      handleChange("sizeId", size.id);
      handleChange("size", size.size);
      handleChange("stock", size.quantity);
      // Calculate price with discount if applicable
      const finalPrice = size.discount
        ? size.price - (size.price * size.discount) / 100
        : size.price;
      handleChange("price", finalPrice);
    },
    [handleChange]
  );

  useEffect(() => {
    if (sizes.length === 0) {
      return;
    }

    const selectedSize = sizeId
      ? sizes.find((s) => s.id === sizeId) ?? sizes[0]
      : sizes[0];

    if (selectedSize) {
      handleCartProductToBeAddedChange(selectedSize);
    }
  }, [handleCartProductToBeAddedChange, sizeId, sizes]);

  const handleSelectSize = (size: Size) => {
    handleCartProductToBeAddedChange(size);
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("size", size.id);
      window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {sizes.map((size) => (
        <span
          key={size.id}
          className="border rounded-full px-5 py-1 cursor-pointer hover:border-black"
          style={{ borderColor: size.id === sizeId ? "#000" : "" }}
          onClick={() => handleSelectSize(size)}
        >
          {size.size}
        </span>
      ))}
    </div>
  );
};

export default SizeSelector;
