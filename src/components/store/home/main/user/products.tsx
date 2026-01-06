"use client";
import MainSwiper from "@/components/store/shared/swiper";
import { SimpleProduct } from "@/lib/types";

export default function UserCardProducts({
  products,
}: {
  products: SimpleProduct[];
}) {
  return (
    <div className="w-full mt-4">
      <MainSwiper
        products={products}
        type="mini"
        slidesPerView={3}
        spaceBetween={10}
        autoplay={true}
        breakpoints={{
          0: {
            slidesPerView: 3,
          },
        }}
      />
    </div>
  );
}
