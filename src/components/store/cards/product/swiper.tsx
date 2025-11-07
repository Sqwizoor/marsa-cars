//React, Nextjs
import Image from "next/image";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Types
import { ProductVariantImage } from "@prisma/client";
import { useEffect, useRef } from "react";

export default function ProductCardImageSwiper({
  images,
}: {
  images: ProductVariantImage[];
}) {
  const swiperRef = useRef<any>(null);
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.stop();
    }
  }, [swiperRef]);
  return (
    <div
      className="relative mb-2 w-full h-[200px]  contrast-[90%] rounded-2xl overflow-hidden"
      onMouseEnter={() => swiperRef.current.swiper.autoplay.start()}
      onMouseLeave={() => {
        swiperRef.current.swiper.autoplay.stop();
        swiperRef.current.swiper.slideTo(0);
      }}
    >
      <Swiper ref={swiperRef} modules={[Autoplay]} autoplay={{ delay: 500 }}>
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <Image
              src={img.url}
              alt=""
              width={200}
              height={200}
              className="block object-cover h-[200px] w-48 sm:w-52"
              loading="lazy"
              quality={75}
              priority={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
