import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { findById, generateUuid, toPrismaShape } from "./_helpers";
import {
  shippingFeeMethodValidator,
  productApprovalStatusValidator,
} from "./schema";

async function enrichVariant(ctx: any, variant: any) {
  const images = await ctx.db
    .query("productVariantImages")
    .withIndex("by_variant_id", (q: any) =>
      q.eq("productVariantId", variant.prismaId)
    )
    .collect();
  images.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  const sizes = await ctx.db
    .query("sizes")
    .withIndex("by_variant_id", (q: any) =>
      q.eq("productVariantId", variant.prismaId)
    )
    .collect();

  const colors = await ctx.db
    .query("colors")
    .withIndex("by_variant_id", (q: any) =>
      q.eq("productVariantId", variant.prismaId)
    )
    .collect();

  const specs = await ctx.db
    .query("specs")
    .withIndex("by_variant_id", (q: any) => q.eq("variantId", variant.prismaId))
    .collect();

  return {
    ...toPrismaShape(variant)!,
    images: images.map((i: any) => toPrismaShape(i)!),
    sizes: sizes.map((s: any) => toPrismaShape(s)!),
    colors: colors.map((c: any) => toPrismaShape(c)!),
    specs: specs.map((sp: any) => toPrismaShape(sp)!),
  };
}

async function enrichProductFull(ctx: any, product: any) {
  const category = await findById(ctx, "categories", product.categoryId);
  const subCategory = await findById(
    ctx,
    "subCategories",
    product.subCategoryId
  );
  const offerTag = product.offerTagId
    ? await findById(ctx, "offerTags", product.offerTagId)
    : null;
  const store = await findById(ctx, "stores", product.storeId);

  const variantsRaw = await ctx.db
    .query("productVariants")
    .withIndex("by_product_id", (q: any) => q.eq("productId", product.prismaId))
    .collect();

  const variants = await Promise.all(
    variantsRaw.map((v: any) => enrichVariant(ctx, v))
  );

  const specs = await ctx.db
    .query("specs")
    .withIndex("by_product_id", (q: any) => q.eq("productId", product.prismaId))
    .collect();

  const questions = await ctx.db
    .query("questions")
    .withIndex("by_product_id", (q: any) => q.eq("productId", product.prismaId))
    .collect();

  const freeShippingDoc = await ctx.db
    .query("freeShippings")
    .withIndex("by_product_id", (q: any) => q.eq("productId", product.prismaId))
    .first();

  let freeShipping: any = null;
  if (freeShippingDoc) {
    const eligible = await ctx.db
      .query("freeShippingCountries")
      .withIndex("by_free_shipping_id", (q: any) =>
        q.eq("freeShippingId", freeShippingDoc.prismaId)
      )
      .collect();
    const withCountries = await Promise.all(
      eligible.map(async (ec: any) => {
        const country = await findById(ctx, "countries", ec.countryId);
        return {
          ...toPrismaShape(ec)!,
          country: toPrismaShape(country),
        };
      })
    );
    freeShipping = {
      ...toPrismaShape(freeShippingDoc)!,
      eligibaleCountries: withCountries,
    };
  }

  return {
    ...toPrismaShape(product)!,
    category: toPrismaShape(category),
    subCategory: toPrismaShape(subCategory),
    offerTag: toPrismaShape(offerTag),
    store: toPrismaShape(store),
    variants,
    specs: specs.map((sp: any) => toPrismaShape(sp)!),
    questions: questions.map((q: any) => toPrismaShape(q)!),
    freeShipping,
  };
}

// ==================== PRODUCT CRUD ====================

