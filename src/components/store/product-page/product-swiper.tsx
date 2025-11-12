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

export default function ProductSwiper({
  images,
  activeImage,
  setActiveImage,
}: {
  images: ProductVariantImage[];
  activeImage: ProductVariantImage | null;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // If no images are provided, exit early and don't render anything
  if (!images) return;

  const handleImageChange = (img: ProductVariantImage) => {
    setIsLoading(true);
    setActiveImage(img);
  };

  return (
    <div className="relative">
      <div className="relative md:w-full flex flex-col-reverse xl:flex-row gap-2">
        {/* Thumbnails */}
        <div className="flex flex-wrap xl:flex-col gap-3">
          {images.map((img) => (
            <div
              key={img.url}
              className={cn(
                "w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-100 cursor-pointer transition-all duration-75 ease-in",
                {
                  "border-main-primary": activeImage
                    ? activeImage.id === img.id
                    : false,
                }
              )}
              onMouseEnter={() => handleImageChange(img)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={80}
                height={80}
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>
        {/* Image view with fixed dimensions */}
        <div className="relative rounded-lg overflow-hidden w-full h-[400px] md:h-[500px] xl:h-[550px] 2xl:h-[600px] 2xl:w-[600px] bg-gray-50 flex-shrink-0">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-50 animate-pulse z-10" />
          )}
          {/* Hidden image to track loading */}
          {activeImage && (
            <Image
              src={activeImage.url}
              alt=""
              width={1}
              height={1}
              className="hidden"
              onLoad={() => setIsLoading(false)}
            />
          )}
          <ImageZoom
            src={activeImage ? activeImage.url : ""}
            zoom={200}
            className="!w-full !h-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
