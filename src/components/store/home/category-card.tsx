import { FeaturedCategoryType } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({
  category,
}: {
  category: FeaturedCategoryType;
}) {
  return (
    <div className="group w-full rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <Link href={`/browse?category=${category.url}`}>
        <div className="px-3 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-gray-800 line-clamp-1 flex-1">
              {category.name}
            </span>
            <span className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
              View →
            </span>
          </div>
        </div>
      </Link>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        {category.subCategories.slice(0, 4).map((sub) => (
          <Link
            key={sub.id}
            href={`/browse?subCategory=${sub.url}`}
            className="relative cursor-pointer rounded-lg overflow-hidden group/item"
          >
            <Image
              src={sub.image}
              alt={sub.name}
              width={120}
              height={100}
              className="w-full h-20 object-cover group-hover/item:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-end p-1.5">
              <span className="text-[10px] font-semibold text-white line-clamp-1">{sub.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
