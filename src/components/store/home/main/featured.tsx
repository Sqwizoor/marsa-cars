"use client";
import Link from "next/link";
import MainSwiper from "../../shared/swiper";
import { SimpleProduct } from "@/lib/types";
import ProductCardSimple from "../../cards/product/simple-card";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function Featured({ products }: { products: SimpleProduct[] }) {
  const [mounted, setMounted] = useState(false);
  const isLargeDevice = useMediaQuery({ minWidth: 1024 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAutoScroll = products.length >= 5;

  return (
    <div className="relative rounded-md overflow-hidden w-full max-w-full">
      <div
        className="w-full flex flex-col items-center bg-cover bg-yellow-600 bg-center bg-no-repeat gap-1 py-1"
        // style={{ backgroundImage: "url(/assets/images/ads/featured.webp)" }}
      >
        {/* Coupon */}
        <div className="shrink-0 w-full px-2">
          <div className="w-full relative h-auto flex flex-col justify-center">
            <div className="flex flex-col justify-center items-center h-auto scale-90 origin-bottom">
              <h3 className="leading-tight font-bold my-0.5 text-white w-full text-center text-base md:text-lg">
                Discover Amazing Deals!
              </h3>
              <p className="text-xs md:text-sm w-full text-white text-center">
                Top Quality • Best Prices
              </p>
            </div>
          </div>
        </div>
        {/* Product swiper or Marquee */}
        <div className="flex-1 min-w-0 w-full max-w-full px-2 md:px-4">
          {mounted && isLargeDevice && shouldAutoScroll ? (
            <div className="w-full overflow-x-hidden overflow-y-visible relative pb-4 pt-2">
              {/* Left/Right Fade Gradients */}
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-r from-yellow-600 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-l from-yellow-600 to-transparent pointer-events-none" />

              <div className="relative w-full overflow-hidden">
                <div
                  className="flex gap-4 animate-marquee-slow pause-on-hover will-change-transform"
                  style={{ display: 'flex', width: 'max-content' }}
                >
                  {/* Create enough duplicates for seamless infinite scroll */}
                  {[...Array(6)].map((_, groupIndex) => (
                    <div key={groupIndex} className="flex gap-4 shrink-0">
                      {products.map((product, i) => (
                        <div key={`${groupIndex}-${product.slug || i}`} className="shrink-0 w-[140px]">
                          <ProductCardSimple product={product} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <MainSwiper
              products={products}
              type="simple"
              slidesPerView={1}
              spaceBetween={8}
              withScrollbar={false}
              loop={shouldAutoScroll}
              freeMode={shouldAutoScroll}
              speed={shouldAutoScroll ? 9000 : undefined}
              autoplay={
                shouldAutoScroll
                  ? {
                      delay: 0,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : {
                      delay: 2000,
                      disableOnInteraction: false,
                    }
              }
              breakpoints={{
                320: { slidesPerView: 3, spaceBetween: 5 },
                420: { slidesPerView: 3, spaceBetween: 6 },
                520: { slidesPerView: 3, spaceBetween: 6 },
                640: { slidesPerView: 3, spaceBetween: 5 },
                768: { slidesPerView: 4, spaceBetween: 10 },
                1024: { slidesPerView: 4, spaceBetween: 12 },
                1280: { slidesPerView: 5, spaceBetween: 12 },
                1536: { slidesPerView: 6, spaceBetween: 12 },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
