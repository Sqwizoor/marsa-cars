# 🚀 Users & Analytics - Quick Reference

## 📍 Access

**URL**: `/dashboard/admin/users`  
**Sidebar**: Admin Dashboard → Users (between Analytics and Stores)

## 🎯 Two Main Tabs

### 1️⃣ User Management Tab

**What it shows:**
- All registered users in a table
- User stats (total, new this week, by role)
- Activity metrics per user

**Features:**
- 🔍 Search by name or email
- 🎯 Filter by role (User, Seller, Advertiser, Admin)
- 📊 Activity counts (orders, stores, cars, reviews)
- 📅 Join date for each user

**Use it to:**
- Find specific users quickly
- Monitor seller activity
- Track user engagement
- Manage user roles

---

### 2️⃣ Traffic & Growth Analytics Tab

**What it shows:**
- Website pageviews and visitors
- New user signups per day
- Top visited pages
- Engagement metrics

**Time Ranges:**
- Last 7 Days
- Last 30 Days
- Last 90 Days

**Metrics:**
- 👁️ Total Pageviews
- 👥 Unique Visitors (Daily Active Users)
- 🎉 New Users (signups)
- 📊 Avg. Pages/Session

**Charts:**
1. **Traffic Over Time** - Pageviews & visitors trend
2. **User Growth** - New signups per day
3. **Sessions** - User sessions over time
4. **Top Pages** - Most visited URLs

**Use it to:**
- Track daily traffic
- Monitor signup trends
- Identify popular pages
- Measure engagement
- Optimize high-traffic pages

---

## 🎨 Quick Actions

### Find a User
1. Go to "User Management" tab
2. Type name/email in search bar
3. Click "Search"

### Filter Sellers Only
1. Go to "User Management" tab
2. Click "All Roles" dropdown
3. Select "Seller"

### Check Growth This Week
1. Go to "Traffic & Growth" tab
2. Select "Last 7 Days"
3. Check "New Users" card

### See Most Popular Pages
1. Go to "Traffic & Growth" tab
2. Scroll to "Most Visited Pages"
3. View ranked list

---

## 📊 Understanding Metrics

| Metric | What It Means | Why It Matters |
|--------|---------------|----------------|
| **Total Pageviews** | Every page load | Shows overall traffic volume |
| **Unique Visitors** | Distinct users | Shows reach |
| **New Users** | Fresh signups via PostHog | Shows growth |
| **Pages/Session** | Avg pages per visit | Shows engagement |
| **Sessions** | User browsing sessions | Shows activity levels |

---

## 🎯 Use Cases

### Daily Monitoring
✅ Check "New This Week" card  
✅ Monitor "Traffic Over Time" chart  
✅ Review "Top Pages" for trends

### User Support
✅ Search for user by email  
✅ Check their activity (orders, reviews)  
✅ View join date

### Growth Analysis
✅ Compare 7d vs 30d vs 90d  
✅ Check "User Growth" chart  
✅ Identify signup spikes

### Content Optimization
✅ Review "Most Visited Pages"  
✅ Optimize top pages for conversion  
✅ Focus content strategy on popular URLs

---

## 🚀 Power Tips

1. **Weekly Routine**
   - Every Monday, check "New This Week"
   - Compare to previous week
   - Investigate spikes or drops

2. **Monthly Review**
   - Switch to "Last 30 Days"
   - Export top pages list
   - Plan optimizations

3. **Find Power Users**
   - Filter by "Seller" role
   - Sort by activity (orders, reviews)
   - Engage with top performers

4. **Traffic Patterns**
   - Check "Traffic Over Time"
   - Identify peak days
   - Schedule content accordingly

---

## 📱 What's Being Tracked

**From Database (Prisma):**
- User profiles
- Orders count
- Stores count
- Car listings count
- Reviews count
- Join dates

**From PostHog:**
- `$pageview` - Every page view
- `$identify` - User signups
- `unique_session` - User sessions
- `$current_url` - Page URLs
- Daily Active Users (DAU)

---

## 🎊 Key Features

✅ **Real-time data** from PostHog  
✅ **Beautiful charts** with Recharts  
✅ **Fast search** across users  
✅ **Role-based filtering**  
✅ **Activity tracking** per user  
✅ **Trend visualization** over time  
✅ **Top pages ranking**  
✅ **Responsive design** for all devices

---

## 📞 Quick Reference

**Page**: `/dashboard/admin/users`  
**Files**:
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/users/client.tsx`
- `src/app/api/analytics/users/route.ts`
- `src/components/analytics/UserAnalyticsDashboard.tsx`

**Full Documentation**: `USERS_ANALYTICS_FEATURE.md`

---

**Start Using It Now!** 🚀  
Visit `/dashboard/admin/users` and explore both tabs!
