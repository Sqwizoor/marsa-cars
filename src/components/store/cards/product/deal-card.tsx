import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardDeal({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}/${product.variantSlug}`} className="block group h-full">
      <div className="relative w-full h-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-white/5 group-hover:border-pink-500/50 transition-all duration-300 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10" />
        
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
          <div className="flex items-center justify-between">
            <div className="bg-white/90 backdrop-blur-sm text-slate-900 font-bold text-sm px-2 py-1 rounded-lg shadow-lg">
              R{product.price?.toFixed(2)}
            </div>
          </div>
          <h3 className="text-slate-200 text-xs font-medium truncate mt-2 group-hover:text-white transition-colors drop-shadow-md">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
