import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export default function CategoriesMenu({
  categories,
  open,
  setOpen,
}: {
  categories: Category[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(
    (state: boolean) => {
    setOpen(state);
    // Delay showing the dropdown until the trigger has finished expanding
    if (state) {
      setTimeout(() => {
        setDropdownVisible(true);
      }, 100);
    } else {
      setDropdownVisible(false);
    }
    },
    [setOpen]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleMenu(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, toggleMenu]);

  return (
    <div
      ref={menuRef}
      className="relative w-10 h-10 xl:w-[256px] z-50"
      // onMouseEnter={() => toggleMenu(true)}
      // onMouseLeave={() => toggleMenu(false)}
    >
      {/* Trigger and Dropdown Container */}
      <div className="relative">
        {/* Trigger */}
        <div
          onClick={() => toggleMenu(!open)}
          className={cn(
            "w-12 xl:w-[256px] h-12 rounded-full -translate-y-1 xl:translate-y-0 xl:h-11 bg-[#535353] text-white text-[20px] relative flex items-center cursor-pointer transition-all duration-100 ease-in-out",
            {
              "w-[256px] bg-[#f5f5f5] text-black text-base rounded-t-[20px] rounded-b-none scale-100":
                open,
              "scale-75": !open,
            }
          )}
        >
          {/* Menu Icon with transition to move right when open */}
          <Menu
            className={cn("absolute top-1/2 -translate-y-1/2 xl:ml-1", {
              "left-5": open,
              "left-3": !open,
            })}
          />

          <span
            className={cn("hidden xl:inline-flex xl:ml-11", {
              "inline-flex !ml-14": open,
            })}
          >
            All Categories
          </span>

          <ChevronDown
            className={cn("hidden xl:inline-flex scale-75 absolute right-3", {
              "inline-flex": open,
            })}
          />
        </div>
        {/* Dropdown */}
        <ul
          className={cn(
            "absolute top-10 left-0 w-[256px] bg-white shadow-xl rounded-b-[20px] transition-all duration-100 ease-in-out scrollbar overflow-y-auto border border-gray-200",
            {
              "max-h-[523px] opacity-100 py-2": dropdownVisible, // Show dropdown
              "max-h-0 opacity-0 py-0": !dropdownVisible, // Hide dropdown
            }
          )}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/browse?category=${category.url}`}
              className="text-[#222]"
            >
              <li className="relative flex items-center mx-2 my-1 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="w-[18px] h-[18px]"
                />
                <span className="text-sm font-normal ml-3 overflow-hidden line-clamp-2 break-words text-main-primary">
                  {category.name}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
