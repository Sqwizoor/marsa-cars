"use server";

// DB
import { db } from "@/lib/db";
import { api, convexMutation, convexQuery, isConvexEnabled } from "@/lib/convex";
import { ensureSellerSubscription } from "@/lib/subscription-guard";

// Types
import {
  Country,
  FreeShippingWithCountriesType,
  ProductPageType,
  ProductShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  SortOrder,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";
import { Store, ProductVariant, Size } from "@prisma/client";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Slugify
import slugify from "slugify";
import { generateUniqueSlug } from "@/lib/server-utils";

// Cookies
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";

// Function: upsertProduct
// Description: Upserts a product and its variant into the database, ensuring proper association with the store.
// Access Level: Seller Only
// Parameters:
//   - product: ProductWithVariant object containing details of the product and its variant.
//   - storeUrl: The URL of the store to which the product belongs.
// Returns: Newly created or updated product with variant details.
export const upsertProduct = async (
  product: ProductWithVariantType,
  storeUrl: string
) => {
  try {
    // Retrieve current user
    const user = await currentUser();

    // Check if user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Ensure product data is provided
    if (!product) throw new Error("Please provide product data.");

    if (isConvexEnabled()) {
      return await convexMutation(api.products.upsertProduct, {
        product,
        storeUrl,
        userId: user.id,
        isAdmin: user.privateMetadata?.role === "ADMIN",
      });
    }

    // Find the store by URL
    const store = await db.store.findFirst({
      where: {
        url: {
          equals: storeUrl,
          mode: "insensitive",
        },
      },
      include: {
        members: true,
      },
    });

    if (!store) throw new Error("Store not found.");

    // Check permissions
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isOwner = store.userId === user.id;
    const isMember = store.members.some((member) => member.id === user.id);
    const isAdmin =
      user.privateMetadata?.role === "ADMIN" || dbUser?.role === "ADMIN";

    if (!isOwner && !isMember && !isAdmin) {
      throw new Error(
        "Unauthorized Access: You do not have permission to manage products for this store."
      );
    }

    // Check if the product already exists
    const existingProduct = await db.product.findUnique({
      where: { id: product.productId },
    });

    // Check if the variant already exists
    const existingVariant = await db.productVariant.findUnique({
      where: { id: product.variantId },
    });

    if (existingProduct) {
      if (existingVariant) {
        // Update existing variant and product
        await handleProductUpdate(product);
      } else {
        // Create new variant
        await handleCreateVariant(product);
      }
    } else {
      // Create new product and variant
      await handleProductCreate(product, store.id);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const handleProductUpdate = async (product: ProductWithVariantType) => {
  // Update product info
  await db.product.update({
    where: { id: product.productId },
    data: {
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: { connect: { id: product.categoryId } },
      subCategory: { connect: { id: product.subCategoryId } },
      offerTag: { connect: { id: product.offerTagId } },
      shippingFeeMethod: product.shippingFeeMethod,
      freeShippingForAllCountries: product.freeShippingForAllCountries,
      // Update specs, questions (delete and recreate)
      specs: {
        deleteMany: {},
        create: product.product_specs
          .filter((spec) => spec.name.trim() !== "" && spec.value.trim() !== "")
          .map((spec) => ({
            name: spec.name,
            value: spec.value,
          })),
      },
      questions: {
        deleteMany: {},
        create: product.questions
          .filter((q) => q.question.trim() !== "" && q.answer.trim() !== "")
          .map((q) => ({
            question: q.question,
            answer: q.answer,
          })),
      },
    },
  });

  // Update variant info
  await db.productVariant.update({
    where: { id: product.variantId },
    data: {
      variantName: product.variantName,
      variantDescription: product.variantDescription,
      variantImage: product.variantImage,
      sku: product.sku,
      weight: product.weight,
      isSale: product.isSale,
      saleEndDate: product.saleEndDate,
      keywords: product.keywords.join(","),
      // Update images, colors, sizes, specs (delete and recreate)
      images: {
        deleteMany: {},
        create: product.images.map((img) => ({
          url: img.url,
        })),
      },
      colors: {
        deleteMany: {},
        create: product.colors.map((color) => ({
          name: color.color,
        })),
      },
      sizes: {
        deleteMany: {},
        create: product.sizes.map((size) => ({
          size: size.size,
          price: size.price,
          quantity: size.quantity,
          discount: size.discount,
        })),
      },
      specs: {
        deleteMany: {},
        create: (product.variant_specs || [])
          .filter((spec) => spec.name.trim() !== "" && spec.value.trim() !== "")
          .map((spec) => ({
            name: spec.name,
            value: spec.value,
          })),
      },
    },
  });
};

const handleProductCreate = async (
  product: ProductWithVariantType,
  storeId: string
) => {
  // Generate unique slugs for product and variant
  const productSlug = await generateUniqueSlug(
    slugify(product.name, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "product"
  );

  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName || product.name, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  // Filter out empty specs
  const validSpecs = product.product_specs.filter(
    (spec) => spec.name.trim() !== "" && spec.value.trim() !== ""
  );

  // Filter out empty questions
  const validQuestions = product.questions.filter(
    (q) => q.question.trim() !== "" && q.answer.trim() !== ""
  );

  // Filter out empty variant specs
  const validVariantSpecs = (product.variant_specs || []).filter(
    (spec) => spec.name.trim() !== "" && spec.value.trim() !== ""
  );

  const productData = {
    id: product.productId,
    name: product.name,
    description: product.description,
    slug: productSlug,
    store: { connect: { id: storeId } },
    category: { connect: { id: product.categoryId } },
    subCategory: { connect: { id: product.subCategoryId } },
    offerTag: { connect: { id: product.offerTagId } },
    brand: product.brand,
    specs: {
      create: validSpecs.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    questions: {
      create: validQuestions.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    },
    variants: {
      create: [
        {
          id: product.variantId,
          variantName: product.variantName,
          variantDescription: product.variantDescription,
          slug: variantSlug,
          variantImage: product.variantImage,
          sku: product.sku,
          weight: product.weight,
          keywords: product.keywords.join(","),
          isSale: product.isSale,
          saleEndDate: product.saleEndDate,
          images: {
            create: product.images.map((img) => ({
              url: img.url,
            })),
          },
          colors: {
            create: product.colors.map((color) => ({
              name: color.color,
            })),
          },
          sizes: {
            create: product.sizes.map((size) => ({
              size: size.size,
              price: size.price,
              quantity: size.quantity,
              discount: size.discount,
            })),
          },
          specs: {
            create: validVariantSpecs.map((spec) => ({
              name: spec.name,
              value: spec.value,
            })),
          },
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ],
    },
    shippingFeeMethod: product.shippingFeeMethod,
    freeShippingForAllCountries: product.freeShippingForAllCountries,
    freeShipping: product.freeShippingForAllCountries
      ? undefined
      : product.freeShippingCountriesIds &&
        product.freeShippingCountriesIds.length > 0
      ? {
          create: {
            eligibaleCountries: {
              create: product.freeShippingCountriesIds.map((country) => ({
                country: { connect: { id: country.value } },
              })),
            },
          },
        }
      : undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_product = await db.product.create({ data: productData });
  return new_product;
};

const handleCreateVariant = async (product: ProductWithVariantType) => {
  const variantSlug = await generateUniqueSlug(
    slugify(product.variantName || product.name, {
      replacement: "-",
      lower: true,
      trim: true,
    }),
    "productVariant"
  );

  const variantData = {
    id: product.variantId,
    productId: product.productId,
    variantName: product.variantName,
    variantDescription: product.variantDescription,
    slug: variantSlug,
    isSale: product.isSale,
    saleEndDate: product.isSale ? product.saleEndDate : "",
    sku: product.sku,
    keywords: product.keywords.join(","),
    weight: product.weight,
    variantImage: product.variantImage,
    images: {
      create: product.images.map((img) => ({
        url: img.url,
      })),
    },
    colors: {
      create: product.colors.map((color) => ({
        name: color.color,
      })),
    },
    sizes: {
      create: product.sizes.map((size) => ({
        size: size.size,
        price: size.price,
        quantity: size.quantity,
        discount: size.discount,
      })),
    },
    specs: {
      create: (product.variant_specs || []).map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  const new_variant = await db.productVariant.create({ data: variantData });
  return new_variant;
};

export const getProductVariant = async (
  productId: string,
  variantId: string
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getProductVariant, {
      productId,
      variantId,
    });
  }

  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      subCategory: true,
      variants: {
        where: {
          id: variantId,
        },
        include: {
          images: true,
          colors: {
            select: {
              name: true,
            },
          },
          sizes: {
            select: {
              size: true,
              quantity: true,
              price: true,
              discount: true,
            },
          },
        },
      },
    },
  });
  if (!product) return;
  return {
    productId: product?.id,
    variantId: product?.variants[0].id,
    name: product.name,
    description: product?.description,
    variantName: product.variants[0].variantName,
    variantDescription: product.variants[0].variantDescription,
    images: product.variants[0].images,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    isSale: product.variants[0].isSale,
    brand: product.brand,
    sku: product.variants[0].sku,
    colors: product.variants[0].colors,
    sizes: product.variants[0].sizes,
    keywords: product.variants[0].keywords.split(","),
  };
};

export const getProductMainInfo = async (productId: string) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getProductMainInfo, { productId });
  }

  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      questions: true,
      specs: true,
    },
  });
  if (!product) return null;

  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    offerTagId: product.offerTagId || undefined,
    storeId: product.storeId,
    shippingFeeMethod: product.shippingFeeMethod,
    questions: product.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    })),
    product_specs: product.specs.map((spec) => ({
      name: spec.name,
      value: spec.value,
    })),
  };
};