export const upsertProduct = mutation({
  args: {
    storeUrl: v.string(),
    product: v.any(),
  },
  handler: async (ctx, { storeUrl, product }) => {
    const now = Date.now();
    const storeUrlNorm = storeUrl.trim().toLowerCase();
    const allStores = await ctx.db.query("stores").collect();
    const store = allStores.find((s) => s.url.toLowerCase() === storeUrlNorm);
    if (!store) throw new Error("Store not found.");

    const productId = product.productId || generateUuid();
    const variantId = product.variantId || generateUuid();

    const existingProduct = await findById(ctx, "products", productId);
    const existingVariant = await findById(ctx, "productVariants", variantId);

    const makeSlug = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (existingProduct) {
      await ctx.db.patch(existingProduct._id, {
        name: product.name,
        description: product.description,
        brand: product.brand,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        offerTagId: product.offerTagId || undefined,
        shippingFeeMethod: product.shippingFeeMethod || "ITEM",
        freeShippingForAllCountries: !!product.freeShippingForAllCountries,
        updatedAt: now,
      });

      // Replace product specs & questions
      const oldSpecs = await ctx.db
        .query("specs")
        .withIndex("by_product_id", (q) => q.eq("productId", productId))
        .collect();
      for (const sp of oldSpecs) await ctx.db.delete(sp._id);

      for (const sp of product.product_specs || []) {
        if (sp.name?.trim() && sp.value?.trim()) {
          await ctx.db.insert("specs", {
            prismaId: generateUuid(),
            name: sp.name,
            value: sp.value,
            productId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      const oldQuestions = await ctx.db
        .query("questions")
        .withIndex("by_product_id", (q) => q.eq("productId", productId))
        .collect();
      for (const q of oldQuestions) await ctx.db.delete(q._id);

      for (const q of product.questions || []) {
        if (q.question?.trim() && q.answer?.trim()) {
          await ctx.db.insert("questions", {
            prismaId: generateUuid(),
            question: q.question,
            answer: q.answer,
            productId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } else {
      const productSlug = `${makeSlug(product.name)}-${now.toString(36).slice(-4)}`;
      await ctx.db.insert("products", {
        prismaId: productId,
        name: product.name,
        description: product.description,
        slug: productSlug,
        brand: product.brand || "",
        rating: 0,
        sales: 0,
        numReviews: 0,
        shippingFeeMethod: product.shippingFeeMethod || "ITEM",
        views: 0,
        freeShippingForAllCountries: !!product.freeShippingForAllCountries,
        storeId: store.prismaId,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        offerTagId: product.offerTagId || undefined,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      });

      for (const sp of product.product_specs || []) {
        if (sp.name?.trim() && sp.value?.trim()) {
          await ctx.db.insert("specs", {
            prismaId: generateUuid(),
            name: sp.name,
            value: sp.value,
            productId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      for (const q of product.questions || []) {
        if (q.question?.trim() && q.answer?.trim()) {
          await ctx.db.insert("questions", {
            prismaId: generateUuid(),
            question: q.question,
            answer: q.answer,
            productId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      if (
        !product.freeShippingForAllCountries &&
        Array.isArray(product.freeShippingCountriesIds) &&
        product.freeShippingCountriesIds.length > 0
      ) {
        const fsId = generateUuid();
        await ctx.db.insert("freeShippings", {
          prismaId: fsId,
          productId,
          createdAt: now,
          updatedAt: now,
        });
        for (const c of product.freeShippingCountriesIds) {
          await ctx.db.insert("freeShippingCountries", {
            prismaId: generateUuid(),
            freeShippingId: fsId,
            countryId: c.value || c,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // Handle variant create or update
    const keywordsStr = Array.isArray(product.keywords)
      ? product.keywords.join(",")
      : product.keywords || "";

    if (existingVariant) {
      await ctx.db.patch(existingVariant._id, {
        variantName: product.variantName,
        variantDescription: product.variantDescription,
        variantImage: product.variantImage,
        sku: product.sku,
        weight: Number(product.weight) || 0,
        isSale: !!product.isSale,
        saleEndDate: product.saleEndDate,
        keywords: keywordsStr,
        updatedAt: now,
      });

      const oldImgs = await ctx.db
        .query("productVariantImages")
        .withIndex("by_variant_id", (q) => q.eq("productVariantId", variantId))
        .collect();
      for (const img of oldImgs) await ctx.db.delete(img._id);

      const oldColors = await ctx.db
        .query("colors")
        .withIndex("by_variant_id", (q) => q.eq("productVariantId", variantId))
        .collect();
      for (const c of oldColors) await ctx.db.delete(c._id);

      const oldSizes = await ctx.db
        .query("sizes")
        .withIndex("by_variant_id", (q) => q.eq("productVariantId", variantId))
        .collect();
      for (const s of oldSizes) await ctx.db.delete(s._id);

      const oldVSpecs = await ctx.db
        .query("specs")
        .withIndex("by_variant_id", (q) => q.eq("variantId", variantId))
        .collect();
      for (const sp of oldVSpecs) await ctx.db.delete(sp._id);
    } else {
      const variantSlug = `${makeSlug(product.variantName || product.name)}-${now.toString(36).slice(-4)}`;
      await ctx.db.insert("productVariants", {
        prismaId: variantId,
        productId,
        variantName: product.variantName,
        variantDescription: product.variantDescription,
        variantImage: product.variantImage,
        slug: variantSlug,
        isSale: !!product.isSale,
        saleEndDate: product.saleEndDate,
        sku: product.sku || "",
        keywords: keywordsStr,
        sales: 0,
        weight: Number(product.weight) || 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (let i = 0; i < (product.images || []).length; i++) {
      const img = product.images[i];
      await ctx.db.insert("productVariantImages", {
        prismaId: generateUuid(),
        url: img.url,
        alt: img.alt || "",
        order: i,
        productVariantId: variantId,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const color of product.colors || []) {
      await ctx.db.insert("colors", {
        prismaId: generateUuid(),
        name: color.color || color.name,
        productVariantId: variantId,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const size of product.sizes || []) {
      await ctx.db.insert("sizes", {
        prismaId: size.id || generateUuid(),
        size: size.size,
        price: Number(size.price) || 0,
        quantity: Number(size.quantity) || 0,
        discount: Number(size.discount) || 0,
        productVariantId: variantId,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const sp of product.variant_specs || []) {
      if (sp.name?.trim() && sp.value?.trim()) {
        await ctx.db.insert("specs", {
          prismaId: generateUuid(),
          name: sp.name,
          value: sp.value,
          variantId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { productId, variantId };
  },
});

export const getProductVariant = query({
  args: { productId: v.string(), variantId: v.string() },
  handler: async (ctx, { productId, variantId }) => {
    const product = await findById(ctx, "products", productId);
    if (!product) return null;

    const full = await enrichProductFull(ctx, product);
    const variant =
      full.variants.find((v: any) => v.id === variantId) || full.variants[0];
    if (!variant) return null;

    return {
      productId: full.id,
      variantId: variant.id,
      name: full.name,
      description: full.description,
      variantName: variant.variantName,
      variantDescription: variant.variantDescription,
      images: variant.images,
      variantImage: variant.variantImage,
      categoryId: full.categoryId,
      subCategoryId: full.subCategoryId,
      offerTagId: full.offerTagId,
      isSale: variant.isSale,
      saleEndDate: variant.saleEndDate,
      brand: full.brand,
      sku: variant.sku,
      weight: variant.weight,
      colors: variant.colors.map((c: any) => ({ name: c.name })),
      sizes: variant.sizes.map((s: any) => ({
        size: s.size,
        quantity: s.quantity,
        price: s.price,
        discount: s.discount,
      })),
      keywords: variant.keywords ? variant.keywords.split(",") : [],
      questions: full.questions,
      product_specs: full.specs,
      variant_specs: variant.specs,
      freeShippingForAllCountries: full.freeShippingForAllCountries,
      freeShippingCountriesIds: full.freeShipping?.eligibaleCountries?.map(
        (c: any) => ({
          label: c.country?.name || "",
          value: c.country?.id || c.countryId,
        })
      ),
    };
  },
});

export const getProductMainInfo = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    const product = await findById(ctx, "products", productId);
    if (!product) return null;

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
      .collect();
    const specs = await ctx.db
      .query("specs")
      .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
      .collect();

    return {
      productId: product.prismaId,
      name: product.name,
      description: product.description,
      brand: product.brand,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      offerTagId: product.offerTagId || undefined,
      storeId: product.storeId,
      shippingFeeMethod: product.shippingFeeMethod,
      questions: questions.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
      product_specs: specs.map((sp) => ({
        name: sp.name,
        value: sp.value,
      })),
    };
  },
});

export const getAllStoreProducts = query({
  args: { storeUrl: v.string() },
  handler: async (ctx, { storeUrl }) => {
    const storeUrlNorm = storeUrl.trim().toLowerCase();
    const allStores = await ctx.db.query("stores").collect();
    const store = allStores.find((s) => s.url.toLowerCase() === storeUrlNorm);
    if (!store) throw new Error("Please provide a valid store URL.");

    const products = await ctx.db
      .query("products")
      .withIndex("by_store_id", (q) => q.eq("storeId", store.prismaId))
      .collect();

    return await Promise.all(
      products.map((p) => enrichProductFull(ctx, p))
    );
  },
});

export const deleteProduct = mutation({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    const product = await findById(ctx, "products", productId);
    if (!product) throw new Error("Product not found");

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
      .collect();

    for (const v of variants) {
      const sizes = await ctx.db
        .query("sizes")
        .withIndex("by_variant_id", (q) =>
          q.eq("productVariantId", v.prismaId)
        )
        .collect();
      for (const s of sizes) await ctx.db.delete(s._id);

      const imgs = await ctx.db
        .query("productVariantImages")
        .withIndex("by_variant_id", (q) =>
          q.eq("productVariantId", v.prismaId)
        )
        .collect();
      for (const i of imgs) await ctx.db.delete(i._id);

      const colors = await ctx.db
        .query("colors")
        .withIndex("by_variant_id", (q) =>
          q.eq("productVariantId", v.prismaId)
        )
        .collect();
      for (const c of colors) await ctx.db.delete(c._id);

      await ctx.db.delete(v._id);
    }

    const shape = toPrismaShape(product);
    await ctx.db.delete(product._id);
    return shape;
  },
});

export const updateProductStock = mutation({
  args: { sizeId: v.string(), quantity: v.number() },
  handler: async (ctx, { sizeId, quantity }) => {
    const size = await findById(ctx, "sizes", sizeId);
    if (!size) throw new Error("Size not found");
    await ctx.db.patch(size._id, {
      quantity,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(size._id);
    return toPrismaShape(updated);
  },
});

export const getAdminProducts = query({
  args: { status: v.optional(productApprovalStatusValidator) },
  handler: async (ctx, { status }) => {
    const products = status
      ? await ctx.db
          .query("products")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("products").collect();

    products.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(products.map((p) => enrichProductFull(ctx, p)));
  },
});

export const updateProductStatus = mutation({
  args: {
    productId: v.string(),
    status: productApprovalStatusValidator,
  },
  handler: async (ctx, { productId, status }) => {
    const product = await findById(ctx, "products", productId);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(product._id, {
      status,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(product._id);
    return toPrismaShape(updated);
  },
});

// ==================== BROWSE, SEARCH & HOME PRODUCTS ====================

function transformToUiProduct(product: any) {
  const variants = (product.variants || []).map((variant: any) => ({
    variantId: variant.id,
    variantSlug: variant.slug,
    variantName: variant.variantName,
    variantImage: variant.variantImage,
    images: variant.images || [],
    sizes: variant.sizes || [],
  }));

  const variantImages = variants.map((variant: any) => ({
    url: `/product/${product.slug}/${variant.variantSlug}`,
    image: variant.variantImage
      ? variant.variantImage
      : variant.images[0]?.url || "",
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
  };
}

export const getProducts = query({
  args: {
    filters: v.optional(v.any()),
    sortBy: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { filters = {}, sortBy = "", page = 1, pageSize = 10 }) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "APPROVED"))
      .collect();

    if (filters.category) {
      const cat = await ctx.db
        .query("categories")
        .withIndex("by_url", (q) => q.eq("url", filters.category))
        .first();
      if (cat) {
        products = products.filter((p) => p.categoryId === cat.prismaId);
      } else {
        products = [];
      }
    }

    if (filters.subCategory) {
      const sub = await ctx.db
        .query("subCategories")
        .withIndex("by_url", (q) => q.eq("url", filters.subCategory))
        .first();
      if (sub) {
        products = products.filter((p) => p.subCategoryId === sub.prismaId);
      } else {
        products = [];
      }
    }

    if (filters.store) {
      const st = await ctx.db
        .query("stores")
        .withIndex("by_url", (q) => q.eq("url", filters.store))
        .first();
      if (st) {
        products = products.filter((p) => p.storeId === st.prismaId);
      } else {
        products = [];
      }
    }

    if (filters.offer) {
      const tag = await ctx.db
        .query("offerTags")
        .withIndex("by_url", (q) => q.eq("url", filters.offer))
        .first();
      if (tag) {
        products = products.filter((p) => p.offerTagId === tag.prismaId);
      } else {
        products = [];
      }
    }

    if (filters.search) {
      const q = String(filters.search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    const enriched = await Promise.all(
      products.map((p) => enrichProductFull(ctx, p))
    );

    // Filter by size / price / color if specified
    let filtered = enriched.filter((p) => p.variants.length > 0);

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice ?? 0;
      const max = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
      filtered = filtered.filter((p) =>
        p.variants.some((v: any) =>
          v.sizes.some((s: any) => {
            const discounted = s.price * (1 - (s.discount || 0) / 100);
            return discounted >= min && discounted <= max;
          })
        )
      );
    }

    if (sortBy === "most-popular") {
      filtered.sort((a, b) => b.sales - a.sales);
    } else if (sortBy === "new-arrivals") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "top-rated") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      products: paged.map(transformToUiProduct),
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    };
  },
});

export const getProductsByIds = query({
  args: { ids: v.array(v.string()), page: v.optional(v.number()), pageSize: v.optional(v.number()) },
  handler: async (ctx, { ids, page = 1, pageSize = 10 }) => {
    const found: any[] = [];
    for (const id of ids) {
      const variant = await findById(ctx, "productVariants", id);
      if (variant) {
        const product = await findById(ctx, "products", variant.productId);
        if (product) {
          const full = await enrichProductFull(ctx, product);
          found.push(transformToUiProduct(full));
          continue;
        }
      }
      const product = await findById(ctx, "products", id);
      if (product) {
        const full = await enrichProductFull(ctx, product);
        found.push(transformToUiProduct(full));
      }
    }

    const totalCount = found.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paged = found.slice((page - 1) * pageSize, page * pageSize);

    return {
      products: paged,
      totalPages,
      currentPage: page,
      pageSize,
      totalCount,
    };
  },
});

export const retrieveProductDetails = query({
  args: { productSlug: v.string(), variantSlug: v.optional(v.string()) },
  handler: async (ctx, { productSlug, variantSlug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", productSlug))
      .first();

    if (!product) return null;

    const full = await enrichProductFull(ctx, product);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", product.prismaId))
      .collect();

    const enrichedReviews = await Promise.all(
      reviews.slice(0, 4).map(async (rev) => {
        const user = await findById(ctx, "users", rev.userId);
        const images = await ctx.db
          .query("reviewImages")
          .withIndex("by_review_id", (q) => q.eq("reviewId", rev.prismaId))
          .collect();
        return {
          ...toPrismaShape(rev)!,
          user: toPrismaShape(user),
          images: images.map((i) => toPrismaShape(i)!),
        };
      })
    );

    const storeFollowers = full.store?.followerIds?.length || 0;

    if (variantSlug) {
      const filteredVariants = full.variants.filter(
        (v: any) => v.slug === variantSlug
      );
      return {
        ...full,
        variants: filteredVariants.length > 0 ? filteredVariants : full.variants,
        reviews: enrichedReviews,
        store: full.store
          ? {
              ...full.store,
              _count: { followers: storeFollowers },
            }
          : null,
      };
    }

    return {
      ...full,
      reviews: enrichedReviews,
      store: full.store
        ? {
            ...full.store,
            _count: { followers: storeFollowers },
          }
        : null,
    };
  },
});

export const getRatingStatistics = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .collect();

    const totalReviews = reviews.length;
    const ratingCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let reviewsWithImagesCount = 0;
    for (const r of reviews) {
      const rounded = Math.round(r.rating);
      if (ratingCounts[rounded] !== undefined) {
        ratingCounts[rounded]++;
      }
      const imgs = await ctx.db
        .query("reviewImages")
        .withIndex("by_review_id", (q) => q.eq("reviewId", r.prismaId))
        .collect();
      if (imgs.length > 0) reviewsWithImagesCount++;
    }

    const ratingStatistics = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      numReviews: ratingCounts[rating],
      percentage:
        totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0,
    }));

    return {
      ratingStatistics,
      reviewsWithImagesCount,
      totalReviews,
    };
  },
});

export const getProductFilteredReviews = query({
  args: {
    productId: v.string(),
    filters: v.optional(
      v.object({
        rating: v.optional(v.number()),
        hasImages: v.optional(v.boolean()),
      })
    ),
    sort: v.optional(v.object({ orderBy: v.string() })),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { productId, filters, sort, page = 1, pageSize = 4 }
  ) => {
    let reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .collect();

    if (filters?.rating) {
      const r = filters.rating;
      reviews = reviews.filter(
        (rev) => rev.rating === r || rev.rating === r + 0.5
      );
    }

    const enriched = await Promise.all(
      reviews.map(async (rev) => {
        const user = await findById(ctx, "users", rev.userId);
        const images = await ctx.db
          .query("reviewImages")
          .withIndex("by_review_id", (q) => q.eq("reviewId", rev.prismaId))
          .collect();
        return {
          ...toPrismaShape(rev)!,
          user: toPrismaShape(user),
          images: images.map((i) => toPrismaShape(i)!),
        };
      })
    );

    const afterImageFilter = filters?.hasImages
      ? enriched.filter((r) => r.images.length > 0)
      : enriched;

    if (sort?.orderBy === "highest") {
      afterImageFilter.sort((a, b) => b.rating - a.rating);
    } else if (sort?.orderBy === "lowest") {
      afterImageFilter.sort((a, b) => a.rating - b.rating);
    } else {
      afterImageFilter.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return afterImageFilter.slice((page - 1) * pageSize, page * pageSize);
  },
});

export const upsertReview = mutation({
  args: {
    productId: v.string(),
    userId: v.string(),
    review: v.object({
      id: v.optional(v.string()),
      variant: v.string(),
      review: v.string(),
      rating: v.number(),
      color: v.string(),
      size: v.string(),
      quantity: v.string(),
      images: v.array(v.object({ url: v.string() })),
    }),
  },
  handler: async (ctx, { productId, userId, review }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_product_user", (q) =>
        q.eq("productId", productId).eq("userId", userId)
      )
      .first();

    let reviewPrismaId = existing?.prismaId || review.id || generateUuid();

    if (existing) {
      await ctx.db.patch(existing._id, {
        variant: review.variant,
        review: review.review,
        rating: review.rating,
        color: review.color,
        size: review.size,
        quantity: review.quantity,
        updatedAt: now,
      });

      const oldImgs = await ctx.db
        .query("reviewImages")
        .withIndex("by_review_id", (q) => q.eq("reviewId", reviewPrismaId))
        .collect();
      for (const img of oldImgs) await ctx.db.delete(img._id);
    } else {
      await ctx.db.insert("reviews", {
        prismaId: reviewPrismaId,
        variant: review.variant,
        review: review.review,
        rating: review.rating,
        color: review.color,
        size: review.size,
        quantity: review.quantity,
        likes: 0,
        userId,
        productId,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const img of review.images) {
      await ctx.db.insert("reviewImages", {
        prismaId: generateUuid(),
        url: img.url,
        alt: "",
        reviewId: reviewPrismaId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Recalculate product rating
    const allProductReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", productId))
      .collect();

    const avgRating =
      allProductReviews.length > 0
        ? allProductReviews.reduce((sum, r) => sum + r.rating, 0) /
          allProductReviews.length
        : 0;

    const product = await findById(ctx, "products", productId);
    if (product) {
      await ctx.db.patch(product._id, {
        rating: avgRating,
        numReviews: allProductReviews.length,
        updatedAt: now,
      });
    }

    const saved = await findById(ctx, "reviews", reviewPrismaId);
    const user = await findById(ctx, "users", userId);
    const imgs = await ctx.db
      .query("reviewImages")
      .withIndex("by_review_id", (q) => q.eq("reviewId", reviewPrismaId))
      .collect();

    return {
      ...toPrismaShape(saved)!,
      user: toPrismaShape(user),
      images: imgs.map((i) => toPrismaShape(i)!),
    };
  },
});

export const getFilteredSizes = query({
  args: {
    filters: v.object({
      category: v.optional(v.string()),
      subCategory: v.optional(v.string()),
      offer: v.optional(v.string()),
      storeUrl: v.optional(v.string()),
    }),
    take: v.optional(v.number()),
  },
  handler: async (ctx, { filters, take = 10 }) => {
    const allSizes = await ctx.db.query("sizes").collect();
    const uniqueSizesArray = Array.from(
      new Set(allSizes.slice(0, take * 3).map((s) => s.size))
    ).slice(0, take);

    const sizeOrderMap = new Map(
      ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].map(
        (size, index) => [size, index]
      )
    );
    uniqueSizesArray.sort(
      (a, b) =>
        (sizeOrderMap.get(a) ?? Infinity) - (sizeOrderMap.get(b) ?? Infinity) ||
        a.localeCompare(b)
    );

    return {
      sizes: uniqueSizesArray.map((size) => ({ size })),
      count: allSizes.length,
    };
  },
});

export const getHomeDataDynamic = query({
  args: {
    params: v.array(
      v.object({
        property: v.union(
          v.literal("category"),
          v.literal("subCategory"),
          v.literal("offer")
        ),
        value: v.string(),
        type: v.union(v.literal("simple"), v.literal("full")),
        limit: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { params }) => {
    const result: Record<string, any> = {};

    for (const { property, value, type, limit = 20 } of params) {
      let products: any[] = [];
      if (property === "category") {
        const cat = await ctx.db
          .query("categories")
          .withIndex("by_url", (q) => q.eq("url", value))
          .first();
        if (cat) {
          products = await ctx.db
            .query("products")
            .withIndex("by_category_id", (q) => q.eq("categoryId", cat.prismaId))
            .collect();
        }
      } else if (property === "subCategory") {
        const sub = await ctx.db
          .query("subCategories")
          .withIndex("by_url", (q) => q.eq("url", value))
          .first();
        if (sub) {
          products = await ctx.db
            .query("products")
            .withIndex("by_sub_category_id", (q) =>
              q.eq("subCategoryId", sub.prismaId)
            )
            .collect();
        }
      } else if (property === "offer") {
        const tag = await ctx.db
          .query("offerTags")
          .withIndex("by_url", (q) => q.eq("url", value))
          .first();
        if (tag) {
          products = await ctx.db
            .query("products")
            .withIndex("by_offer_tag_id", (q) =>
              q.eq("offerTagId", tag.prismaId)
            )
            .collect();
        }
      }

      const approved = products
        .filter((p) => p.status === "APPROVED")
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      const enriched = await Promise.all(
        approved.map((p) => enrichProductFull(ctx, p))
      );

      const outputKey = `products_${value.replace(/-/g, "_")}`;
      if (type === "simple") {
        const simple: any[] = [];
        for (const p of enriched) {
          const variant = p.variants[0];
          if (!variant || !variant.sizes?.length || !variant.images?.length)
            continue;
          const sizesWithDiscount = variant.sizes.map((s: any) => ({
            ...s,
            discountedPrice: s.price * (1 - (s.discount || 0) / 100),
          }));
          sizesWithDiscount.sort(
            (a: any, b: any) => a.discountedPrice - b.discountedPrice
          );
          const cheapest = sizesWithDiscount[0];
          simple.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            variantName: variant.variantName,
            variantSlug: variant.slug,
            price: cheapest.discountedPrice,
            image: variant.images[0].url,
            images: variant.images,
            discount: cheapest.discount,
          });
        }
        result[outputKey] = simple;
      } else {
        result[outputKey] = enriched.map(transformToUiProduct);
      }
    }

    return result;
  },
});

export const getRandomizedProducts = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, limit = 20, page = 1 }) => {
    const approved = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "APPROVED"))
      .collect();

    const shuffled = [...approved];
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = (hash << 5) - hash + sessionId.charCodeAt(i);
      hash = hash & hash;
    }
    for (let i = shuffled.length - 1; i > 0; i--) {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      const j = hash % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const totalCount = shuffled.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paged = shuffled.slice((page - 1) * limit, page * limit);

    const enriched = await Promise.all(
      paged.map((p) => enrichProductFull(ctx, p))
    );

    return {
      products: enriched.map(transformToUiProduct),
      totalPages,
      currentPage: page,
      totalCount,
    };
  },
});

export const getFairSponsoredProducts = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 6 }) => {
    const tags = await ctx.db.query("offerTags").collect();
    const sponsoredTag = tags.find((t) =>
      t.name.toLowerCase().includes("sponsored")
    );
    if (!sponsoredTag) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_offer_tag_id", (q) =>
        q.eq("offerTagId", sponsoredTag.prismaId)
      )
      .collect();

    const approved = products
      .filter((p) => p.status === "APPROVED")
      .slice(0, limit);
    const enriched = await Promise.all(
      approved.map((p) => enrichProductFull(ctx, p))
    );

    return enriched.map(transformToUiProduct);
  },
});
