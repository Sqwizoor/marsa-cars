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
      <div className="w-[130px] h-[180px] relative flex flex-col bg-white rounded-xl items-center justify-between p-2 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
        <div className="p-1 bg-white rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            width={120}
            height={95}
            className="min-h-[95px] max-h-[95px] w-[115px] object-cover rounded-lg shadow-sm"
            loading="lazy"
            quality={75}
          />
        </div>
        <div className="w-full flex justify-center mb-2">
          <div className="py-1 px-3 bg-[#ff4747] text-white font-bold text-sm rounded-full shadow-sm group-hover:bg-red-600 transition-colors">
            R{product.price?.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
