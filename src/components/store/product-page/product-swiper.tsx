"use client";
// React, Next.js
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

// Image zoom
import ImageZoom from "react-image-zooom";

// Utils
import { cn } from "@/lib/utils";

// Types
import { ProductVariantImage } from "@prisma/client";

// UI Components
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductSwiper({
  images,
  activeImage,
  setActiveImage,
}: {
  images: ProductVariantImage[];
  activeImage: ProductVariantImage | null;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // If no images are provided, exit early and don't render anything
  if (!images) return null;

  const activeIndex = activeImage ? images.findIndex(img => img.id === activeImage.id) : 0;

  return (
    <div className="relative w-full">
      <div className="relative w-full flex flex-col-reverse xl:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex flex-row xl:flex-col gap-3 overflow-x-auto xl:pb-0 [&::-webkit-scrollbar]:hidden -mx-1 px-1">
          {images.map((img) => (
            <div
              key={img.url}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-100 cursor-pointer transition-all duration-75 ease-in hover:border-main-primary",
                {
                  "border-main-primary ring-1 ring-main-primary ring-offset-1": activeImage
                    ? activeImage.id === img.id
                    : false,
                }
              )}
              onMouseEnter={() => setActiveImage(img)}
              onClick={() => setActiveImage(img)}
            >
              <Image
                src={img.url}
                alt={img.alt || "Product image"}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Image view */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] rounded-xl overflow-hidden border border-gray-100 bg-white cursor-zoom-in">
              <div className="w-full h-full flex items-center justify-center">
                 <ImageZoom
                  src={activeImage ? activeImage.url : ""}
                  zoom={200}
                  className="!w-full !h-full object-contain"
                />
              </div>
              {/* Mobile hint or overlay could go here */}
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
             <VisuallyHidden>
              <DialogTitle>Product Image Gallery</DialogTitle>
            </VisuallyHidden>
            <div className="relative w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                initialSlide={activeIndex}
                className="w-full h-full"
                spaceBetween={20}
                slidesPerView={1}
              >
                {images.map((img) => (
                  <SwiperSlide key={img.id} className="flex items-center justify-center bg-white">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <Image
                        src={img.url}
                        alt={img.alt || "Product image"}
                        fill
                        className="object-contain"
                        quality={100}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
