"use client";
import { ProductType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { FC, useCallback, useEffect, useState } from "react";
import ProductCardModern from "../cards/product/modern-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  storeUrl: string;
  storeName: string;
  count: number;
}

const StoreProducts: FC<Props> = ({ storeUrl, count, storeName }) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const getStoreProducts = useCallback(async () => {
    const res = await getProducts({ store: storeUrl }, "", 1, count);
    setProducts(res.products);
  }, [count, storeUrl]);

  useEffect(() => {
    void getStoreProducts();
  }, [getStoreProducts]);

  if (products.length === 0) return null;

  return (
    <div className="relative mt-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-main-primary flex items-center gap-2">
          Recommended from {storeName}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </h2>
        <Link 
          href={`/store/${storeUrl}`}
          className="text-sm font-medium text-blue-primary hover:text-blue-700 transition-colors"
        >
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="h-[320px]">
            <ProductCardModern product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreProducts;
