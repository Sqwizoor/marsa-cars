"use client";
import { ProductType, VariantSimplified } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import ProductCardImageSwiper from "./swiper";
import VariantSwitcher from "./variant-switcher";
import { cn } from "@/lib/utils";
import { Button } from "@/components/store/ui/button";
import { Heart } from "lucide-react";
import ProductPrice from "../../product-page/product-info/product-price";
import { addToWishlist } from "@/queries/user";
import toast from "react-hot-toast";
import StarRatings from "react-star-ratings";

export default function ProductCard({ product }: { product: ProductType }) {
  const { name, slug, rating, sales, variantImages, variants, id } = product;
  const [variant, setVariant] = useState<VariantSimplified>(variants[0] as VariantSimplified);
  const { variantSlug, variantName, images, sizes } = variant;

  const handleaddToWishlist = async () => {
    const res = await addToWishlist(id, variant.variantId);
    
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    
    toast.success("Product successfully added to your wishlist!");
  };

  return (
    <div className="w-full max-w-[280px] mx-auto overflow-hidden">
      <div
        className={cn(
          "group w-full relative transition-all duration-300 bg-white ease-in-out p-4 rounded-3xl border border-gray-200 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 flex flex-col h-full overflow-hidden",
          {
            "": true,
          }
        )}
      >
        <div className="relative w-full flex flex-col">
          <Link
            href={`/product/${slug}/${variantSlug}`}
            className="block w-full relative overflow-hidden"
          >
            {/* Images Swiper */}
            <ProductCardImageSwiper images={images} />
            {/* Title */}
            <div className="text-sm font-medium text-main-primary truncate mt-2 w-full max-w-full">
              {name} · {variantName}
            </div>
            {/* Rating - Sales */}
            {rating > 0 && sales > 0 && (
              <div className="flex items-center gap-x-1 mt-1">
                <StarRatings
                  rating={rating}
                  starRatedColor="#ffb400"
                  starEmptyColor="#e2dfdf"
                  numberOfStars={5}
                  starDimension="15px"
                  starSpacing="1px"
                />
                <div className="pl-2 text-xs text-main-secondary">{sales} sold</div>
              </div>
            )}
            {/* Price */}
            <ProductPrice sizes={sizes} isCard handleChange={() => {}} />
          </Link>
          
          {/* Variant switcher - Always visible */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <VariantSwitcher
              images={variantImages}
              variants={variants as VariantSimplified[]}
              setVariant={setVariant}
              selectedVariant={variant}
            />
          </div>
          
          {/* Action buttons - Always visible */}
          <div className="flex items-center gap-2 mt-2">
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg">
              <Link href={`/product/${slug}/${variantSlug}`} className="w-full">Add to cart</Link>
            </Button>
            <Button
              variant="black"
              size="icon"
              onClick={() => handleaddToWishlist()}
              className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <Heart className="w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
