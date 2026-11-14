"use client";
import { CartProductType, ProductPageDataType } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react";
import { CopyIcon } from "@/components/store/icons";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import ProductPrice from "./product-price";
import Countdown from "../../shared/countdown";
import { Separator } from "@/components/ui/separator";
import ProductVariantSelector from "./variant-selector";
import SizeSelector from "./size-selector";
import ProductAssurancePolicy from "./assurance-policy";
import { ProductVariantImage } from "@prisma/client";
import ProductWatch from "./product-watch";
import ColorWheel from "@/components/shared/color-wheel";
import StarRatings from "react-star-ratings";

interface Props {
  productData: ProductPageDataType;
  sizeId: string | undefined;
  handleChange: (
    property: keyof CartProductType,
    value: CartProductType[keyof CartProductType]
  ) => void;
  setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}

const ProductInfo: FC<Props> = ({
  productData,
  sizeId,
  handleChange,
  setVariantImages,
  setActiveImage,
}) => {
  // Check if productData exists, return null if it's missing (prevents rendering when there's no data)
  if (!productData) return null;

  // Destructure necessary properties from the productData object
  const {
    name,
    sku,
    colors,
    variantInfo,
    sizes,
    isSale,
    saleEndDate,
    variantName,
    variantId,
    store,
    rating,
    reviewsStatistics,
    approvalStatus,
  } = productData;

  const { totalReviews } = reviewsStatistics;

  // Function to copy the SKU to the clipboard
  const copySkuToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      toast.success("Copied successfully");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative w-full xl:w-[540px]">
      {approvalStatus === "PENDING" && (
        <div className="mb-2">
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
          >
            On Review
          </Badge>
        </div>
      )}
      {/* Title */}
      <div>
        <h1 className="text-main-primary text-lg sm:text-xl font-bold leading-snug break-words">
          {name}
          {variantInfo.length > 1 && variantName && variantName !== name && ` · ${variantName}`}
        </h1>
      </div>
      {/* Sku - Rating - Num reviews */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs mt-2">
        {/* Store details */}
        <Link
          href={`/store/${store.url}`}
          className="inline-block hover:underline shrink-0"
        >
          <div className="w-full flex items-center gap-x-1">
            <Image
              src={store.logo}
              alt={store.name}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </Link>
        {/* Sku - Rating - Num reviews */}
        <div className="flex items-center min-w-0 max-w-full">
          <span className="truncate text-gray-500">
            SKU: {sku}
          </span>
          <span
            className="inline-block align-middle text-[#2F68A8] mx-1 cursor-pointer shrink-0"
            onClick={copySkuToClipboard}
          >
            <CopyIcon />
          </span>
        </div>
        <div className="flex items-center gap-x-2 whitespace-nowrap">
          {/* <ReactStars
            count={5}
            size={24}
            color="#F5F5F5"
            activeColor="#FFD804"
            value={rating}
            isHalf
            edit={true}
          /> */}
 <StarRatings
                rating={rating}
                starRatedColor="#ffb400" // Active star color (yellow)
                starEmptyColor="#e2dfdf" // Inactive star color (gray)
                numberOfStars={5}
                starDimension="14px"
                starSpacing="2px"
              />
          
          <Link href="#reviews" className="text-[#ffd804] hover:underline">
            (
            {totalReviews === 0
              ? "No review yet"
              : totalReviews === 1
              ? "1 review"
              : `${totalReviews} reviews`}
            )
          </Link>
        </div>
      </div>
      {/* Price - Sale countdown */}
      <div className="my-2 relative flex flex-col sm:flex-row justify-between">
        <ProductPrice
          sizeId={sizeId}
          sizes={sizes}
          handleChange={handleChange}
        />
        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>
      {/* Product live watchers count */}
      <ProductWatch productId={variantId} />
      <Separator className="mt-3" />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 items-start mt-4 pb-3">
        {/* Color wheel - variant switcher */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-x-2 text-main-primary font-bold">
            <span className="text-sm md:text-base">
              {colors.length > 1 ? "Colors" : "Color"}
            </span>
            {colors.length > 0 && <ColorWheel colors={colors} size={20} />}
          </div>
          {variantInfo.length > 1 ? (
            <div className="w-full pt-0.5">
              <ProductVariantSelector
                variants={variantInfo}
                slug={productData.variantSlug}
                setVariantImages={setVariantImages}
                setActiveImage={setActiveImage}
              />
            </div>
          ) : (
            colors.length === 0 && (
              <span className="inline-block text-xs text-gray-500">
                Original Finish
              </span>
            )
          )}
        </div>

        {/* Size selector */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-x-2">
            <h2 className="text-main-primary font-bold text-sm md:text-base">
              Size
            </h2>
          </div>
          <SizeSelector
            sizes={sizes}
            sizeId={sizeId}
            handleChange={handleChange}
          />
        </div>
      </div>

      {/* Product assurance */}
      <Separator className="mt-3" />
      <ProductAssurancePolicy />
    </div>
  );
};

export default ProductInfo;