export const getAllStoreProducts = async (storeUrl: string) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getAllStoreProducts, { storeUrl });
  }

  const store = await db.store.findFirst({
    where: {
      url: {
        equals: storeUrl,
        mode: "insensitive",
      },
    },
  });
  if (!store) throw new Error("Please provide a valid store URL.");

  const products = await db.product.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      variants: {
        include: {
          images: { orderBy: { order: "asc" } },
          colors: true,
          sizes: true,
        },
      },
      store: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

  return products;
};

export const deleteProduct = async (productId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");

  await ensureSellerSubscription(user.id);

  if (!productId) throw new Error("Please provide product id.");

  if (isConvexEnabled()) {
    return await convexMutation(api.products.deleteProduct, { productId });
  }

  const response = await db.product.delete({ where: { id: productId } });
  return response;
};

export const getProducts = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any = {},
  sortBy = "",
  page: number = 1,
  pageSize: number = 10
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getProducts, {
      filters,
      sortBy,
      page,
      pageSize,
    });
  }

  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wherClause: any = {
    AND: [{ status: "APPROVED" } as any],
  };

  if (filters.store) {
    const store = await db.store.findFirst({
      where: {
        url: {
          equals: filters.store,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });
    if (store) {
      wherClause.AND.push({ storeId: store.id });
    }
  }

  if (filters.category) {
    const category = await db.category.findUnique({
      where: {
        url: filters.category,
      },
      select: { id: true },
    });
    if (category) {
      wherClause.AND.push({ categoryId: category.id });
    }
  }

  if (filters.subCategory) {
    const subCategory = await db.subCategory.findUnique({
      where: {
        url: filters.subCategory,
      },
      select: { id: true },
    });
    if (subCategory) {
      wherClause.AND.push({ subCategoryId: subCategory.id });
    }
  }

  if (filters.size && Array.isArray(filters.size)) {
    wherClause.AND.push({
      variants: {
        some: {
          sizes: {
            some: {
              size: {
                in: filters.size,
              },
            },
          },
        },
      },
    });
  }

  if (filters.offer) {
    const offer = await db.offerTag.findUnique({
      where: {
        url: filters.offer,
      },
      select: { id: true },
    });
    if (offer) {
      wherClause.AND.push({ offerTagId: offer.id });
    }
  }

  if (filters.search) {
    wherClause.AND.push({
      OR: [
        {
          name: { contains: filters.search },
        },
        {
          description: { contains: filters.search },
        },
        {
          variants: {
            some: {
              variantName: { contains: filters.search },
              variantDescription: { contains: filters.search },
            },
          },
        },
      ],
    });
  }

  let orderBy: Record<string, SortOrder> = {};
  switch (sortBy) {
    case "most-popular":
      orderBy = { views: "desc" };
      break;
    case "new-arrivals":
      orderBy = { createdAt: "desc" };
      break;
    case "top-rated":
      orderBy = { rating: "desc" };
      break;
    default:
      orderBy = { views: "desc" };
  }

  const products = await db.product.findMany({
    where: wherClause,
    orderBy,
    take: limit,
    skip: skip,
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
  });

  type VariantWithSizes = ProductVariant & { sizes: Size[] };

  products.sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getMinPrice = (product: any) =>
      Math.min(
        ...product.variants.flatMap((variant: VariantWithSizes) =>
          variant.sizes.map((size) => {
            const discount = size.discount;
            const discountedPrice = size.price * (1 - discount / 100);
            return discountedPrice;
          })
        ),
        Infinity
      );

    const minPriceA = getMinPrice(a);
    const minPriceB = getMinPrice(b);

    if (sortBy === "price-low-to-high") {
      return minPriceA - minPriceB;
    } else if (sortBy === "price-high-to-low") {
      return minPriceB - minPriceA;
    }

    return 0;
  });

  const productsWithFilteredVariants = products.map((product) => {
    const filteredVariants = product.variants;

    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.images,
      sizes: variant.sizes,
    }));

    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      numReviews: product.numReviews,
      variants,
      variantImages,
    };
  });

  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    products: productsWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
  };
};

