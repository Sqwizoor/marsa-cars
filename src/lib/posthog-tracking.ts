'use client'

import posthog from 'posthog-js'
import {
  trackMetaViewContent,
  trackMetaAddToCart,
  trackMetaAddToWishlist,
  trackMetaPurchase,
  trackMetaLead,
  trackMetaContact,
  trackMetaSearch,
  trackMetaSubscribe,
  trackMetaInitiateCheckout,
} from './meta-pixel'

// Product tracking
export const trackProductView = (product: {
  id: string
  name: string
  price: number
  category?: string | null
  storeId?: string | null
  storeName?: string | null
}) => {
  posthog.capture('product_viewed', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    category: product.category,
    store_id: product.storeId,
    store_name: product.storeName,
  })
  trackMetaViewContent({
    id: product.id,
    name: product.name,
    price: product.price,
    contentType: 'product',
    category: product.category ?? undefined,
  })
}

export const trackProductClick = (product: {
  id: string
  name: string
  position?: number
  list?: string
}) => {
  posthog.capture('product_clicked', {
    product_id: product.id,
    product_name: product.name,
    position: product.position,
    list: product.list,
  })
}

export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  quantity: number
  variant?: string | null
}) => {
  posthog.capture('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: product.quantity,
    variant: product.variant,
    value: product.price * product.quantity,
  })
  trackMetaAddToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
  })
}

export const trackRemoveFromCart = (product: {
  id: string
  name: string
  price: number
}) => {
  posthog.capture('remove_from_cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
  })
}

export const trackPurchase = (order: {
  id: string
  total: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}) => {
  posthog.capture('purchase_completed', {
    order_id: order.id,
    value: order.total,
    currency: 'ZAR',
    items: order.items,
  })
  trackMetaPurchase({
    value: order.total,
    currency: 'ZAR',
    orderId: order.id,
    contentIds: order.items.map((item) => item.id),
    numItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
  })
}

// Car tracking
export const trackCarView = (car: {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  condition: string
  userId?: string
}) => {
  posthog.capture('car_viewed', {
    car_id: car.id,
    car_title: car.title,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    condition: car.condition,
    seller_id: car.userId,
  })
  trackMetaViewContent({
    id: car.id,
    name: car.title,
    price: car.price,
    contentType: 'vehicle',
  })
}

export const trackCarInquiry = (car: {
  id: string
  title: string
  price: number
  sellerId: string
}) => {
  posthog.capture('car_inquiry_submitted', {
    car_id: car.id,
    car_title: car.title,
    price: car.price,
    seller_id: car.sellerId,
  })
  trackMetaLead({
    id: car.id,
    name: car.title,
    value: car.price,
    category: 'vehicle',
  })
  trackMetaContact({
    contentName: car.title,
    contentCategory: 'vehicle',
  })
}

export const trackCarListingCreated = (car: {
  id: string
  make: string
  model: string
  price: number
  subscriptionTier: string
}) => {
  posthog.capture('car_listing_created', {
    car_id: car.id,
    make: car.make,
    model: car.model,
    price: car.price,
    subscription_tier: car.subscriptionTier,
  })
}

// Search tracking
export const trackSearch = (query: string, results: number, type: 'products' | 'cars') => {
  posthog.capture('search_performed', {
    query,
    results_count: results,
    search_type: type,
  })
  trackMetaSearch({
    searchString: query,
    contentCategory: type,
  })
}

// Store tracking
export const trackStoreFollow = (store: {
  id: string
  name: string
}) => {
  posthog.capture('store_followed', {
    store_id: store.id,
    store_name: store.name,
  })
}

export const trackStoreView = (store: {
  id: string
  name: string
}) => {
  posthog.capture('store_viewed', {
    store_id: store.id,
    store_name: store.name,
  })
}

// Subscription tracking
export const trackSubscriptionPurchase = (subscription: {
  tier: string
  amount: number
  type: 'car' | 'product'
}) => {
  posthog.capture('subscription_purchased', {
    subscription_tier: subscription.tier,
    amount: subscription.amount,
    subscription_type: subscription.type,
  })
  trackMetaSubscribe({
    value: subscription.amount,
    currency: 'ZAR',
    predictedLtv: subscription.amount * 12,
  })
}

// User actions
export const trackReviewSubmitted = (review: {
  productId: string
  rating: number
}) => {
  posthog.capture('review_submitted', {
    product_id: review.productId,
    rating: review.rating,
  })
}

export const trackWishlistAdd = (product: {
  id: string
  name: string
  price?: number
}) => {
  posthog.capture('wishlist_added', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
  })
  trackMetaAddToWishlist({
    id: product.id,
    name: product.name,
    price: product.price,
  })
}

export const trackCheckoutStarted = (cart: {
  total: number
  itemCount: number
  contentIds?: string[]
}) => {
  posthog.capture('checkout_started', {
    value: cart.total,
    item_count: cart.itemCount,
  })
  trackMetaInitiateCheckout({
    value: cart.total,
    numItems: cart.itemCount,
    contentIds: cart.contentIds,
  })
}
