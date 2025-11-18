import { FeaturedCategoryType } from "@/lib/types";
import CategoryCard from "./category-card";

export default function FeaturedCategories({
  categories,
}: {
  categories: FeaturedCategoryType[];
}) {
  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="text-center h-[32px] leading-[32px] text-[24px] font-extrabold text-[#FF1744] flex justify-center">
        <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
        <span>Featured Categories</span>
        <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
      </div>
      {/* List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full mt-7">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