export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
  try {
    const user = await currentUser();

    const product = await retrieveProductDetails(productSlug, variantSlug);
    if (!product) return null;

    const userCountry = await getUserCountry();

    const productShippingDetails = await getShippingDetails(
      product.shippingFeeMethod,
      userCountry,
      product.store,
      product.freeShipping
    );

    const storeFollwersCount = await getStoreFollowersCount(product.storeId);

    const isUserFollowingStore = await checkIfUserFollowingStore(
      product.storeId,
      user?.id
    );

    await incrementProductViews(product.id);

    const ratingStatistics = await getRatingStatistics(product.id);

    return formatProductResponse(
      product,
      productShippingDetails,
      storeFollwersCount,
      isUserFollowingStore,
      ratingStatistics
    );
  } catch (error) {
    console.error("Error in getProductPageData:", error);
    return null;
  }
};

export const retrieveProductDetails = async (
  productSlug: string,
  variantSlug: string
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.retrieveProductDetails, {
      productSlug,
      variantSlug,
    });
  }

  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      status: "APPROVED",
    } as any,
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      store: true,
      specs: true,
      questions: true,
      reviews: {
        include: {
          images: true,
          user: true,
        },
        take: 4,
      },
      freeShipping: {
        include: {
          eligibaleCountries: true,
        },
      },
      variants: {
        where: {
          slug: variantSlug,
        },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
    },
  });

  if (!product) return null;
  const variantsInfo = await db.productVariant.findMany({
    where: {
      productId: product.id,
    },
    include: {
      images: true,
      sizes: true,
      colors: true,
      product: {
        select: { slug: true },
      },
    },
  });

  return {
    ...product,
    variantsInfo: variantsInfo.map((variant) => ({
      variantName: variant.variantName,
      variantSlug: variant.slug,
      variantImage: variant.variantImage,
      variantUrl: `/product/${productSlug}/${variant.slug}`,
      images: variant.images,
      sizes: variant.sizes,
      colors: variant.colors,
    })),
  };
};

