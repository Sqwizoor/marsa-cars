# PostHog Tracking Implementation Checklist

## 🎯 Files to Update with Tracking

### High Priority - Product Tracking

- [ ] **Product Detail Page** - `src/app/(store)/product/[slug]/page.tsx`
  ```typescript
  import { trackProductView } from '@/lib/posthog-tracking'
  useEffect(() => trackProductView({...}), [product])
  ```

- [ ] **Add to Cart Component** - Find where cart items are added
  ```typescript
  import { trackAddToCart } from '@/lib/posthog-tracking'
  trackAddToCart({...}) // after successful add
  ```

- [ ] **Cart Page/Component** - Where cart items can be removed
  ```typescript
  import { trackRemoveFromCart } from '@/lib/posthog-tracking'
  trackRemoveFromCart({...}) // on remove
  ```

- [ ] **Checkout Success/Order Confirmation** - After order placement
  ```typescript
  import { trackPurchase } from '@/lib/posthog-tracking'
  trackPurchase({ id, total, items })
  ```

### High Priority - Car Tracking

- [ ] **Car Listing Detail Page** - `src/app/(store)/cars/[slug]/page.tsx`
  ```typescript
  import { trackCarView } from '@/lib/posthog-tracking'
  useEffect(() => trackCarView({...}), [car])
  ```

- [ ] **Car Inquiry Form** - Where users submit inquiries
  ```typescript
  import { trackCarInquiry } from '@/lib/posthog-tracking'
  trackCarInquiry({...}) // after submission
  ```

- [ ] **Car Listing Creation** - `src/app/dashboard/seller/cars/new/page.tsx` (or similar)
  ```typescript
  import { trackCarListingCreated } from '@/lib/posthog-tracking'
  trackCarListingCreated({...}) // after successful creation
  ```

### Medium Priority - Search & Discovery

- [ ] **Search Results Page** - `src/app/(store)/search/page.tsx` or similar
  ```typescript
  import { trackSearch } from '@/lib/posthog-tracking'
  useEffect(() => trackSearch(query, results.length, type), [query, results])
  ```

- [ ] **Product Grid/List Component** - Where products are displayed in lists
  ``` typescript
  import { trackProductClick } from '@/lib/posthog-tracking'
  onClick={() => trackProductClick({ id, name, position: index, list: 'homepage' })}
  ```

### Medium Priority - User Engagement

- [ ] **Store Page** - `src/app/(store)/store/[slug]/page.tsx` or similar
  ```typescript
  import { trackStoreView } from '@/lib/posthog-tracking'
  useEffect(() => trackStoreView({ id, name }), [store])
  ```

- [ ] **Store Follow Button** - Wherever users can follow stores
  ```typescript
  import { trackStoreFollow } from '@/lib/posthog-tracking'
  trackStoreFollow({ id, name }) // on follow action
  ```

- [ ] **Review Submission Form**
  ```typescript
  import { trackReviewSubmitted } from '@/lib/posthog-tracking'
  trackReviewSubmitted({ productId, rating }) // after submission
  ```

- [ ] **Wishlist Add Button**
  ```typescript
  import { trackWishlistAdd } from '@/lib/posthog-tracking'
  trackWishlistAdd({ id, name }) // on add
  ```

### Low Priority - Checkout Flow

- [ ] **Checkout Page** - `src/app/(store)/checkout/page.tsx`
  ```typescript
  import { trackCheckoutStarted } from '@/lib/posthog-tracking'
  useEffect(() => trackCheckoutStarted({ total, itemCount }), [])
  ```

### Low Priority - Subscriptions

- [ ] **Subscription Purchase/Completion** - Wherever subscription payment succeeds
  ```typescript
  import { trackSubscriptionPurchase } from '@/lib/posthog-tracking'
  trackSubscriptionPurchase({ tier, amount, type })
  ```

## 📍 Finding the Files

Use these commands to locate files:

```bash
# Find product pages
find src -name "*product*" -type f | grep -E "\.(tsx|ts)$"

# Find car pages
find src -name "*car*" -type f | grep -E "\.(tsx|ts)$"

# Find checkout pages
find src -name "*checkout*" -type f | grep -E "\.(tsx|ts)$"

# Find cart components
find src -name "*cart*" -type f | grep -E "\.(tsx|ts)$"
```

## ✅ Quick Test

After adding tracking:

1. Open browser DevTools → Network tab
2. Filter by "posthog"
3. Perform the action (view product, add to cart, etc.)
4. You should see POST requests to PostHog

Or check the PostHog dashboard directly at:
https://us.i.posthog.com

## 🎨 Example Implementation

```typescript
'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/lib/posthog-tracking'

export default function ProductPage({ product }) {
  // Track page view
  useEffect(() => {
    trackProductView({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category?.name,
      storeId: product.storeId,
      storeName: product.store?.name
    })
  }, [product])

  return (
    <div>
      {/* Your product UI */}
    </div>
  )
}
```

## 🚀 Priority Order

1. Install packages: `npm install posthog-js posthog-node`
2. Product detail pages (highest traffic)
3. Car listing pages
4. Add to cart functionality
5. Purchase completion
6. Car inquiries
7. Search functionality
8. Everything else

Start with high-priority items and work your way down!
