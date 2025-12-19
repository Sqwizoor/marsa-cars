import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardSimple({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}/${product.variantSlug}`} className="block group">
      <div className="w-24 sm:w-28 md:w-32 lg:w-[130px] h-28 sm:h-32 md:h-40 lg:h-[180px] relative flex flex-col bg-white rounded-lg sm:rounded-xl items-center justify-between p-1.5 sm:p-2 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
        <div className="p-0.5 sm:p-1 bg-white rounded-lg w-full flex justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={100}
            height={75}
            className="h-16 sm:h-20 md:h-24 lg:min-h-[95px] w-20 sm:w-24 md:w-28 lg:w-[115px] object-cover rounded-lg shadow-sm"
            loading="lazy"
            quality={75}
          />
        </div>
        <div className="w-full flex justify-center mb-1 sm:mb-2">
          <div className="py-0.5 sm:py-1 px-2 sm:px-3 bg-[#ff4747] text-white font-bold text-xs sm:text-sm rounded-full shadow-sm group-hover:bg-red-600 transition-colors">
            R{product.price?.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
