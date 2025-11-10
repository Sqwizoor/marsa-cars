"use client";
import { CartProductType, ProductPageDataType } from "@/lib/types";
import { ReactNode, useEffect, useMemo, useState } from "react";
import ProductSwiper from "./product-swiper";
import ProductInfo from "./product-info/product-info";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-card";
import { cn, isProductValidToAdd, updateProductHistory } from "@/lib/utils";
import QuantitySelector from "./quantity-selector";
import SocialShare from "../shared/social-share";
import { ProductVariantImage } from "@prisma/client";
import { useCartStore } from "@/cart-store/useCartStore";
import toast from "react-hot-toast";
import useFromStore from "@/hooks/useFromStore";
import { setCookie } from "cookies-next";
import FastDelivery from "../cards/fast-delivery";

interface Props {
  productData: ProductPageDataType;
  sizeId: string | undefined;
  children: ReactNode;
}

const ProductPageContainer = ({ productData, sizeId, children }: Props) => {
  // Hooks must be called before any conditional returns
  // State for temporary product images
  const normalizedImages = useMemo(
    () => productData?.images ?? [],
    [productData?.images]
  );
  const shippingDetails =
    productData && typeof productData.shippingDetails !== "boolean"
      ? productData.shippingDetails
      : null;

  const [variantImages, setVariantImages] = useState<ProductVariantImage[]>(
    normalizedImages
  );

  // useState hook to manage the active image being displayed, initialized to the first image in the array
  const [activeImage, setActiveImage] = useState<ProductVariantImage | null>(
    normalizedImages[0] ?? null
  );

  // useState hook to manage the product's state in the cart
  const baseCartProduct = useMemo(() => {
    if (!productData || !shippingDetails) {
      return null;
    }

    return {
      productId: productData.productId,
      variantId: productData.variantId,
      productSlug: productData.productSlug,
      variantSlug: productData.variantSlug,
      name: productData.name,
      variantName: productData.variantName,
      image: normalizedImages[0]?.url ?? "",
      variantImage: productData.variantImage,
      quantity: 1,
      price: 0,
      sizeId: sizeId || "",
      size: "",
      stock: 1,
      weight: productData.weight,
      shippingMethod: shippingDetails.shippingFeeMethod,
      shippingService: shippingDetails.shippingService,
      shippingFee: shippingDetails.shippingFee,
      extraShippingFee: shippingDetails.extraShippingFee,
      deliveryTimeMin: shippingDetails.deliveryTimeMin,
      deliveryTimeMax: shippingDetails.deliveryTimeMax,
      isFreeShipping: shippingDetails.isFreeShipping,
      id: undefined,
    } satisfies CartProductType;
  }, [normalizedImages, productData, shippingDetails, sizeId]);

  const [productToBeAddedToCart, setProductToBeAddedToCart] =
    useState<CartProductType | null>(baseCartProduct);

  const [isProductValid, setIsProductValid] = useState<boolean>(false);

  // Get the store action to add items to cart
  const addToCart = useCartStore((state) => state.addToCart);

  // Get the set Cart action to update items in cart
  const cartItems = useFromStore(useCartStore, (state) => state.cart);
  const productId = productData?.productId ?? "";
  const variantId = productData?.variantId ?? "";

  useEffect(() => {
    if (!baseCartProduct) {
      setProductToBeAddedToCart(null);
      return;
    }

    setProductToBeAddedToCart((prev) => {
      if (!prev || prev.variantId !== baseCartProduct.variantId) {
        return baseCartProduct;
      }

      return {
        ...prev,
        ...baseCartProduct,
        quantity: prev.quantity,
        size: prev.size,
        stock: prev.stock,
      };
    });
  }, [baseCartProduct]);

  useEffect(() => {
    setVariantImages(normalizedImages);
    setActiveImage(normalizedImages[0] ?? null);
  }, [normalizedImages]);

  const stock =
    productToBeAddedToCart?.stock ?? baseCartProduct?.stock ?? 0;

  // Function to handle state changes for the product properties
  const handleChange = (
    property: keyof CartProductType,
    value: CartProductType[keyof CartProductType]
  ) => {
    setProductToBeAddedToCart((prevProduct) => ({
      ...prevProduct!,
      [property]: value,
    }));
  };

  // Keeping cart state updated

  useEffect(() => {
    if (productToBeAddedToCart) {
      const check = isProductValidToAdd(productToBeAddedToCart);
      setIsProductValid(check);
    } else {
      setIsProductValid(false);
    }
  }, [productToBeAddedToCart]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the "cart" key was changed in localStorage
      if (event.key === "cart") {
        try {
          const parsedValue = event.newValue
            ? JSON.parse(event.newValue)
            : null;

          // Check if parsedValue and state are valid and then update the cart
          if (
            parsedValue &&
            parsedValue.state &&
            Array.isArray(parsedValue.state.cart)
          ) {
            // Optionally sync cart state here if required in future.
          }
        } catch (error) {
          console.error("Failed to parse updated cart data:", error);
        }
      }
    };

    // Attach the event listener
    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (variantId) {
      updateProductHistory(variantId);
    }
  }, [variantId]);

  useEffect(() => {
    if (productId) {
      setCookie(`viewedProduct_${productId}`, "true", {
        maxAge: 3600,
        path: "/",
      });
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (maxQty <= 0 || !productToBeAddedToCart) return;
    addToCart(productToBeAddedToCart);
    toast.success("Product added to cart successfully.");
  };

  const maxQty = useMemo(() => {
    if (!productId || !variantId) {
      return stock;
    }

    const searchProduct = cartItems?.find(
      (p) =>
        p.productId === productId &&
        p.variantId === variantId &&
        p.sizeId === sizeId
    );

    if (!searchProduct) {
      return stock;
    }

    return searchProduct.stock - searchProduct.quantity;
  }, [cartItems, productId, variantId, sizeId, stock]);

  if (!productData || !shippingDetails) {
    return null;
  }

  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        <ProductSwiper
          images={variantImages.length > 0 ? variantImages : normalizedImages}
          activeImage={activeImage || normalizedImages[0]}
          setActiveImage={setActiveImage}
        />
        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
          {/* Product main info */}
          <ProductInfo
            productData={productData}
            sizeId={sizeId}
            handleChange={handleChange}
            setVariantImages={setVariantImages}
            setActiveImage={setActiveImage}
          />
          {/* Shipping details - buy actions buttons */}
          <div className="md:w-[390px]">
            <div className="z-20">
              <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
                {typeof shippingDetails !== "boolean" && (
                  <>
                    <ShipTo
                      countryCode={shippingDetails.countryCode}
                      countryName={shippingDetails.countryName}
                      city={shippingDetails.city}
                    />
                    <div className="mt-3 space-y-3">
                      <ShippingDetails
                        shippingDetails={shippingDetails}
                        quantity={1}
                        weight={productData.weight}
                      />
                    </div>
                    <ReturnPrivacySecurityCard
                      returnPolicy={shippingDetails.returnPolicy}
                    />
                    <FastDelivery />
                  </>
                )}
                {/* Action buttons */}
                <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
                  {/* Qty selector */}
                  {sizeId && productToBeAddedToCart && (
                    <div className="w-full flex justify-end mt-4">
                      <QuantitySelector
                        productId={productToBeAddedToCart.productId}
                        variantId={productToBeAddedToCart.variantId}
                        sizeId={productToBeAddedToCart.sizeId}
                        quantity={productToBeAddedToCart.quantity}
                        stock={productToBeAddedToCart.stock}
                        handleChange={handleChange}
                      />
                    </div>
                  )}
                  {/* Action buttons */}
                  <button className="relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none">
                    <span>Buy now</span>
                  </button>
                  <button
                    disabled={!isProductValid}
                    className={cn(
                      "relative w-full py-2.5 min-w-20 bg-orange-border hover:bg-[#e4cdce] text-orange-hover h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none",
                      {
                        "cursor-not-allowed": !isProductValid || maxQty <= 0,
                      }
                    )}
                    onClick={() => handleAddToCart()}
                  >
                    <span>Add to cart</span>
                  </button>
                  {/* Share to socials */}
                  <SocialShare
                    url={`/product/${productData.productSlug}/${productData.variantSlug}`}
                    quote={`${productData.name} · ${productData.variantName}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[calc(100%-390px)] mt-6 pb-16">{children}</div>
    </div>
  );
};

export default ProductPageContainer;
