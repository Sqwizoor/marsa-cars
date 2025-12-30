"use client";
import Link from "next/link";
import MainSwiper from "../../shared/swiper";
import { SimpleProduct } from "@/lib/types";

export default function Featured({ products }: { products: SimpleProduct[] }) {
  return (
    <div className="relative rounded-md overflow-hidden">
      <div
        className="w-full flex flex-col md:flex-row items-stretch md:items-center bg-cover bg-yellow-600 bg-center bg-no-repeat gap-3 md:gap-0"
        // style={{ backgroundImage: "url(/assets/images/ads/featured.webp)" }}
      >
        {/* Coupon */}
        <div className="shrink-0 w-full md:w-auto px-3 py-3 md:py-4 md:px-4 lg:px-6">
          <div className="w-full md:w-48 lg:w-56 relative h-auto flex flex-col justify-center">
            <div className="flex flex-col justify-center items-center h-auto mb-3 md:mb-0">
              <h3 className="leading-5 font-bold my-1 text-white w-full text-center text-sm md:text-base">
                Discover Amazing Deals!
              </h3>
              <p className="text-xs md:text-sm w-full text-white text-center">
                Top Quality • Best Prices
              </p>
            </div>
            <div
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
            </div>
          </div>
        </div>
        {/* Product swiper */}
        <div className="flex-1 min-w-0 w-full md:flex-1 px-1 md:px-0 md:pr-4">
          <MainSwiper
            products={products}
            type="simple"
            slidesPerView={1}
            spaceBetween={0}
            withScrollbar={false}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 0 },
              420: { slidesPerView: 2.5, spaceBetween: 0 },
              520: { slidesPerView: 2.8, spaceBetween: 0 },
              640: { slidesPerView: 3, spaceBetween: 0 },
              768: { slidesPerView: 3.5, spaceBetween: 0 },
              1024: { slidesPerView: 4, spaceBetween: 0 },
              1280: { slidesPerView: 4.5, spaceBetween: 0 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
