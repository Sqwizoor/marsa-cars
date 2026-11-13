import ProductStatusTag from "@/components/shared/product-status";
import { ProductStatus } from "@/lib/types";
import { OrderItem } from "@prisma/client";
import Image from "next/image";

export default function ProductRow({ product }: { product: OrderItem }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-5 gap-4 sm:gap-6 w-full border-b last:border-b-0 border-gray-100">
      <div className="shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover aspect-square"
        />
      </div>
      <div className="flex items-center w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-3">
          <div className="flex items-center min-w-0">
            <div className="min-w-0">
              <h2 className="font-semibold text-base sm:text-xl leading-snug text-black mb-1 line-clamp-2 pr-2">
                {product.name.split("·")[0]}
              </h2>
              {product.name.split("·")[1] && (
                <p className="font-normal text-sm sm:text-base leading-6 text-gray-500 mb-1">
                  {product.name.split("·")[1]}
                </p>
              )}
              <p className="font-normal text-xs sm:text-sm leading-6 text-gray-500 mb-1 break-all">
                #{product.sku}
              </p>
              <div className="flex flex-wrap items-center gap-y-1">
                <p className="font-medium text-sm sm:text-base leading-7 text-black pr-3 mr-3 border-r">
                  Size: <span className="text-gray-500">{product.size}</span>
                </p>
                <p className="font-medium text-sm sm:text-base leading-7 text-black">
                  Qty: <span className="text-gray-500">{product.quantity}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pl-0 lg:pl-5 flex flex-wrap lg:grid lg:grid-cols-3 gap-4 items-center">
            <div className="flex items-center">
              <div className="flex items-center gap-2 lg:block">
                <p className="font-medium text-sm leading-7 text-black">
                  Price
                </p>
                <p className="lg:mt-3 font-medium text-sm leading-7 text-blue-primary whitespace-nowrap">
                  R{product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 flex items-center">
              <div className="flex items-center gap-2 lg:block">
                <p className="font-medium text-sm leading-7 text-black">
                  Status
                </p>
                <div className="leading-6 py-0.5 lg:mt-3 flex">
                  <ProductStatusTag status={product.status as ProductStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
