"use server";

import { db } from "@/lib/db";
import { api, convexQuery, isConvexEnabled } from "@/lib/convex";
import { VariantSimplified, VariantImageType } from "@/lib/types";
import seedrandom from "seedrandom";
import { unstable_cache } from "next/cache";

const sponsoredImpressions = new Map<string, number>();
const sessionSponsoredHistory = new Map<string, Map<string, number>>();

setInterval(() => {
  // Periodic session cleanup
}, 1000 * 60 * 60);

const getAllProductIds = unstable_cache(
  async () => {
    return await db.product.findMany({
      where: { status: "APPROVED" },
      select: { id: true },
      orderBy: { createdAt: "desc" }
    });
  },
  ["all-product-ids"],
  { revalidate: 3600, tags: ["products"] }
);

export const getRandomizedProducts = async (
  options: {
    sessionId: string;
    limit?: number;
    page?: number;
  }
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getRandomizedProducts, options);
  }

  const { sessionId, limit = 20, page = 1 } = options;
  const skip = (page - 1) * limit;

  const allProductIds = await getAllProductIds();
  const rng = seedrandom(sessionId);

  const shuffledIds = [...allProductIds];
  for (let i = shuffledIds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
  }

  const pagedIds = shuffledIds.slice(skip, skip + limit).map(p => p.id);

  if (pagedIds.length === 0) {
    return {
      products: [],
      totalPages: Math.ceil(allProductIds.length / limit),
      currentPage: page,
      totalCount: allProductIds.length,
    };
  }

  const products = await db.product.findMany({
    where: {
      id: { in: pagedIds },
      status: "APPROVED"
    },
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

  const productsMap = new Map(products.map(p => [p.id, p]));
  const orderedProducts = pagedIds
    .map(id => productsMap.get(id))
    .filter((p): p is typeof products[0] => !!p);

  const formattedProducts = orderedProducts.map(transformProduct);

  return {
    products: formattedProducts,
    totalPages: Math.ceil(allProductIds.length / limit),
    currentPage: page,
    totalCount: allProductIds.length,
  };
};

const getSponsoredCandidates = unstable_cache(
  async () => {
    const sponsoredTag = await db.offerTag.findFirst({
      where: { name: { contains: "Sponsored", mode: "insensitive" } }
    });

    if (!sponsoredTag) return [];

    return await db.product.findMany({
      where: {
        offerTagId: sponsoredTag.id,
        status: "APPROVED"
      },
      include: {
        variants: {
          include: { images: true, sizes: true, colors: true }
        }
      }
    });
  },
  ["sponsored-products-candidates"],
  { revalidate: 300, tags: ["products", "sponsored"] }
);

export const getFairSponsoredProducts = async (
  options: {
    sessionId: string;
    limit?: number;
  }
) => {
  if (isConvexEnabled()) {
    return await convexQuery(api.products.getFairSponsoredProducts, options);
  }

  const { sessionId, limit = 6 } = options;

  const sponsoredProducts = await getSponsoredCandidates();
  if (sponsoredProducts.length === 0) return [];

  const productsWithScore = sponsoredProducts.map(product => {
    const globalImpressions = sponsoredImpressions.get(product.id) || 0;
    return {
      product,
      score: globalImpressions + Math.random()
    };
  });

  productsWithScore.sort((a, b) => a.score - b.score);
  const selected = productsWithScore.slice(0, limit);

  const now = Date.now();
  let sessionHistory = sessionSponsoredHistory.get(sessionId);
  if (!sessionHistory) {
    sessionHistory = new Map();
    sessionSponsoredHistory.set(sessionId, sessionHistory);
  }

  selected.forEach(({ product }) => {
    const current = sponsoredImpressions.get(product.id) || 0;
    sponsoredImpressions.set(product.id, current + 1);
    sessionHistory!.set(product.id, now);
  });

  return selected.map(p => transformProduct(p.product));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(product: any) {
  const filteredVariants = product.variants;

  const variants: VariantSimplified[] = filteredVariants.map((variant: any) => ({
    variantId: variant.id,
    variantSlug: variant.slug,
    variantName: variant.variantName,
    images: variant.images,
    sizes: variant.sizes,
  }));

  const variantImages: VariantImageType[] = filteredVariants.map(
    (variant: any) => ({
      url: `/product/${product.slug}/${variant.slug}`,
      image: variant.variantImage
        ? variant.variantImage
        : variant.images[0]?.url,
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
}
