import ProductDetails from "@/components/dashboard/forms/product-details";
import { db } from "@/lib/db";
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";

import { currentUser } from "@clerk/nextjs/server";

export default async function SellerNewProductPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  // Await params before destructuring
  const { storeUrl } = await params;
  const user = await currentUser();
  const role = (user?.privateMetadata?.role as string) || "USER";
  
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const countries = await db.country.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="w-full">
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        offerTags={offerTags}
        countries={countries}
        role={role}
      />
    </div>
  );
}
