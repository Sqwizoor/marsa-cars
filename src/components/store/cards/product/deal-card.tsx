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
      <div className="relative h-full bg-zinc-900 border border-zinc-800 hover:border-yellow-400 transition-colors duration-300 flex flex-col">
        {/* Image Container with Tech Grid Background */}
        <div className="relative w-full aspect-square bg-zinc-950 overflow-hidden border-b border-zinc-800">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
          />
          
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Flash Badge - Sharp corners */}
          <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 uppercase tracking-wider">
            Flash Deal
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow justify-between bg-zinc-900">
          <div>
            <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors">
              {product.name}
            </h3>
          </div>
          
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Current Price</span>
              <span className="text-xl font-mono font-bold text-white">
                R{product.price?.toFixed(0)}
              </span>
            </div>
            {/* Square button */}
            <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
