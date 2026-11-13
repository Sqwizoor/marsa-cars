"use client";
import { ReviewsOrderType } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";

interface Props {
  sort: ReviewsOrderType | undefined;
  setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>;
}

const ReviewsSort: FC<Props> = ({ sort, setSort }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block w-[140px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-main-primary hover:text-[#fd384f] text-sm py-1 text-center inline-flex items-center"
      >
        Sort by{" "}
        {sort?.orderBy === "latest"
          ? "latest"
          : sort?.orderBy === "highest"
          ? "highest"
          : "default"}
        <ChevronDown className="w-3 ml-1" />
      </button>
      {open && (
        <div className="z-20 absolute left-0 mt-1 bg-white shadow-md border border-gray-100 rounded-md w-[150px]">
          <ul className="text-sm text-gray-700 py-1">
            <li
              onClick={() => {
                setSort(undefined);
                setOpen(false);
              }}
            >
              <span className="block px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                Sort by default
              </span>
            </li>
            <li
              onClick={() => {
                setSort({ orderBy: "highest" });
                setOpen(false);
              }}
            >
              <span className="block px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                Sort by highest
              </span>
            </li>
            <li
              onClick={() => {
                setSort({ orderBy: "latest" });
                setOpen(false);
              }}
            >
              <span className="block px-3 py-2 text-sm cursor-pointer hover:bg-gray-100">
                Sort by latest
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReviewsSort;
