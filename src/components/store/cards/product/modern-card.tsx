"use client";
import { CartProductType, ProductType, VariantSimplified } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrencyZAR } from "@/lib/utils";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/cart-store/useCartStore";
import { addToWishlist } from "@/queries/user";
import toast from "react-hot-toast";

export default function ProductCardModern({
  product,
}: {
  product: ProductType;
}) {
  const [variant, setVariant] = useState<VariantSimplified>(
    product.variants[0] as VariantSimplified
  );
  const { addToCart } = useCartStore();

  const size = variant.sizes.reduce((lowest, current) => {
    const currentPriceAfterDiscount =
      current.price * (1 - current.discount / 100);
    const lowestPriceAfterDiscount = lowest.price * (1 - lowest.discount / 100);

    return currentPriceAfterDiscount < lowestPriceAfterDiscount
      ? current
      : lowest;
  });

  const discountPercentage = size.discount > 0 ? Math.round(size.discount) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem: CartProductType = {
      id: `${product.id}-${variant.variantId}-${size.id}`,
      productId: product.id,
      variantId: variant.variantId,
      productSlug: product.slug,
      variantSlug: variant.variantSlug,
      name: product.name,
      variantName: variant.variantName,
      image: variant.images[0]?.url || "",
      variantImage: variant.images[0]?.url || "",
      sizeId: size.id || "",
      size: size.size,
      quantity: 1,
      price: size.price,
      stock: size.quantity,
      weight: 0,
      shippingMethod: "FIXED",
      shippingService: "Standard Shipping",
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin: 3,
      deliveryTimeMax: 7,
      isFreeShipping: false,
    };

    addToCart(cartItem);
    toast.success("Added to cart");
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToWishlist(product.id, variant.variantId);
    if (res.ok) {
      toast.success("Added to wishlist");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Link href={`/product/${product.slug}/${variant.variantSlug}`} className="block h-full group">
      <div className="relative h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-pink-500/30 transition-all duration-300 flex flex-col">
        {/* Image Container - Reduced Height & Added Padding */}
        <div className="relative w-full h-[185px] bg-gray-50 overflow-hidden p-2">
          <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
            <Image 
              src={variant.images[0].url}  
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              quality={75}
            />
          </div>
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-10">
              -{discountPercentage}%
            </div>
          )}

          {/* Variant Selector (Mini) */}
          {product.variantImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="bg-white/90 backdrop-blur-sm p-0.5 rounded-full flex gap-1 shadow-sm">
                {product.variantImages.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full overflow-hidden border-2 cursor-pointer ${
                      variant.variantId === product.variants[i].variantId 
                        ? "border-pink-500" 
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
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-2 pb-2 pt-1 flex flex-col flex-grow">
          <div className="mb-1">
            <div className="flex justify-between items-start gap-2">
               <h3 className="text-main-primary font-bold text-xs line-clamp-1 group-hover:text-pink-500 transition-colors">
                {product.name}
              </h3>
              {product.rating > 0 && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-bold text-main-primary">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-main-secondary line-clamp-1 mt-0.5">
              {variant.variantName}
            </p>
          </div>

          <div className="mt-1 pt-1 flex items-end justify-between">
            <div className="flex flex-col">
              {size.discount > 0 && (
                <span className="text-[9px] text-gray-400 line-through">
                  {formatCurrencyZAR(size.price)}
                </span>
              )}
              <span className="text-sm font-bold text-main-primary leading-none">
                {formatCurrencyZAR(size.price * (1 - size.discount / 100))}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleAddToWishlist}
                className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-colors"
              >
                <Heart className="w-3 h-3" />
              </button>
              <button 
                onClick={handleAddToCart}
                className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-colors"
              >
                <ShoppingCart className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
