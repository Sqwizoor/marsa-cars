import DataTable from "@/components/ui/data-table";
import { getAllStoreProducts } from "@/queries/product";
import { columns } from "./columns";

export default async function SellerInventoryPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  // Destructure storeUrl from the awaited params
  const { storeUrl } = await params;

  // Fetch all products for inventory management
  const products = await getAllStoreProducts(storeUrl);

  // Transform products into inventory format
  const inventoryData = products.flatMap((product) =>
    product.variants.flatMap((variant) =>
      variant.sizes.map((size) => ({
        id: size.id,
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.variantName,
        sku: variant.sku,
        size: size.size,
        price: size.price,
        discount: size.discount,
        quantity: size.quantity,
        image: variant.images[0]?.url || "",
        category: product.category.name,
        subCategory: product.subCategory.name,
      }))
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your product stock levels
          </p>
        </div>
      </div>
      
      <DataTable
        filterValue="productName"
        data={inventoryData}
        columns={columns}
        searchPlaceholder="Search products..."
      />
    </div>
  );
}
