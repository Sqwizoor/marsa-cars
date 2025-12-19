"use client";
import Link from "next/link";
import MainSwiper from "../../shared/swiper";
import { SimpleProduct } from "@/lib/types";

export default function Featured({ products }: { products: SimpleProduct[] }) {
  return (
    <div className="relative rounded-md overflow-hidden">
      <div
        className="w-full flex flex-col lg:flex-row items-center bg-cover bg-yellow-600 bg-center bg-no-repeat"
        // style={{ backgroundImage: "url(/assets/images/ads/featured.webp)" }}
      >
        {/* Coupon */}
        <Link href="/" className="shrink-0 w-full lg:w-auto px-3 py-3 lg:py-0 lg:px-0">
          <div className="w-full lg:w-52 relative h-auto lg:h-[190px] flex flex-col justify-center">
            <div className="flex flex-col justify-center items-center h-auto lg:h-[103px] mb-3 lg:mb-0">
              <h3 className="leading-5 font-bold my-1 text-white w-full text-center text-sm lg:text-base">
                Wecome Newcomers!
              </h3>
              <p className="text-xs lg:text-sm w-full text-white text-center">
                Enjoy shopping made easy like nothing before
              </p>
            </div>
            <div
              className="w-full lg:w-[192px] h-[55px] pl-[14px] text-white overflow-hidden pr-[45px]
              text-left bg-contain bg-no-repeat mx-auto lg:mx-0 lg:absolute lg:bottom-[35px]"
              style={{ backgroundImage: "url(/assets/images/ads/coupon.gif)" }}
            >
              <h3 className="text-[20px] leading-6 mt-[11px] mb-1 text-white w-full">
                use &apos;SACARS&apos;
              </h3>
              <p className="overflow-hidden overflow-ellipsis w-full text-xs -translate-y-1">
                for 17% OFF
              </p>
            </div>
          </div>
        </Link>
        {/* Product swiper */}
        <div className="flex-1 min-w-0 w-full lg:w-auto min-[1700px]:ml-10">
          {/*
            
            1170-1700===>
            */}
          <MainSwiper
            products={products}
            type="simple"
            slidesPerView={1}
            spaceBetween={12}
            withScrollbar={false}
            breakpoints={{
              320: { slidesPerView: 1.5 },
              480: { slidesPerView: 2 },
              640: { slidesPerView: 2.5 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
