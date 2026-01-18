"use client";
import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function UserCardProducts({
  products,
}: {
  products: SimpleProduct[];
}) {
  // Take only 3 products to display
  const displayProducts = products.slice(0, 3);
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {displayProducts.map((product) => (
        <Link 
          key={product.id} 
          href={`/product/${product.slug}/${product.variantSlug}`}
          className="flex-shrink-0 w-[90px] group"
        >
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative w-full aspect-square bg-gray-100">
              <Image
                src={product.images[0]?.url || "/assets/images/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.discount > 0 && (
                <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  -{product.discount}%
                </span>
              )}
            </div>
            <div className="p-1.5">
              <p className="text-[10px] text-gray-600 truncate leading-tight">
                {product.name}
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs font-bold text-pink-600">
                  R{product.price.toFixed(0)}
                </span>
                {product.discount > 0 && (
                  <span className="text-[9px] text-gray-400 line-through">
                    R{(product.price / (1 - product.discount / 100)).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
