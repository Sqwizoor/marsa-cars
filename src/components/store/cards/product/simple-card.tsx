import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardSimple({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}/${product.variantSlug}`} className="block group scale-95 origin-center">
      <div className="w-28 sm:w-32 md:w-36 lg:w-[140px] h-32 sm:h-36 md:h-40 lg:h-[180px] relative flex flex-col bg-white rounded-lg sm:rounded-xl items-center justify-between p-2 sm:p-2.5 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
        <div className="p-0.5 sm:p-1 bg-white rounded-lg w-full flex justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={110}
            height={85}
            className="h-16 sm:h-20 md:h-24 lg:min-h-[90px] w-24 sm:w-28 md:w-32 lg:w-[120px] object-cover rounded-lg shadow-sm"
            loading="lazy"
            quality={75}
          />
        </div>
        <div className="w-full flex justify-center mb-1 sm:mb-1.5">
          <div className="py-0.5 sm:py-1 px-2 sm:px-3 bg-[#ff4747] text-white font-bold text-[10px] sm:text-xs rounded-full shadow-sm group-hover:bg-red-600 transition-colors">
            R{product.price?.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
