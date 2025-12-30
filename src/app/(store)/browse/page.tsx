import ProductFilters from "@/components/store/browse-page/filters";
import ProductSort from "@/components/store/browse-page/sort";
import ProductList from "@/components/store/shared/product-list";
import { FiltersQueryType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { getFilteredSizes } from "@/queries/size";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<FiltersQueryType>;
}) {
  const params = await searchParams;
  const { category, offer, search, size, sort, subCategory } = params ?? {};
  await getFilteredSizes({});
  const products_data = await getProducts(
    {
      search,
      category,
      subCategory,
      offer,
      size: Array.isArray(size)
        ? size
        : size
        ? [size] // Convert single size string to array
        : undefined, // If no size, keep it undefined
    },
    sort
  );
  const { products } = products_data;

  return (
    <>
      {/* <Header /> */}
      <div className="max-w-[95%] mx-auto pb-20">
        <h1 className="sr-only">Browse Products</h1>
        <div className="flex flex-col lg:flex-row mt-5 gap-x-5">
          <div className="hidden lg:block">
            <ProductFilters queries={params} />
          </div>
          <div className="flex-1 p-0 lg:p-4 space-y-5">
            <ProductSort />
            {/* Product list */}
            <ProductList products={products} />
          </div>
        </div>
      </div>
    </>
  );
}
