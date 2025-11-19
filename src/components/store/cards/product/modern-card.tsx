"use client";
import { ProductType, VariantSimplified } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrencyZAR } from "@/lib/utils";
import { Star } from "lucide-react";

export default function ProductCardModern({
  product,
}: {
  product: ProductType;
}) {
  const [variant, setVariant] = useState<VariantSimplified>(
    product.variants[0] as VariantSimplified
  );

  const size = variant.sizes.reduce((lowest, current) => {
    const currentPriceAfterDiscount =
      current.price * (1 - current.discount / 100);
    const lowestPriceAfterDiscount = lowest.price * (1 - lowest.discount / 100);

    return currentPriceAfterDiscount < lowestPriceAfterDiscount
      ? current
      : lowest;
  });

  const discountPercentage = size.discount > 0 ? Math.round(size.discount) : 0;

  return (
    <Link href={`/product/${product.slug}/${variant.variantSlug}`} className="block h-full group">
      <div className="relative h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-primary/30 transition-all duration-300 flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          <Image 
            src={variant.images[0].url} 
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            quality={75}
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-orange-primary text-white text-[10px] font-bold px-2 py-1 rounded-md">
              -{discountPercentage}%
            </div>
          )}

          {/* Variant Selector (Mini) */}
          {product.variantImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full flex gap-1 shadow-sm">
                {product.variantImages.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full overflow-hidden border-2 cursor-pointer ${
                      variant.variantId === product.variants[i].id 
                        ? "border-blue-primary" 
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onMouseEnter={(e) => {
                      e.preventDefault();
                      setVariant(product.variants[i] as VariantSimplified);
                    }}
                  >
                    <Image
                      src={img.image}
                      alt=""
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-grow">
          <div className="mb-1">
            <h3 className="text-main-primary font-bold text-sm line-clamp-1 group-hover:text-blue-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-main-secondary line-clamp-1">
              {variant.variantName}
            </p>
          </div>

          <div className="mt-auto pt-2 flex items-end justify-between">
            <div className="flex flex-col">
              {size.discount > 0 && (
                <span className="text-[10px] text-gray-400 line-through">
                  {formatCurrencyZAR(size.price)}
                </span>
              )}
              <span className="text-lg font-bold text-main-primary leading-none">
                {formatCurrencyZAR(size.price * (1 - size.discount / 100))}
              </span>
            </div>
            
            {product.rating > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-main-primary">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
