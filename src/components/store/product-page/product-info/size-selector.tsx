import { CartProductType } from "@/lib/types";
import { Size } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const handleCartProductToBeAddedChange = useCallback(
    (size: Size) => {
      handleChange("sizeId", size.id);
      handleChange("size", size.size);
    },
    [handleChange]
  );

  useEffect(() => {
    if (!sizeId) {
      return;
    }

    const selectedSize = sizes.find((s) => s.id === sizeId);
    if (selectedSize) {
      handleCartProductToBeAddedChange(selectedSize);
    }
  }, [handleCartProductToBeAddedChange, sizeId, sizes]);

  const handleSelectSize = (size: Size) => {
    params.set("size", size.id);
    handleCartProductToBeAddedChange(size);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {sizes.map((size) => (
        <span
          key={size.size}
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
