"use client";

import { cn } from "@/lib/utils";
import { OfferTag } from "@prisma/client";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export default function OfferTagsLinks({
  offerTags,
  open,
}: {
  offerTags: OfferTag[];
  open: boolean;
}) {
  const isPhoneScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const isSmallScreen = useMediaQuery({ query: "(min-width: 640px)" });
  const isMediumScreen = useMediaQuery({ query: "(min-width: 768px)" });
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });
  const is2XLargeScreen = useMediaQuery({ query: "(min-width: 1536px)" });

  const splitPoint = (() => {
    let value = 1;
    if (isPhoneScreen) value = 2;
    if (isSmallScreen) value = 3;
    if (isMediumScreen) value = 4;
    if (isLargeScreen) value = 6;
    if (is2XLargeScreen) value = 7;
    return value;
  })();
  return (
    <div className="relative w-fit ml-6">
      <div
        className={cn(
          "flex items-center gap-0.5 flex-wrap transition-all duration-100 ease-in-out",
          {
            "!translate-x-0": open,
          }
        )}
      >
        {offerTags.slice(0, splitPoint).map((tag, i) => (
          <Link
            key={tag.id}
            href={`/browse?offer=${tag.url}`}
            className={cn(
              "font-bold text-center text-white px-3 py-1 text-sm rounded-full hover:bg-white/20 transition-colors whitespace-nowrap",
              {
                "text-primary bg-white/10": i === 0,
              }
            )}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
