// Product details form
import ProductDetails from "@/components/dashboard/forms/product-details";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductVariant } from "@/queries/product";
import { db } from "@/lib/db";

export default async function ProductVariantPage({
  params,
}: {
  params: Promise<{ storeUrl: string; productId: string; variantId: string }>;
}) {
  const { productId, variantId, storeUrl } = await params;
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const countries = await db.country.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const productDetails = await getProductVariant(productId, variantId);
  if (!productDetails) return;
  return (
    <div>
      <ProductDetails
        categories={categories}
        offerTags={offerTags}
        storeUrl={storeUrl}
        countries={countries}
        data={{
          ...productDetails,
          variantDescription: productDetails.variantDescription ?? undefined,
          colors: productDetails.colors.map((c) => ({ color: c.name })),
        }}
      />
    </div>
  );
}