const getUserCountry = async () => {
  const userCountryCookie = (await getCookie("userCountry", { cookies })) || "";
  const defaultCountry = { name: "South Africa", code: "ZA", city: "Johannesburg" };

  try {
    const parsedCountry = JSON.parse(userCountryCookie);
    if (
      parsedCountry &&
      typeof parsedCountry === "object" &&
      "name" in parsedCountry &&
      "code" in parsedCountry
    ) {
      return {
        name: parsedCountry.name,
        code: parsedCountry.code,
        city: parsedCountry.city || "",
      };
    }
    return defaultCountry;
  } catch (error) {
    console.error("Failed to parse userCountryCookie", error);
    return defaultCountry;
  }
};

const formatProductResponse = (
  product: ProductPageType,
  shippingDetails: ProductShippingDetailsType,
  storeFollwersCount: number,
  isUserFollowingStore: boolean,
  ratingStatistics: RatingStatisticsType
) => {
  if (!product) return;
  const variant = product.variants[0];
  const { store, category, subCategory, offerTag, questions, reviews } =
    product;
  const { images, colors, sizes } = variant;

  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    variantSlug: variant.slug,
    name: product.name,
    description: product.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images,
    category,
    subCategory,
    offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    brand: product.brand,
    sku: variant.sku,
    weight: variant.weight,
    variantImage: variant.variantImage,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: storeFollwersCount,
      isUserFollowingStore,
    },
    colors,
    sizes,
    specs: {
      product: product.specs,
      variant: variant.specs,
    },
    questions,
    rating: product.rating,
    reviews,
    reviewsStatistics: ratingStatistics,
    shippingDetails,
    relatedProducts: [],
    variantInfo: product.variantsInfo,
  };
};

