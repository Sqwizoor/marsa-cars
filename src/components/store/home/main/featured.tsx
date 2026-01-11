"use client";
import Link from "next/link";
import MainSwiper from "../../shared/swiper";
import { SimpleProduct } from "@/lib/types";

export default function Featured({ products }: { products: SimpleProduct[] }) {
  const shouldAutoScroll = products.length > 5;

  return (
    <div className="relative rounded-md overflow-hidden">
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
            {/* <div
              className="w-full h-12 md:h-14 pl-3 md:pl-4 text-white overflow-hidden pr-10 md:pr-12
              text-left bg-contain bg-no-repeat mx-auto md:mx-0 mt-2 md:mt-1"
              style={{ backgroundImage: "url(/assets/images/ads/coupon.gif)" }}
            >
              <h3 className="text-base md:text-lg font-bold leading-5 md:leading-6 mt-1 md:mt-1.5 text-white w-full whitespace-nowrap">
                use &apos;SACARS&apos;
              </h3>
              <p className="text-xs md:text-sm leading-4 text-white font-semibold">
                17% OFF
              </p>
            </div> */}
          </div>
        </div>
        {/* Product swiper */}
        <div className="flex-1 min-w-0 w-full px-2 md:px-4">
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
              320: { slidesPerView: 2, spaceBetween: 5 },
              420: { slidesPerView: 2, spaceBetween: 6 },
              520: { slidesPerView: 3, spaceBetween: 6 },
              640: { slidesPerView: 3, spaceBetween: 5 },
              768: { slidesPerView: 4, spaceBetween: 10 },
              1024: { slidesPerView: 4, spaceBetween: 12 },
              1280: { slidesPerView: 5, spaceBetween: 12 },
              1536: { slidesPerView: 6, spaceBetween: 12 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
