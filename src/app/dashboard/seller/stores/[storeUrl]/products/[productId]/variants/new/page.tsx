// Product Details form
import ProductDetails from "@/components/dashboard/forms/product-details";
import { db } from "@/lib/db";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductMainInfo } from "@/queries/product";

import { currentUser } from "@clerk/nextjs/server";

export default async function SellerNewProductVariantPage({
  params,
}: {
  params: Promise<{ storeUrl: string; productId: string }>;
}) {
  const { storeUrl, productId } = await params;
  const user = await currentUser();
  const role = (user?.privateMetadata?.role as string) || "USER";

  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const product = await getProductMainInfo(productId);
  if (!product) return null;
  const dbCountries = await db.country.findMany();
  const countries = dbCountries.sort((a, b) =>
    a.code === "ZA" ? -1 : b.code === "ZA" ? 1 : a.name.localeCompare(b.name)
  );
  return (
    <div>
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        data={product}
        offerTags={offerTags}
        countries={countries}
        role={role}
      />
    </div>
  );
}
