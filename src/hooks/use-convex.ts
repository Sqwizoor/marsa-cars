"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export { api, useQuery, useMutation };

// ==================== CATEGORIES & SUBCATEGORIES HOOKS ====================
export const useCategories = () => useQuery(api.categories.getAllCategories, {});
export const useHomeFeaturedCategories = () =>
  useQuery(api.categories.getHomeFeaturedCategories, {});
export const useSubCategories = () =>
  useQuery(api.subCategories.getAllSubCategories, {});
export const useOfferTags = (storeUrl?: string) =>
  useQuery(api.offerTags.getAllOfferTags, { storeUrl });

// ==================== PRODUCTS HOOKS ====================
export const useProducts = (
  filters?: any,
  sortBy?: string,
  page?: number,
  pageSize?: number
) =>
  useQuery(api.products.getProducts, {
    filters,
    sortBy,
    page,
    pageSize,
  });

export const useProductDetails = (productSlug: string, variantSlug?: string) =>
  useQuery(api.products.retrieveProductDetails, { productSlug, variantSlug });

export const useStoreProducts = (storeUrl: string) =>
  useQuery(api.products.getAllStoreProducts, { storeUrl });

// ==================== CARS MARKETPLACE HOOKS ====================
export const useCarListings = (
  filters: Record<string, any> = {},
  page = 1,
  limit = 20
) => useQuery(api.cars.getCarListings, { ...filters, page, limit });

export const useFeaturedCars = (limit = 8) =>
  useQuery(api.cars.getFeaturedCars, { limit });

export const useSponsoredCars = (sessionId?: string, limit = 8) =>
  useQuery(api.cars.getSponsoredCars, { sessionId, limit });

export const useCarListingBySlug = (slug: string) =>
  useQuery(api.cars.getCarListingBySlug, { slug });

// ==================== ARTICLES & FORUM HOOKS ====================
export const useLatestArticles = (limit = 4) =>
  useQuery(api.articles.getLatestArticles, { limit });

export const useAllArticles = (page = 1, limit = 12, search?: string) =>
  useQuery(api.articles.getAllArticles, { page, limit, search });

export const useForumCategories = () =>
  useQuery(api.forum.getForumCategories, {});

export const useForumThreads = (args: {
  categoryId?: string;
  subforumId?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
}) => useQuery(api.forum.getThreads, args);

// ==================== ADMIN & PART REQUESTS HOOKS ====================
export const useAdminDashboardStats = () =>
  useQuery(api.admin.getAdminDashboardStats, {});

export const usePartRequests = () =>
  useQuery(api.partRequests.getPartRequests, {});

export const useSubmitPartRequest = () =>
  useMutation(api.partRequests.submitPartRequest);

// ==================== BOB GO TRACKING HOOKS ====================
export const useTrackingByReference = (trackingReference: string) =>
  useQuery(
    api.tracking.getTrackingByReference,
    trackingReference ? { trackingReference } : "skip"
  );

export const useOrderTrackings = (orderId: string) =>
  useQuery(api.tracking.getTrackingsByOrder, orderId ? { orderId } : "skip");