const getStoreFollowersCount = async (storeId: string) => {
  if (isConvexEnabled()) return 0;

  const storeFollwersCount = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  return storeFollwersCount?._count.followers || 0;
};

const checkIfUserFollowingStore = async (
  storeId: string,
  userId: string | undefined
) => {
  if (isConvexEnabled()) return false;

  let isUserFollowingStore = false;
  if (userId) {
    const storeFollowersInfo = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        followers: {
          where: {
            id: userId,
          },
          select: { id: true },
        },
      },
    });
    if (storeFollowersInfo && storeFollowersInfo.followers.length > 0) {
      isUserFollowingStore = true;
    }
  }

  return isUserFollowingStore;
};

export const getRatingStatistics = async (productId: string) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getRatingStatistics, { productId });
  }

  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: {
      rating: true,
    },
  });
  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  );

  const ratingCounts = Array(5).fill(0);

  ratingStats.forEach((stat) => {
    const rating = Math.floor(stat.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = stat._count.rating;
    }
  });

  return {
    ratingStatistics: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    })),
    reviewsWithImagesCount: await db.review.count({
      where: {
        productId,
        images: { some: {} },
      },
    }),
    totalReviews,
  };
};

export const getShippingDetails = async (
  shippingFeeMethod: string,
  userCountry: { name: string; code: string; city: string },
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null
) => {
  let shippingDetails = {
    shippingFeeMethod,
    shippingService: store?.defaultShippingService || "",
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: store?.defaultDeliveryTimeMin || 0,
    deliveryTimeMax: store?.defaultDeliveryTimeMax || 0,
    returnPolicy: store?.returnPolicy || "",
    countryCode: userCountry.code,
    countryName: userCountry.name,
    city: userCountry.city,
    isFreeShipping: false,
  };

  if (isConvexEnabled()) {
    return shippingDetails;
  }

  const country = await db.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  });

  if (country) {
    const shippingRate = await db.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    });

    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService;
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
    const shippingFeeForAdditionalItem =
      shippingRate?.shippingFeeForAdditionalItem ||
      store.defaultShippingFeeForAdditionalItem;
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;

    shippingDetails = {
      shippingFeeMethod,
      shippingService: shippingService,
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      countryCode: userCountry.code,
      countryName: userCountry.name,
      city: userCountry.city,
      isFreeShipping: false,
    };

    switch (shippingFeeMethod) {
      case "ITEM":
        shippingDetails.shippingFee = shippingFeePerItem;
        shippingDetails.extraShippingFee = shippingFeeForAdditionalItem;
        break;

      case "WEIGHT":
        shippingDetails.shippingFee = shippingFeePerKg;
        break;

      case "FIXED":
        shippingDetails.shippingFee = shippingFeeFixed;
        break;

      default:
        break;
    }

    return shippingDetails;
  }

  return shippingDetails;
};

export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: "latest" | "oldest" | "highest" } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getProductFilteredReviews, {
      productId,
      filters,
      sort,
      page,
      pageSize,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewFilter: any = {
    productId,
  };

  if (filters.rating) {
    const rating = filters.rating;
    reviewFilter.rating = {
      in: [rating, rating + 0.5],
    };
  }

  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    };
  }

  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === "latest"
      ? { createdAt: "desc" }
      : sort && sort.orderBy === "oldest"
      ? { createdAt: "asc" }
      : { rating: "desc" };

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const reviews = await db.review.findMany({
    where: reviewFilter,
    include: {
      images: true,
      user: true,
    },
    orderBy: sortOption,
    skip,
    take,
  });

  return reviews;
};

