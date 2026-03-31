"use server";

// import { db } from "@/lib/db";
// import {
//   ProductSimpleVariantType,
//   ProductSize,
//   ProductType,
//   ProductWithVariants,
//   SimpleProduct,
//   VariantImageType,
// } from "@/lib/types";
// import { unstable_cache } from "next/cache";

// type FormatType = "simple" | "full";

// type Param = {
//   property: "category" | "subCategory" | "offer";
//   value: string;
//   type: FormatType;
//   limit?: number;
// };

// type PropertyMapping = {
//   [key: string]: string;
// };

// Cached internal function for single param fetch
// Cache key depends on args automatically via unstable_cache mechanism if used inside a cached function
// BUT unstable_cache requires explicit key part if we want to granularly control it or invalidate it.
const getCachedProductData = async (property: string, value: string, type: FormatType, limit: number = 20) => {
  return await unstable_cache(
    async () => {
        // Define mappings
        const propertyMapping: PropertyMapping = {
        category: "category.url",
        subCategory: "subCategory.url",
        offer: "offerTag.url",
        };

        const mapProperty = (prop: string): string => {
        if (!propertyMapping[prop]) {
            throw new Error(
            `Invalid property: ${prop} . Must be one of: category, subCategory, offer.`
            );
        }
        return propertyMapping[prop];
        };

        const dbField = mapProperty(property);

        // Construct where clause
        const whereClause: any = {
        status: "APPROVED",
        };

        if (dbField === "offerTag.url") {
        whereClause.offerTag = { url: value };
        } else if (dbField === "category.url") {
        whereClause.category = { url: value };
        } else if (dbField === "subCategory.url") {
        whereClause.subCategory = { url: value };
        }

        // Query products
        const products = await db.product.findMany({
        where: whereClause,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            slug: true,
            name: true,
            rating: true,
            sales: true,
            numReviews: true,
            variants: {
            select: {
                id: true,
                variantName: true,
                variantImage: true,
                slug: true,
                sizes: true,
                images: true,
            },
            },
        },
        });

        return formatProductData(products as ProductWithVariants[], type);
    },
    [`home-product-data-${property}-${value}-${type}-${limit}`], // Unique key per combo
    { revalidate: 1800, tags: ['products', 'home'] } // 30 mins
  )();
};

const getCheapestSize = (
  sizes: ProductSize[]
): (ProductSize & { discountedPrice: number }) | undefined => {
  const sizesWithDiscount = sizes.map((size) => ({
    ...size,
    discountedPrice: size.price * (1 - size.discount / 100),
  }));

  return sizesWithDiscount.sort(
    (a, b) => a.discountedPrice - b.discountedPrice
  )[0];
};

const formatProductData = (
  products: ProductWithVariants[],
  type: FormatType
): SimpleProduct[] | ProductType[] => {
  if (type === "simple") {
    const simpleProducts: SimpleProduct[] = [];
    products.forEach((product) => {
      const variant = product.variants[0];
      if (!variant) return;

      const cheapestSize = getCheapestSize(variant.sizes);
      if (!cheapestSize) return;

      const image = variant.images[0];
      if (!image) return;

      simpleProducts.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        variantName: variant.variantName,
        variantSlug: variant.slug,
        price: cheapestSize.discountedPrice,
        image: image.url,
        images: variant.images,
        discount: cheapestSize.discount,
      });
    });
    return simpleProducts;
  } else if (type === "full") {
    return products.map((product) => {
      const variants: ProductSimpleVariantType[] = product.variants.map(
        (variant) => ({
          variantId: variant.id,
          variantSlug: variant.slug,
          variantName: variant.variantName,
          variantImage: variant.variantImage,
          images: variant.images,
          sizes: variant.sizes,
        })
      );

      const variantImages: VariantImageType[] = variants.map((variant) => ({
        url: `/product/${product.slug}/${variant.variantSlug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      }));

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        rating: product.rating,
        sales: product.sales,
        numReviews: product.numReviews,
        variants,
        variantImages,
      } as ProductType;
    });
  } else {
    throw new Error("Invalid type: must be 'simple' or 'full'.");
  }
};

export const getHomeDataDynamic = async (
  params: Param[]
): Promise<Record<string, SimpleProduct[] | ProductType[]>> => {
  if (!Array.isArray(params) || params.length === 0) {
    throw new Error("Invalid input: params must be a non-empty array.");
  }

  const results = await Promise.all(
    params.map(async ({ property, value, type, limit }) => {
      // Use cached fetcher for each param
      const data = await getCachedProductData(property, value, type, limit || 20);
      const outputKey = `products_${value.replace(/-/g, "_")}`;
      return { [outputKey]: data };
    })
  );

  return results.reduce((acc, result) => ({ ...acc, ...result }), {});
};

const getCachedCategories = unstable_cache(
  async () => {
    return await db.category.findMany({
      where: {
        featured: true,
      },
      select: {
        id: true,
        name: true,
        url: true,
        image: true,
        subCategories: {
          where: {
            featured: true,
          },
          select: {
            id: true,
            name: true,
            url: true,
            image: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            products: {
              _count: "desc",
            },
          },
          take: 3,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      take: 6,
    });
  },
  ['home-featured-categories'],
  { revalidate: 3600, tags: ['categories', 'home'] } // 1 hour
);

export const getHomeFeaturedCategories = async () => {
  const featuredCategories = await getCachedCategories();

  return featuredCategories.map((category) => ({
    id: category.id,
    name: category.name,
    url: category.url,
    productCount: category._count.products,
    subCategories: category.subCategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      url: subcategory.url,
      image: subcategory.image,
      productCount: subcategory._count.products,
    })),
  }));
};
