import StoreCard from "@/components/store/cards/store-card";
import OilOfferBanner from "@/components/store/shared/oil-offer-banner";
import SponsoredCarBanner from "@/components/store/shared/sponsored-car-banner";
import ProductPageContainer from "@/components/store/product-page/container";
import ProductDescription from "@/components/store/product-page/product-description";
import ProductQuestions from "@/components/store/product-page/product-questions";
import ProductSpecs from "@/components/store/product-page/product-specs";
import ProductReviews from "@/components/store/product-page/reviews/product-reviews";
import StoreProducts from "@/components/store/product-page/store-products";
import { Separator } from "@/components/ui/separator";
import { getProductPageData } from "@/queries/product";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ productSlug: string; variantSlug: string }>;
  searchParams?: Promise<{
    size?: string;
  }>;
}

export default async function ProductVariantPage({
  params,
  searchParams,
}: PageProps) {
  const { productSlug, variantSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const sizeId = resolvedSearchParams?.size;

  // Fetch product data based on the product slug and variant slug
  const productData = await getProductPageData(productSlug, variantSlug);

  // If no product data is found, show the 404 Not Found page
  if (!productData) {
    notFound();
  }

  // Extract the available sizes for the product variant
  const { sizes } = productData;

  // Resolve the initial selected size directly on the server to avoid
  // redirect round-trips and post-load client navigation flashes.
  const matchedSize = sizeId
    ? sizes.find((size) => size.id === sizeId)
    : undefined;
  const effectiveSizeId = matchedSize?.id ?? sizes[0]?.id;

  const {
    variantInfo,
    specs,
    questions,
    category,
    store,
    reviewsStatistics,
    reviews,
  } = productData;

  return (
    <div className="min-h-screen">
      <div className="md:max-w-[1650px] mx-auto p-4 md:p-8 overflow-x-hidden min-h-screen">
        <ProductPageContainer productData={productData} sizeId={effectiveSizeId}>
          <>
            <Separator className="mt-6" />
            {/* Product description */}
            <ProductDescription text={productData.description} />
          </>
          {(specs.product.length > 0 || specs.variant.length > 0) && (
            <>
              <Separator className="mt-6" />
              {/* Specs table */}
              <ProductSpecs specs={specs} />
            </>
          )}
          {questions.length > 0 && (
            <>
              <Separator className="mt-6" />
              {/* Product Questions */}
              <ProductQuestions questions={productData.questions} />
            </>
          )}
          <Separator className="my-6" />
          {/* Store card */}
          <StoreCard store={productData.store} />
          
          <Separator className="mt-6" />
          <div className="mt-6">
            <OilOfferBanner />
          </div>
          
          <Separator className="mt-6" />
          <div className="mt-6">
            <SponsoredCarBanner />
          </div>
          
          <Separator className="mt-6" />
          {/* Product reviews */}
          <ProductReviews
            productId={productData.productId}
            rating={productData.rating}
            statistics={reviewsStatistics}
            reviews={reviews}
            variantsInfo={variantInfo}
          />

          {/* Store products */}
          <StoreProducts
            storeUrl={store.url}
            storeName={store.name}
            count={5}
          />
        </ProductPageContainer>
      </div>
    </div>
  );
}
