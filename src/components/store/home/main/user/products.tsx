"use client";
import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function UserCardProducts({
  products,
}: {
  products: SimpleProduct[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-slide effect
  useEffect(() => {
    if (!products || products.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // Wait for fade out, then change product and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setIsVisible(true);
      }, 500); // 500ms matches the duration in className
      
    }, 4000); // Change product every 4 seconds

    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) {
     return <div className="text-white/70 text-sm text-center py-4">No products available</div>;
  }

  const product = products[currentIndex];
  
  return (
    <div className="relative w-full h-[180px] flex items-center justify-center">
       {product && (
       <Link 
          key={product.id} 
          href={`/product/${product.slug}/${product.variantSlug}`}
          className={cn(
            "w-full h-full group transition-all duration-500 ease-in-out transform",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden h-full flex flex-col hover:bg-white/20 transition-colors border border-white/10">
            <div className="relative w-full h-[120px] bg-white/5">
              <Image
                src={product.images[0]?.url || "/assets/images/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount > 0 && (
                 <span className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
                   -{product.discount}%
                 </span>
              )}
            </div>
            <div className="p-2 flex-1 flex flex-col justify-center">
                <h4 className="text-white font-medium text-sm truncate" title={product.name}>{product.name}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
                         {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </span>
                    {product.discount > 0 && (
                        <span className="text-white/60 text-xs line-through decoration-pink-500/50">
                             {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price / (1 - product.discount / 100))}
                        </span>
                    )}
                </div>
            </div>
          </div>
        </Link>
        )}
        
        {/* Indicators */}
        <div className="absolute bottom-[-15px] left-0 right-0 flex justify-center gap-1.5">
            {products.slice(0, Math.min(products.length, 5)).map((_, idx) => (
                <button
                    key={idx} 
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => {
                            setCurrentIndex(idx);
                            setIsVisible(true);
                        }, 200);
                    }}
                    className={cn(
                        "rounded-full transition-all duration-300", 
                        idx === currentIndex ? "bg-white w-4 h-1.5" : "bg-white/30 w-1.5 h-1.5 hover:bg-white/50"
                    )}
                />
            ))}
        </div>
    </div>
  );
}
