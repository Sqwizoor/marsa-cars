"use client";
import { ProductType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { FC, useCallback, useEffect, useState } from "react";
import ProductList from "../shared/product-list";

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
  return (
    <div className="relative mt-6">
      <ProductList
        products={products}
        title={`Recommended from ${storeName}`}
        arrow
      />
    </div>
  );
};

export default StoreProducts;
