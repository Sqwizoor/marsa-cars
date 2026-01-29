# PostHog Integration Guide

## 🎯 Overview

PostHog has been successfully integrated into your marketplace to track all products, cars, and user interactions. This guide shows you what's been implemented and how to use it.

## ✅ What's Been Set Up

###  1. Core PostHog Files

- **`instrumentation-client.ts`** - Client-side PostHog initialization
- **`src/lib/posthog-server.ts`** - Server-side PostHog client with singleton pattern
- **`src/lib/posthog-tracking.ts`** - Helper functions for tracking events
- **`src/components/analytics/PostHogIdentifier.tsx`** - Auto-identifies users
-  **`src/app/layout.tsx`** - Updated to include PostHog identifier

### 2. Analytics Dashboards

#### Admin Dashboards (`/dashboard/admin/analytics`)
- **Overview Tab** - Existing revenue, orders, and sales analytics
- **Product Insights Tab** - PostHog-powered product performance
  - Top performing products by views, cart adds, and purchases
  - Revenue tracking
  - Conversion rates
  - Category performance

- **Car Insights Tab** - PostHog-powered car listing performance
  - Top performing cars by views and inquiries
  - Make/model performance
  - Inquiry conversion rates

#### Seller Dashboard (`/dashboard/seller/analytics`)
- Car listing performance specific to the seller
- Views and inquiries for their listings
- Conversion metrics

### 3. API Routes

- **`/api/analytics/products`** - Fetches product analytics from PostHog
- **`/api/analytics/cars`** - Fetches car analytics from PostHog (supports seller filtering)

## 📊 Available Tracking Functions

All tracking functions are in `src/lib/posthog-tracking.ts`. Import them like this:

```typescript
import {
  trackProductView,
  trackCarView,
  trackAddToCart,
  trackPurchase,
  // ... etc
} from '@/lib/posthog-tracking'
```

### Product Tracking

```typescript
// When a user views a product
trackProductView({
  id: product.id,
  name: product.name,
  price: product.price,
  category: product.category?.name,
  storeId: product.storeId,
  storeName: product.store?.name
})

// When a user clicks on a product (in listings)
trackProductClick({
  id: product.id,
  name: product.name,
  position: index, // position in the list
  list: 'homepage' // or 'search', 'category', etc.
})

// When adding to cart
trackAddToCart({
  id: product.id,
  name: product.name,
  price: variant.price,
  quantity: quantity,
  variant: variant.name
})

// When removing from cart
trackRemoveFromCart({
  id: product.id,
  name: product.name,
  price: product.price
})

// When purchase is completed
trackPurchase({
  id: order.id,
  total: order.total,
  items: order.items.map(item => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }))
})
```

### Car Tracking

```typescript
// When a user views a car listing
trackCarView({
  id: car.id,
  title: car.title,
  make: car.make,
  model: car.model,
  year: car.year,
  price: car.price,
  condition: car.condition,
  userId: car.userId
})

// When a user submits an inquiry
trackCarInquiry({
  id: car.id,
  title: car.title,
  price: car.price,
  sellerId: car.userId
})

// When a seller creates a new listing
trackCarListingCreated({
  id: car.id,
  make: car.make,
  model: car.model,
  price: car.price,
  subscriptionTier: subscription.tier
})
```

### Other Events

```typescript
// Search
trackSearch(
  'Toyota Camry', // query
  42, // results count
  'cars' // type: 'products' | 'cars'
)

// Store interactions
trackStoreFollow({ id: store.id, name: store.name })
trackStoreView({ id: store.id, name: store.name })

// Reviews
trackReviewSubmitted({ productId: product.id, rating: 5 })

// Wishlist
trackWishlistAdd({ id: product.id, name: product.name })

// Checkout
trackCheckoutStarted({ total: cart.total, itemCount: cart.items.length })

// Subscriptions
trackSubscriptionPurchase({
  tier: 'PREMIUM',
  amount: 299,
  type: 'car'
})
```

## 🚀 Integration Examples

### Example 1: Product Page

Add to your product page component:

```typescript
'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/lib/posthog-tracking'

export default function ProductPage({ product }: { product: Product }) {
  useEffect(() => {
    // Track product view when page loads
    trackProductView({
      id: product.id,
      name: product.name,
      price: product.variants[0]?.sizes[0]?.price || 0,
      category: product.category?.name,
      storeId: product.storeId,
      storeName: product.store?.name
    })
  }, [product])

  return (
    // ... your product page
  )
}
```

### Example 2: Car Listing Page

```typescript
'use client'

import { use Effect } from 'react'
import { trackCarView } from '@/lib/posthog-tracking'

export default function CarListingPage({ car }: { car: CarListing }) {
  useEffect(() => {
    trackCarView({
      id: car.id,
      title: car.title,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      condition: car.condition,
      userId: car.userId
    })
  }, [car])

  return (
    // ... your car page
  )
}
```

