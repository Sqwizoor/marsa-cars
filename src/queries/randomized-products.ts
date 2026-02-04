
"use server";

import { db } from "@/lib/db";
import { ProductWithVariantType, VariantSimplified, VariantImageType, SortOrder } from "@/lib/types";
import { Product, ProductVariant, Store, Size } from "@prisma/client";
import seedrandom from "seedrandom";
import { unstable_cache } from "next/cache";

// In-memory tracking for sponsored fairness
// Map<productId, impressionCount>
// Reset every 24 hours or when server restarts (simplest for now)
const sponsoredImpressions = new Map<string, number>();

// Track when a sponsored item was last shown to a specific session
// Map<sessionId, Map<productId, timestamp>>
const sessionSponsoredHistory = new Map<string, Map<string, number>>();

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, history] of sessionSponsoredHistory.entries()) {
    // If session tracking is older than 24 hours, maybe clear it? 
    // For now, let's just clear extremely old interaction data
    // This is a simple in-memory implementation for Phase 1
  }
}, 1000 * 60 * 60);

// Cached fetch to get all active product IDs
const getAllProductIds = unstable_cache(
  async () => {
    return await db.product.findMany({
      where: { status: "APPROVED" },
      select: { id: true },
      orderBy: { createdAt: "desc" }
    });
  },
  ['all-product-ids'],
  { revalidate: 3600, tags: ['products'] } // 1 hour cache
);

export const getRandomizedProducts = async (
  options: {
    sessionId: string;
    limit?: number;
    page?: number;
  }
) => {
  const { sessionId, limit = 20, page = 1 } = options;
  const skip = (page - 1) * limit;

  // 1. Fetch ALL active products (Cached)
  const allProductIds = await getAllProductIds();

  // 2. Shuffle IDs using session ID + page as seed? 
  // No, we want consistent order across pages. So seed with just Session ID.
  const rng = seedrandom(sessionId);
  
  // Fisher-Yates shuffle with seeded Random
  const shuffledIds = [...allProductIds];
  for (let i = shuffledIds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
  }

  // 3. Slice for pagination
  const pagedIds = shuffledIds.slice(skip, skip + limit).map(p => p.id);

  if (pagedIds.length === 0) {
    return {
      products: [],
      totalPages: Math.ceil(allProductIds.length / limit),
      currentPage: page,
      totalCount: allProductIds.length,
    };
  }

  // 4. Fetch full product details for the paged IDs
  // We need to maintain the shuffled order! database 'in' clause doesn't guarantee order.
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

  // Sort products back to match the pagedIds order
  const productsMap = new Map(products.map(p => [p.id, p]));
  const orderedProducts = pagedIds
    .map(id => productsMap.get(id))
    .filter((p): p is typeof products[0] => !!p);

  // Transform to display format
  const formattedProducts = orderedProducts.map(transformProduct);

  return {
    products: formattedProducts,
    totalPages: Math.ceil(allProductIds.length / limit),
    currentPage: page,
    totalCount: allProductIds.length,
  };
};

// Cached fetch for sponsored candidates
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
  ['sponsored-products-candidates'],
  { revalidate: 300, tags: ['products', 'sponsored'] } // 5 mins
);

export const getFairSponsoredProducts = async (
  options: {
    sessionId: string;
    limit?: number;
  }
) => {
  const { sessionId, limit = 6 } = options;

  // 1. Fetch all active sponsored products candidates (Cached)
  const sponsoredProducts = await getSponsoredCandidates();

  if (sponsoredProducts.length === 0) return [];

  // 2. Filter/Sort by fairness
  const productsWithScore = sponsoredProducts.map(product => {
    const globalImpressions = sponsoredImpressions.get(product.id) || 0;
    
    // Check if shown to this session recently?
    // const sessionHistory = sessionSponsoredHistory.get(sessionId);
    // const lastShown = sessionHistory?.get(product.id) || 0;
    // const timeSinceShown = Date.now() - lastShown;
    
    // Score: Lower is better (more likely to show)
    // Primary factor: Global impressions (balance the load)
    // Secondary factor: Randomness (don't always show exactly same order to everyone who comes in at same time)
    return {
      product,
      score: globalImpressions + Math.random() // Add slight jitter
    };
  });

  // Sort by score (ascending -> least shown first)
  productsWithScore.sort((a, b) => a.score - b.score);

  // Take top N
  const selected = productsWithScore.slice(0, limit);

  // 3. Record impressions (Optimistic update)
  const now = Date.now();
  let sessionHistory = sessionSponsoredHistory.get(sessionId);
  if (!sessionHistory) {
    sessionHistory = new Map();
    sessionSponsoredHistory.set(sessionId, sessionHistory);
  }

  selected.forEach(({ product }) => {
    // Update global
    const current = sponsoredImpressions.get(product.id) || 0;
    sponsoredImpressions.set(product.id, current + 1);

    // Update session
    sessionHistory!.set(product.id, now);
  });

  return selected.map(p => transformProduct(p.product));
};

// Helper: Transform DB product to UI product
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
