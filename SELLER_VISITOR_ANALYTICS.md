# 🛒 Seller Visitor Analytics - Complete Guide

## 🎉 New Feature for Sellers!

Sellers now have a powerful **Visitor Analytics** page to track product performance, customer behavior, and conversion metrics using PostHog!

## 📍 Location

**URL**: `/dashboard/seller/visitor-analytics`  
**Sidebar**: Seller Dashboard → "Visitor Analytics" (right after Analytics)

## ✨ What You Can Track

### **📊 Key Metrics**

1. **Product Views** 👁️
   - Total number of times your products were viewed
   - Track which products get the most attention
   - Daily breakdown of views

2. **Cart Additions** 🛒
   - How many times products were added to cart
   - View-to-cart conversion rate
   - Daily cart activity

3. **Purchases** 💰
   - Completed purchases from your store
   - Cart-to-purchase conversion rate
   - Revenue-generating actions

4. **Cart Abandonment** ⚠️
   - Percentage of carts that weren't purchased
   - Number of abandoned carts
   - Identify checkout issues

---

## 🎯 Conversion Metrics

### **View → Cart Rate**
Shows what percentage of product views lead to cart additions.

**Good Rate**: 3% or higher  
**What it means**: 
- Low rate = Need better product images, descriptions, or pricing
- High rate = Products are appealing to customers

### **Cart → Purchase Rate**
Shows what percentage of cart additions lead to purchases.

**Good Rate**: 50% or higher  
**What it means**:
- Low rate = Checkout issues, shipping costs, or second thoughts
- High rate = Smooth checkout process, good pricing

### **Overall Conversion**
Shows what percentage of views lead to purchases (View → Purchase).

**Calculation**: (Purchases / Views) × 100

---

## 📈 Visualizations

### **1. Conversion Funnel** (Horizontal Bar Chart)
- **Views** → **Cart Adds** → **Purchases**
- Visual representation of customer journey
- See where customers drop off

### **2. Daily Performance** (Line Chart)
- Views, cart adds, and purchases over time
- Spot trends and patterns
- Identify peak shopping days

### **3. Top Performing Products** (Ranked List)
- See which products get the most views
- Top 10 products displayed
- Helps you focus on popular items

---

## 💡 Insights & Recommendations

The dashboard automatically provides actionable insights:

### **If View-to-Cart Rate is Low (<3%)**
**Alert**: "Improve product appeal"  
**Suggestions**:
- Use better product images
- Write clearer descriptions
- Check competitive pricing
- Highlight product benefits

### **If Cart Abandonment is High (>50%)**
**Alert**: "Reduce cart abandonment"  
**Suggestions**:
- Simplify checkout process
- Offer free or cheaper shipping
- Send cart reminder emails
- Remove unexpected fees

### **If Cart-to-Purchase Rate is Good (≥50%)**
**Alert**: "Great conversion rate!"  
**Message**: Keep up the good work!

### **If Views are Low (<100)**
**Alert**: "Increase visibility"  
**Suggestions**:
- Improve SEO
- Use social media marketing
- Run promotions
- Advertise your products

---

## 🎨 Dashboard Features

### **Time Range Selector**
Choose from:
- **Last 7 Days** - Recent performance
- **Last 30 Days** - Monthly trends
- **Last 90 Days** - Quarterly overview

### **Store Selector**
If you have multiple stores:
- Dropdown to switch between stores
- View analytics per store
- Compare performance

### **Stats Cards**
4 beautiful gradient cards showing:
1. 🔵 Product Views (blue)
2. 🟠 Cart Additions (orange)
3. 🟢 Purchases (green)
4. 🔴 Cart Abandonment (red)

Each card shows:
- Main metric
- Percentage rate or context
- Visual icon

### **Conversion Rate Cards**
3 cards showing:
- View → Cart Rate (with trending indicator)
- Cart → Purchase Rate (with trending indicator)
- Overall Conversion (View → Purchase)

**Trending Indicators**:
- 📈 Green arrow = Good performance
- 📉 Red arrow = Needs improvement

---

## 📊 What Gets Tracked

### **PostHog Events Used**

1. **`product_viewed`**
   - Fired when: Customer views a product
   - Properties: `productId`, `storeId`, `productName`, `price`

2. **`add_to_cart`**
   - Fired when: Customer adds product to cart
   - Properties: `productId`, `storeId`, `quantity`

3. **`purchase_completed`**
   - Fired when: Order is completed
   - Properties: `orderId`, `totalAmount`, `productIds`

4. **`remove_from_cart`**
   - Fired when: Customer removes item from cart
   - Properties: `productId`

---

## 🎯 Use Cases

### **Daily Monitoring**
1. Check dashboard every morning
2. Review yesterday's views and sales
3. Compare to previous days
4. Spot any unusual drops or spikes

### **Product Optimization**
1. Check "Top Performing Products"
2. See which products get most views
3. Promote popular products more
4. Improve or remove low-performing products

### **Conversion Improvement**
1. Monitor view-to-cart rate
2. If low, improve product presentation
3. Monitor cart-to-purchase rate
4. If low, improve checkout process

