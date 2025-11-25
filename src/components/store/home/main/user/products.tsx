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
        type="simple"
        slidesPerView={3}
        spaceBetween={10}
      />
    </div>
  );
}
