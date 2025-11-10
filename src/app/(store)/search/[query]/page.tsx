import ProductFilters from "@/components/store/browse-page/filters";
import ProductSort from "@/components/store/browse-page/sort";
import ProductList from "@/components/store/shared/product-list";
import { FiltersQueryType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { getFilteredSizes } from "@/queries/size";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>;
  searchParams: Promise<FiltersQueryType>;
}) {
  const { query } = await params;
  const resolvedSearchParams = await searchParams;
  const { category, offer, size, sort, subCategory } = resolvedSearchParams ?? {};
  
  await getFilteredSizes({});
  
  const products_data = await getProducts(
    {
      search: decodeURIComponent(query),
      category,
      subCategory,
      offer,
      size: Array.isArray(size)
        ? size
        : size
        ? [size]
        : undefined,
    },
    sort
  );
  
  const { products } = products_data;

  return (
    <>
      <div className="max-w-[95%] mx-auto">
        <h1 className="sr-only">Search Results for {decodeURIComponent(query)}</h1>
        <div className="flex mt-5 gap-x-5">
          <ProductFilters queries={resolvedSearchParams} />
          <div className="p-4 space-y-5">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-main-primary">
                Search Results for &quot;{decodeURIComponent(query)}&quot;
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <ProductSort />
            {/* Product list */}
            <ProductList products={products} />
          </div>
        </div>
      </div>
    </>
  );
}
