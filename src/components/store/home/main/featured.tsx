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
        <Link href="/" className="shrink-0 hidden lg:block">
          <div className="w-52 px-3 relative h-[190px]">
            <div className="flex flex-col justify-center items-center h-[103px]">
              <h3 className="leading-5 font-bold my-1 text-white w-full">
                Wecome Newcomers!
              </h3>
              <p className="text-sm w-full text-white">
                Enjoy shopping made easy like nothing before
              </p>
            </div>
            <div
              className="absolute w-[192px] h-[55px] pl-[14px] text-white overflow-hidden pr-[45px] bottom-[35px] 
              text-left bg-contain bg-no-repeat"
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
        <div className="flex-1 min-w-0 min-[1700px]:ml-10">
          {/*
            
            1170-1700===>
            */}
          <MainSwiper
            products={products}
            type="simple"
            slidesPerView={1}
            spaceBetween={20}
            withScrollbar={true}
          />
        </div>
      </div>
    </div>
  );
}
