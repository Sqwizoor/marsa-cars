"use client";
import { ProductType, SimpleProduct } from "@/lib/types";
import { FC, ReactNode, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperProps } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import ProductCard from "../cards/product/product-card";
import { Navigation, Pagination, Scrollbar, Autoplay } from "swiper/modules";
import ProductCardSimple from "../cards/product/simple-card";
import ProductCardModern from "../cards/product/modern-card";
import ProductCardDeal from "../cards/product/deal-card";
import ProductCardMini from "../cards/product/mini-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FreeMode } from "swiper/modules";

interface Props {
  children?: ReactNode;
  products: SimpleProduct[] | ProductType[];
  type: "main" | "curved" | "simple" | "deal" | "mini";
  slidesPerView?: number;
  breakpoints?: SwiperProps["breakpoints"];
  spaceBetween?: number;
  withScrollbar?: boolean;
  autoplay?: boolean | { delay: number; disableOnInteraction: boolean; pauseOnMouseEnter?: boolean };
  loop?: boolean;
  speed?: number;
  freeMode?: boolean;
}

const MainSwiper: FC<Props> = ({
  products,
  type,
  breakpoints = {
    500: { slidesPerView: 2 },
    750: { slidesPerView: 3 },
    965: { slidesPerView: 4 },
    1200: { slidesPerView: 5 },
    1400: { slidesPerView: 6 },
  },
  children,
  slidesPerView = 1,
  spaceBetween = 30,
  withScrollbar = false,
  autoplay = false,
  loop = false,
  speed,
  freeMode = false,
}) => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="p-2 md:p-3 rounded-md cursor-pointer relative group">
      <div>{children}</div>
      
      {/* Custom Navigation Buttons - Only show for non-mini types or if needed */}
      {type !== "mini" && (
        <>
          <button 
            ref={prevRef} 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-white hover:scale-110 text-gray-800 border border-gray-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            ref={nextRef} 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-white hover:scale-110 text-gray-800 border border-gray-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, Autoplay, FreeMode]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        autoplay={autoplay}
        loop={loop}
        speed={speed}
        freeMode={freeMode}
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        scrollbar={withScrollbar ? { 
          draggable: true, 
          hide: false,
          el: '.custom-swiper-scrollbar',
          dragClass: 'custom-swiper-scrollbar-drag'
        } : false}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        breakpoints={breakpoints}
        className="!pb-8" // Add padding bottom for scrollbar
      >
        {products.map((product) => {
          // Both SimpleProduct and ProductType have id now
          const key = product.id;
          
          return (
            <SwiperSlide key={key}>
              {type === "simple" ? (
                <ProductCardSimple product={product as SimpleProduct} />
              ) : type === "mini" ? (
                <ProductCardMini product={product as SimpleProduct} />
              ) : type === "deal" ? (
                <ProductCardDeal product={product as SimpleProduct} />
              ) : type === "curved" ? (
                <div className="h-[280px]">
                  <ProductCardModern product={product as ProductType} />
                </div>
              ) : (
                <ProductCard product={product as ProductType} />
              )}
            </SwiperSlide>
          );
        })}
        
        {withScrollbar && (
          <div className="custom-swiper-scrollbar !bg-gray-100 !h-1.5 !rounded-full !w-[calc(100%-32px)] !left-4 !bottom-2">
            <div className="custom-swiper-scrollbar-drag !bg-gray-300 hover:!bg-gray-400 !rounded-full transition-colors"></div>
          </div>
        )}
      </Swiper>
    </div>
  );
};

export default MainSwiper;
