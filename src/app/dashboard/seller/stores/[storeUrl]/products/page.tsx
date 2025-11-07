import DataTable from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getAllStoreProducts } from "@/queries/product";
import { columns } from "./columns";

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  // Destructure storeUrl from the awaited params
  const { storeUrl } = await params;

  // Use the destructured storeUrl in your async calls
  const [products, categories, offerTags] = await Promise.all([
    getAllStoreProducts(storeUrl),
    getAllCategories(),
    getAllOfferTags(),
  ]);

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create product
        </>
      }
      modalChildren={
        <ProductDetails
          categories={categories}
          offerTags={offerTags}
          storeUrl={storeUrl}
          countries={[]}
        />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/new`}
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceholder="Search product name..."
    />
  );
}
