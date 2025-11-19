"use client";
// React, Next.js
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";

// Image zoom
import ImageZoom from "react-image-zooom";

// Utils
import { cn } from "@/lib/utils";

// Types
import { ProductVariantImage } from "@prisma/client";

export default function ProductSwiper({
  images,
  activeImage,
  setActiveImage,
}: {
  images: ProductVariantImage[];
  activeImage: ProductVariantImage | null;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}) {
  // If no images are provided, exit early and don't render anything
  if (!images) return;

  return (
    <div className="relative w-full">
      <div className="relative w-full flex flex-col-reverse xl:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex flex-row xl:flex-col gap-3 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
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
                alt={img.alt}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Image view */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] rounded-xl overflow-hidden border border-gray-100 bg-white">
          <div className="w-full h-full flex items-center justify-center">
             <ImageZoom
              src={activeImage ? activeImage.url : ""}
              zoom={200}
              className="!w-full !h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
