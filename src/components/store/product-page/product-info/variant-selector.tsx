import { VariantInfoType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductVariantImage } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
  variants: VariantInfoType[];
  slug: string;
  setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}

const ProductVariantSelector: FC<Props> = ({
  variants,
  slug,
  setVariantImages,
  setActiveImage,
}) => {
  return (
    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
      {variants.map((variant, i) => (
        <Link
          href={variant.variantUrl}
          key={i}
          onMouseEnter={() => {
            setVariantImages(variant.images);
            setActiveImage(variant.images[0]);
          }}
          onMouseLeave={() => {
            setVariantImages([]);
            setActiveImage(null);
          }}
        >
          <div
            className={cn(
              "w-9 h-9 sm:w-11 sm:h-11 rounded-full grid place-items-center p-0.5 overflow-hidden border border-transparent hover:border-main-primary cursor-pointer transition-all duration-75 ease-in",
              {
                "border-main-primary": slug === variant.variantSlug,
              }
            )}
          >
            <Image
              src={variant.variantImage || "/placeholder.png"}
              alt={`product variant ${variant.variantUrl}`}
              width={44}
              height={44}
              className="rounded-full w-full h-full object-cover"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductVariantSelector;
