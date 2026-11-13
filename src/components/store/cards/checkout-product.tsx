import { CartItem } from "@prisma/client";
import { ChevronRight, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutProductCard({
  product,
  isDiscounted,
}: {
  product: CartItem;
  isDiscounted: boolean;
}) {
  const { productSlug, variantSlug, sizeId, shippingFee } = product;
  return (
    <div className="bg-white px-3 sm:px-6 border-t bordet-t-[#ebebeb] select-none">
      <div className="py-4">
        <div className="relative flex self-start">
          {/* Image */}
          <div className="flex items-center">
            <Link
              href={`/product/${productSlug}/${variantSlug}?size=${sizeId}`}
            >
              <div className="m-0 mr-2 sm:mr-4 ml-1 sm:ml-2 w-20 h-20 sm:w-28 sm:h-28 bg-gray-200 relative rounded-lg">
                <Image
                  src={product.image}
                  width={200}
                  height={200}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </Link>
          </div>
          {/* Info */}
          <div className="w-0 min-w-0 flex-1">
            {/* Title */}
            <div className="flex items-start">
              <Link
                href={`/product/${productSlug}/${variantSlug}?size=${sizeId}`}
                className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug hover:underline"
              >
                {product.name}
              </Link>
            </div>
            {/* Style - Size */}
            <div className="my-1.5">
              <button
                type="button"
                className="text-main-primary relative min-h-[24px] bg-gray-100 whitespace-normal px-2.5 py-0.5 max-w-full text-xs leading-4 rounded-xl font-bold cursor-pointer outline-0"
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="text-left inline-block truncate max-w-full">
                    {product.size}
                  </span>
                  <ChevronRight className="w-3 shrink-0" />
                </span>
              </button>
            </div>
            {/* Price - Delivery */}
            <div className="flex flex-col justify-between mt-2 relative">
              {/* Price - Qty */}
              <div className="font-bold w-full flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-block whitespace-nowrap text-sm sm:text-base">
                    R{product.price.toFixed(2)} x {product.quantity}
                  </span>
                  {isDiscounted && (
                    <span className="text-xs font-normal text-orange-background">
                      (Coupon applied)
                    </span>
                  )}
                </div>
              </div>
              {/* Shipping fee */}

              <div className="mt-1 text-xs cursor-pointer">
                <div className="flex items-center mb-1">
                  <span>
                    <Truck className="w-4 inline-block text-[#01a971]" />
                    <span className="text-[#01a971] ml-1">
                      {shippingFee
                        ? `R${shippingFee.toFixed(2)}`
                        : "Free Delivery"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
