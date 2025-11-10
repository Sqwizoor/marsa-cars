import ProductFilters from "@/components/store/browse-page/filters";
import ProductSort from "@/components/store/browse-page/sort";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Header from "@/components/store/layout/header/header";
import StoreDEetails from "@/components/store/store-page/store-details";
import StoreProducts from "@/components/store/store-page/store-products";
import { FiltersQueryType } from "@/lib/types";
import { getStorePageDetails } from "@/queries/store";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ storeUrl: string }>;
  searchParams: Promise<FiltersQueryType>;
}) {
  const { storeUrl } = await params;
  const resolvedSearchParams = await searchParams;
  const store = await getStorePageDetails(storeUrl);
  return (
    <>
      <Header />
      <CategoriesHeader />
      <StoreDEetails details={store} />
      <div className="max-w-[95%] mx-auto border-t">
        <div className="flex mt-5 gap-x-5">
          <ProductFilters queries={resolvedSearchParams} storeUrl={storeUrl} />
          <div className="p-4 space-y-5">
            <ProductSort />
            <StoreProducts
              searchParams={resolvedSearchParams}
              store={storeUrl}
            />
          </div>
        </div>
      </div>
    </>
  );
}