export const getDeliveryDetailsForStoreByCountry = async (
  storeId: string,
  countryId: string
) => {
  if (isConvexEnabled()) {
    return {
      shippingService: "International Delivery",
      deliveryTimeMin: 7,
      deliveryTimeMax: 15,
    };
  }

  const shippingRate = await db.shippingRate.findFirst({
    where: {
      countryId,
      storeId,
    },
  });

  let storeDetails;
  if (!shippingRate) {
    storeDetails = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        defaultShippingService: true,
        defaultDeliveryTimeMin: true,
        defaultDeliveryTimeMax: true,
      },
    });
  }

  const shippingService = shippingRate
    ? shippingRate.shippingService
    : storeDetails?.defaultShippingService;

  const deliveryTimeMin = shippingRate
    ? shippingRate.deliveryTimeMin
    : storeDetails?.defaultDeliveryTimeMin;

  const deliveryTimeMax = shippingRate
    ? shippingRate.deliveryTimeMax
    : storeDetails?.defaultDeliveryTimeMax;

  return {
    shippingService,
    deliveryTimeMin,
    deliveryTimeMax,
  };
};

export const getProductShippingFee = async (
  shippingFeeMethod: string,
  userCountry: Country,
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null,
  weight: number,
  quantity: number
) => {
  if (isConvexEnabled()) {
    return store?.defaultShippingFeeFixed || 0;
  }

  const country = await db.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  });

  if (country) {
    const shippingRate = await db.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    });

    const {
      shippingFeePerItem = store.defaultShippingFeePerItem,
      shippingFeeForAdditionalItem = store.defaultShippingFeeForAdditionalItem,
      shippingFeePerKg = store.defaultShippingFeePerKg,
      shippingFeeFixed = store.defaultShippingFeeFixed,
    } = shippingRate || {};

    const additionalItemsQty = quantity - 1;

    const feeCalculators: Record<string, () => number> = {
      ITEM: () =>
        shippingFeePerItem + shippingFeeForAdditionalItem * additionalItemsQty,
      WEIGHT: () => shippingFeePerKg * weight * quantity,
      FIXED: () => shippingFeeFixed,
    };

    const calculateFee = feeCalculators[shippingFeeMethod];
    if (calculateFee) {
      return calculateFee();
    }

    return 0;
  }

  return 0;
};

export const getProductsByIds = async (
  ids: string[],
  page: number = 1,
  pageSize: number = 10
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ products: any; totalPages: number }> => {
  if (!ids || ids.length === 0) {
    throw new Error("Ids are undefined");
  }

  if (isConvexEnabled()) {
    return await convexQuery(api.products.getProductsByIds, {
      ids,
      page,
      pageSize,
    });
  }

  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  try {
    const variants = await db.productVariant.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        variantName: true,
        slug: true,
        images: {
          select: {
            url: true,
          },
        },
        sizes: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            rating: true,
            sales: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });

    const new_products = variants.map((variant) => ({
      id: variant.product.id,
      slug: variant.product.slug,
      name: variant.product.name,
      rating: variant.product.rating,
      sales: variant.product.sales,
      variants: [
        {
          variantId: variant.id,
          variantName: variant.variantName,
          variantSlug: variant.slug,
          images: variant.images,
          sizes: variant.sizes,
        },
      ],
      variantImages: [],
    }));

    const ordered_products = ids
      .map((id) =>
        new_products.find((product) => product.variants[0].variantId === id)
      )
      .filter(Boolean);

    const allProducts = await db.productVariant.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const totalPages = Math.ceil(allProducts / pageSize);

    return {
      products: ordered_products,
      totalPages,
    };
  } catch (error) {
    console.error("Error retrieving products by ids:", error);
    throw new Error("Failed to fetch products. Please try again.");
  }
};

const incrementProductViews = async (productId: string) => {
  if (isConvexEnabled()) return;

  const isProductAlreadyViewed = getCookie(`viewedProduct_${productId}`, {
    cookies,
  });

  if (!isProductAlreadyViewed) {
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }
};