### **Marketing Decisions**
1. Use 30-day or 90-day view
2. Identify best-selling periods
3. Plan promotions accordingly
4. Focus marketing on high-traffic days

---

## 🔢 Example Metrics

### **Scenario 1: Healthy Store**
```
Product Views: 1,245
Cart Additions: 87 (7% conversion)
Purchases: 52 (60% cart conversion)
Cart Abandonment: 40%
Overall Conversion: 4.2%
```
**Status**: ✅ Excellent! Keep it up!

### **Scenario 2: Needs Improvement**
```
Product Views: 856
Cart Additions: 15 (1.8% conversion) ⚠️
Purchases: 3 (20% cart conversion) ⚠️
Cart Abandonment: 80%
Overall Conversion: 0.35%
```
**Status**: ⚠️ Focus on product appeal and checkout

### **Scenario 3: High Traffic, Low Conversion**
```
Product Views: 5,420
Cart Additions: 102 (1.9% conversion) ⚠️
Purchases: 78 (76% cart conversion) ✅
Cart Abandonment: 24%
Overall Conversion: 1.4%
```
**Status**: Good checkout, but improve product appeal

---

## 🚀 How to Use It

### **Step 1: Access the Page**
1. Log in as a seller
2. Go to your seller dashboard
3. Click "Visitor Analytics" in the sidebar

### **Step 2: Select Your Store**
- If you have multiple stores, pick one from the dropdown
- Dashboard updates automatically

### **Step 3: Choose Time Range**
- Click "Last 7 Days" for recent activity
- Click "Last 30 Days" for monthly view
- Click "Last 90 Days" for quarterly trends

### **Step 4: Review Metrics**
- Look at the 4 main stat cards
- Check your conversion rates
- Read the automated insights

### **Step 5: Analyze Charts**
- Review the conversion funnel
- Check daily performance trends
- Identify your top products

### **Step 6: Take Action**
- Follow the recommendations in "Insights"
- Improve low-performing areas
- Double down on what's working

---

## 📱 Responsive Design

Works perfectly on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📱 Tablets
- 🖥️ Large screens

All charts and cards adapt to screen size!

---

## 🎨 Visual Examples

### **Stat Cards Layout**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 👁️ Views   │ 🛒 Cart     │ 💰 Purchase │ ⚠️ Abandon  │
│ 1,245       │ 87          │ 52          │ 40%         │
│ impressions │ 7% of views │ 60% conv.   │ 35 carts    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Conversion Rates**
```
┌──────────────┬──────────────┬──────────────┐
│ View→Cart    │ Cart→Buy     │ Overall      │
│ 7% 📈        │ 60% 📈       │ 4.2% 📈      │
│ Good conv.   │ Excellent!   │ Views→Buy    │
└──────────────┴──────────────┴──────────────┘
```

---

## 🔧 Technical Details

### **API Endpoint**
`/api/analytics/seller?storeId={id}&range={7d|30d|90d}`

### **Components**
- `SellerAnalyticsDashboard.tsx` - Main dashboard
- `src/app/dashboard/seller/visitor-analytics/page.tsx` - Server component
- `src/app/dashboard/seller/visitor-analytics/client.tsx` - Client component

### **Data Flow**
1. Page loads → Fetches user's stores
2. Selects default store (or user picks one)
3. Calls `/api/analytics/seller` with storeId
4. API queries PostHog for events
5. Calculates metrics and rates
6. Returns formatted data
7. Dashboard displays charts and stats

---

## 📊 Data Privacy

- Only sellers can see their own store data
- API validates store ownership
- Data filtered by `storeId`
- No cross-store data leakage

---

## 💰 Business Value

### **For Sellers**
- ✅ Understand customer behavior
- ✅ Identify best-selling products
- ✅ Optimize pricing and presentation
- ✅ Improve conversion rates
- ✅ Make data-driven decisions
- ✅ Increase sales

### **For the Platform**
- ✅ Empower sellers with insights
- ✅ Improve seller retention
- ✅ Higher quality products
- ✅ Better overall marketplace
- ✅ More satisfied customers

---

## 🎯 Success Metrics

Track these KPIs:
- **View-to-Cart Rate**: Target 3%+
- **Cart-to-Purchase Rate**: Target 50%+
- **Cart Abandonment**: Keep under 50%
- **Overall Conversion**: Target 2%+
- **Product Views**: Growing over time

---

## 🚀 Next Steps

1. **Visit the page**: `/dashboard/seller/visitor-analytics`
2. **Review your metrics** for the last 7 days
3. **Read the automated insights**
4. **Implement recommendations**
5. **Check back weekly** to track progress
6. **Celebrate improvements**! 🎉

---

## 📚 Related Features

- **Seller Analytics** (`/dashboard/seller/analytics`) - Revenue and order analytics
- **Product Management** - Edit and optimize products
- **Inventory** - Manage stock levels
- **Orders** - Process customer orders

---

**Created**: January 29, 2026  
**Status**: ✅ Production Ready  
**Powered By**: PostHog Analytics  
**For**: All Sellers

Start tracking your store's performance today! 🚀
