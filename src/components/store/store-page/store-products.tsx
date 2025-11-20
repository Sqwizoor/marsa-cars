"use client";
import { FiltersQueryType, ProductType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { useEffect, useState } from "react";
import ProductCard from "../cards/product/product-card";

export default function StoreProducts({
  searchParams,
  store,
}: {
  searchParams: FiltersQueryType;
  store: string;
}) {
  const [data, setData] = useState<ProductType[]>([]);
  const { category, offer, search, size, sort, subCategory } = searchParams;

  useEffect(() => {
    const getFilteredProducts = async () => {
      const { products } = await getProducts(
        {
          category,
          offer,
          search,
          size: Array.isArray(size) ? size : size ? [size] : undefined,
          subCategory,
          store,
        },
        sort,
        1,
        100
      );
      setData(products);
    };
    getFilteredProducts();
  }, [category, offer, search, size, sort, store, subCategory]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 bg-white p-2 pb-16 rounded-md">
      {data.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
