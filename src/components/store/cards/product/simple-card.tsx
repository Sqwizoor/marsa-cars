import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardSimple({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}/${product.variantSlug}`} className="block group h-full py-2">
      <div className="w-full h-full min-h-[180px] relative flex flex-col bg-white rounded-xl items-center p-3 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 border border-gray-100">
        <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
            <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2 mix-blend-multiply"
            loading="lazy"
            quality={75}
            />
        </div>
        <div className="mt-auto w-full flex justify-center">
          <div className="py-1.5 px-3 bg-red-600 text-white font-bold text-sm rounded-full shadow-sm group-hover:bg-red-700 transition-colors">
            R{product.price?.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
