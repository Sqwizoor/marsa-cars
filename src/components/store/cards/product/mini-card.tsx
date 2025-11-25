import { SimpleProduct } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCardMini({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}/${product.variantSlug}`}>
      <div className="w-[120px] h-[170px] relative flex flex-col bg-white rounded-md items-center justify-between p-2 shadow-sm border border-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          width={120}
          height={95}
          className="min-h-[95px] max-h-[95px] object-cover rounded-md align-middle"
          loading="lazy"
          quality={75}
        />
        <div className="absolute bottom-6 mt-2 space-y-2">
          <div className="py-1.5 px-2 bg-[#ff4747] text-white font-bold text-sm rounded-lg">
            R{product.price?.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}
