/* eslint-disable */
/**
 * Generated `api` utility for referencing Convex functions.
 * This file will be automatically updated when running `npx convex dev`.
 */
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi } from "convex/server";
import type * as admin from "../admin.js";
import type * as advertisements from "../advertisements.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as cars from "../cars.js";
import type * as categories from "../categories.js";
import type * as coupons from "../coupons.js";
import type * as forum from "../forum.js";
import type * as migration from "../migration.js";
import type * as offerTags from "../offerTags.js";
import type * as orders from "../orders.js";
import type * as partRequests from "../partRequests.js";
import type * as products from "../products.js";
import type * as stores from "../stores.js";
import type * as subCategories from "../subCategories.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tracking from "../tracking.js";
import type * as users from "../users.js";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  advertisements: typeof advertisements;
  analytics: typeof analytics;
  articles: typeof articles;
  cars: typeof cars;
  categories: typeof categories;
  coupons: typeof coupons;
  forum: typeof forum;
  migration: typeof migration;
  offerTags: typeof offerTags;
  orders: typeof orders;
  partRequests: typeof partRequests;
  products: typeof products;
  stores: typeof stores;
  subCategories: typeof subCategories;
  subscriptions: typeof subscriptions;
  tracking: typeof tracking;
  users: typeof users;
}>;

export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;