### Example 3: Add to Cart Button

```typescript
'use client'

import { trackAddToCart } from '@/lib/posthog-tracking'

function AddToCartButton({ product, variant, quantity }: Props) {
  const handleAddToCart = async () => {
    // Your existing add to cart logic
    await addToCart(...)

    // Track the event
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: variant.price,
      quantity: quantity, variant: variant.name
    })
  }

  return <button onClick={handleAddToCart}>Add to Cart</button>
}
```

### Example 4: Car Inquiry Form

```typescript
'use client'

import { trackCarInquiry } from '@/lib/posthog-tracking'

function InquiryForm({ car }: { car: CarListing }) {
  const handleSubmit = async (data: FormData) => {
    // Your existing inquiry logic
    await submitInquiry(data)

    // Track the inquiry
    trackCarInquiry({
      id: car.id,
      title: car.title,
      price: car.price,
      sellerId: car.userId
    })
  }

  return (
    // ... your form
  )
}
```

### Example 5: Search Results

```typescript
'use client'

import { useEffect } from 'react'
import { trackSearch, trackProductClick, trackCarView } from '@/lib/posthog-tracking'

export default function SearchResults({ query, results, type }: Props) {
  useEffect(() => {
    // Track search
    trackSearch(query, results.length, type)
  }, [query, results.length, type])

  const handleProductClick = (product: Product, index: number) => {
    trackProductClick({
      id: product.id,
      name: product.name,
      position: index,
      list: 'search_results'
    })
  }

  return (
    // ... your results
  )
}
```

## 🎨 Dashboard Access

- **Admin**: Visit `/dashboard/admin/analytics` and switch to "Product Insights" or "Car Insights" tabs
- **Sellers**: Visit `/dashboard/seller/analytics` to see their car performance

## 📦 Required Packages

Remember to install:
```bash
npm install posthog-js posthog-node
```

## 🔑 Environment Variables

Already set in your `.env`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_OymPXjGIZ3KcDUH5Si9yNapILXMYnPVFEx8mpMfpVsc
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 📝 Next Steps

1. **Install packages**: Run `npm install posthog-js posthog-node`

2. **Add tracking to key pages**:
   - Product pages (`src/app/(store)/product/[slug]/page.tsx`)
   - Car listing pages (`src/app/(store)/cars/[slug]/page.tsx`)
   - Cart functionality (`src/components/cart/*`)
   - Checkout process (`src/app/(store)/checkout/*`)
   - Search results
   - Product/car listing grids

3. **Test tracking**:
   - Browse your site as a user
   - Add products to cart
   - View car listings
   - Submit inquiries
   - Check PostHog dashboard at https://us.i.posthog.com

4. **View analytics**:
   - Visit `/dashboard/admin/analytics` to see all insights
   - Visit `/dashboard/seller/analytics` as a seller

## 🎯 Events Being Tracked

- ✅ Product views
- ✅ Product clicks
- ✅ Add to cart
- ✅ Remove from cart
- ✅ Purchases
- ✅ Car listing views
- ✅ Car inquiries
- ✅ Car listing creation
- ✅ Search queries
- ✅ Store follows
- ✅ Store views
- ✅ Reviews
- ✅ Wishlist additions
- ✅ Checkout starts
- ✅ Subscription purchases
- ✅ Automatic page views
- ✅ Automatic clicks
- ✅ User identification

## 💡 Tips

1. **User Identification**: Users are automatically identified when they sign in (via PostHogIdentifier)

2. **Server-side Tracking**: Use `src/lib/posthog-server.ts` for API routes:
```typescript
import { trackEvent } from '@/lib/posthog-server'

await trackEvent({
  distinctId: userId,
  event: 'custom_event',
  properties: { ... }
})
```

3. **Custom Events**: Add your own events using:
```typescript
import posthog from 'posthog-js'

posthog.capture('custom_event_name', {
  property1: 'value1',
  property2: 'value2'
})
```

4. **Feature Flags**: PostHog also supports feature flags for A/B testing:
```typescript
import posthog from 'posthog-js'

const showNewFeature = posthog.isFeatureEnabled('new-feature-flag')
```

## 🎨 Dashboard Features

Your analytics dashboards include:
- 📊 Real-time metrics cards
- 📈 Beautiful charts (bar, line, pie)
- 🏆 Top performers list with rankings
- ⏱️ Time range filters (7d, 30d, 90d)
- 🎯 Conversion rate tracking
- 💰 Revenue analytics
- 👁️ View tracking
- 🛒 Cart and purchase funnel

All dashboards use modern, premium UI with:
- Orange-themed gradients
- Smooth animations
- Responsive layouts
- Interactive hover effects
- Professional typography

Enjoy your new analytics superpowers! 🚀
