"use client";
import ColorWheel from "@/components/shared/color-wheel";
import { ReviewWithImageType } from "@/lib/types";
import Image from "next/image";

import StarRatings from "react-star-ratings";
export default function ReviewCard({
  review,
}: {
  review: ReviewWithImageType;
}) {
  const { images, user } = review;
  const colors = review.color
    .split(",")
    .filter((color) => color.trim() !== "") // Remove any empty strings
    .map((color) => ({ name: color.trim() }));

  const { name } = user;
  const cesnoredName = `${name[0]}***${name[user.name.length - 1]}`;
  return (
    <div className="border border-[#d8d8d8] rounded-xl flex h-fit relative py-4 px-2.5 sm:px-3 gap-2">
      <div className="w-14 sm:w-16 shrink-0 space-y-1 flex flex-col items-center">
        <Image
          src={user.picture}
          alt="Profile image"
          width={100}
          height={100}
          className="w-11 h-11 rounded-full object-cover"
        />
        <span className="text-xs text-main-secondary text-center break-all">
          {cesnoredName.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-1 min-w-0 flex-col justify-between leading-5 overflow-hidden px-1">
        <div className="space-y-2">
          <StarRatings
            rating={review.rating}
            starRatedColor="#ffb400" // Active star color (yellow)
            starEmptyColor="#e2dfdf" // Inactive star color (gray)
            numberOfStars={5}
            starDimension="19px"
            starSpacing="2px"
          />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="shrink-0">
              <ColorWheel colors={colors} size={24} />
            </div>
          
            <div className="text-main-secondary text-xs sm:text-sm">{review.variant}</div>
            <span>·</span>
            <div className="text-main-secondary text-xs sm:text-sm">{review.size}</div>
            <span>·</span>
            <div className="text-main-secondary text-xs sm:text-sm">
              {review.quantity} PC
            </div>
          </div>
          <p className="text-sm break-words">{review.review}</p>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
