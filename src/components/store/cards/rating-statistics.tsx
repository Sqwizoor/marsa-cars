"use client";
import { StatisticsCardType } from "@/lib/types";

import StarRatings from "react-star-ratings";

export default function RatingStatisticsCard({
  statistics,
}: {
  statistics: StatisticsCardType;
}) {
  return (
    <div className="w-full md:flex-1 min-h-[11rem] md:h-44">
      <div className="py-5 px-4 sm:px-7 bg-[#f5f5f5] flex flex-col gap-y-2 h-full justify-center overflow-hidden rounded-lg">
        {statistics
          .slice()
          .reverse()
          .map((rating) => (
            <div key={rating.rating} className="flex items-center h-4">
              {/* <ReactStars
                count={5}
                value={rating.rating}
                size={15}
                color="#e2dfdf"
                isHalf
                edit={false}
              /> */}

              <div className="shrink-0">
                <StarRatings
                  rating={rating.rating}
                  starRatedColor="#ffb400" // Active star color (yellow)
                  starEmptyColor="#e2dfdf" // Inactive star color (gray)
                  numberOfStars={5}
                  starDimension="16px"
                  starSpacing="2px"
                />
              </div>
              <div className="relative w-full flex-1 h-1.5 mx-2 sm:mx-2.5 bg-[#e2dfdf] rounded-full min-w-[40px]">
                <div
                  className="absolute left-0 h-full rounded-full bg-[#ffc50A]"
                  style={{ width: `${rating.percentage}%` }}
                />
              </div>
              <div className="text-xs w-8 sm:w-12 text-right leading-4 shrink-0">{rating.numReviews}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
