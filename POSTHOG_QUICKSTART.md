# 🚀 PostHog Quick Start Guide

## 1. Install Packages (2 minutes)

```bash
npm install posthog-js posthog-node
```

## 2. See It Working Right Now! (1 minute)

### Test Car Tracking (Already Implemented ✅)
1. Visit any car listing: `http://localhost:3000/cars/[any-car-slug]`
2. Submit an inquiry on that car
3. Check your PostHog dashboard: https://us.i.posthog.com
4. Events should appear: `car_viewed` and `car_inquiry_submitted`

### Check Analytics Dashboards
1. **Admin**: `http://localhost:3000/dashboard/admin/analytics`
   - Click "Car Insights" tab
   - See top performing cars

2. **Seller**: `http://localhost:3000/dashboard/seller/analytics`
   - See your car listing performance

## 3. Add Product Tracking (10 minutes)

### Find Your Product Page
Likely at: `src/app/(store)/product/[productSlug]/[variantSlug]/page.tsx`

### Add This Code

```typescript
'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/lib/posthog-tracking'

export default function ProductPage({ product, variant }) {
  // Track page view
  useEffect(() => {
    trackProductView({
      id: product.id,
      name: product.name,
      price: variant.sizes[0]?.price || 0,
      category: product.category?.name,
      storeId: product.storeId,
      storeName: product.store?.name
    })
  }, [product, variant])

  return (
    // ... your existing JSX
  )
}
```

## 4. Add Cart Tracking (5 minutes)

### Find Your Add to Cart Handler
Look for where you add items to cart (probably in a component or action)

### Add This:

```typescript
import { trackAddToCart } from '@/lib/posthog-tracking'

// After successfully adding to cart:
trackAddToCart({
  id: product.id,
  name: product.name,
  price: selectedSize.price,
  quantity: quantity,
  variant: variant.name
})
```

## 5. Add Purchase Tracking (5 minutes)

### Find Your Order Confirmation/Success Page
Likely at: `src/app/(store)/checkout/success/page.tsx` or similar

### Add This:

```typescript
'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/posthog-tracking'

export default function OrderSuccess({ order }) {
  useEffect(() => {
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
  }, [order])

  return (
    // ... your existing JSX
  )
}
```

## 6. View Your Analytics! 🎉

### PostHog Dashboard
https://us.i.posthog.com
- See all events in real-time
- Create custom insights
- Set up feature flags
- View user sessions

### Admin Dashboard  
`/dashboard/admin/analytics` → "Product Insights" tab
- Top products by revenue
- Conversion rates
- Category performance
- Beautiful charts

### Seller Dashboard
`/dashboard/seller/analytics`
- Seller's car performance
- Views and inquiries
- Conversion metrics

## 7. Pro Tips

### Debug Mode
```typescript
// In browser console:
posthog.debug()
// See all events being tracked
```

### Test Events
```typescript
// Open browser DevTools → Console
import posthog from 'posthog-js'
posthog.capture('test_event', { test: true })
// Should appear in Network tab and PostHog dashboard
```

### Check What's Tracked
1. Open browser DevTools
2. Go to Network tab
3. Filter by "posthog"
4. Interact with your site
5. See POST requests with event data

## 8. Common Patterns

### Track Button Clicks
```typescript
<button onClick={() => {
  // Your existing logic
  trackSomeAction(...)
}}>
  Click Me
</button>
```

### Track Form Submissions
```typescript
const handleSubmit = async (data) => {
  // Your existing logic
  await submitForm(data)
  
  // Track it
  trackFormSubmitted({ form: 'contact', success: true })
}
```

### Track on Component Mount
```typescript
useEffect(() => {
  trackPageView({ page: 'about' })
}, [])
```

## 9. Full Tracking Checklist

- [x] Car views (DONE ✅)
- [x] Car inquiries (DONE ✅)
- [ ] Product views
- [ ] Add to cart
- [ ] Remove from cart
- [ ] Purchases
- [ ] Search queries
- [ ] Store views
- [ ] Reviews
- [ ] Wishlist additions

## 10. Next Steps

1. ✅ Install packages: `npm install posthog-js posthog-node`
2. ✅ Test car tracking (already works!)
3. ⏭️ Add product tracking
4. ⏭️ Add cart tracking
5. ⏭️ Add purchase tracking
6. ⏭️ Add search tracking
7. 🎉 Enjoy your analytics!

## 📚 Full Documentation

- **Detailed Guide**: `POSTHOG_INTEGRATION.md`
- **File Checklist**: `TRACKING_CHECKLIST.md`
- **Full Summary**: `POSTHOG_IMPLEMENTATION_SUMMARY.md`
- **PostHog Docs**: https://posthog.com/docs

## 🆘 Need Help?

The car detail page is a working example:
`src/app/(store)/cars/[slug]/car-detail-client.tsx`

Look at:
- Lines 1-6: Imports
- Lines 86-100: useEffect for tracking view
- Lines 123-131: Inquiry tracking

Copy this pattern for other pages!

## 🎊 That's It!

Start with products → cart → purchases, then add the rest.

Every event you track makes your analytics more powerful! 📊

---

**Time to Complete**: ~30 minutes for core tracking  
**Difficulty**: Easy (just copy the patterns!)  
**Impact**: Huge (understand your entire marketplace!) 🚀
