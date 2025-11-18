# Webhook Setup Guide

## Overview

This application uses webhooks to keep user data synchronized between Clerk (authentication) and your database. When users sign up, update their profiles, or become sellers, these webhooks ensure all systems stay in sync.

## What Webhooks Handle

### 1. **User Creation** (`user.created`)
- Automatically creates user record in database when someone signs up
- Sets default role as "USER"
- Syncs user data (name, email, picture) to database

### 2. **User Updates** (`user.updated`)
- **CRITICAL FOR SELLER ROLE**: When a user becomes a seller, this event fires
- Updates user role in database when Clerk metadata changes
- Keeps profile information in sync (name, email, picture)

### 3. **User Deletion** (`user.deleted`)
- Removes user from database when account is deleted
- Maintains data consistency

## How Seller Role Assignment Works

### The Flow:
1. **User applies to become seller** → Fills out seller application form
2. **User pays R10 trial fee** → PayFast processes payment
3. **PayFast sends ITN (payment confirmation)** → Our server receives notification
4. **Server updates database** → Creates Store and Subscription records, updates User role to "SELLER"
5. **Server updates Clerk** → Sets `privateMetadata.role = "SELLER"` in Clerk
6. **Clerk fires `user.updated` webhook** → Notifies our server of the role change
7. **Webhook updates database** → Ensures database role matches Clerk (redundant but ensures sync)
8. **User interface updates** → Shows seller features immediately

---

## Local Development Setup

### 1. Install Clerk CLI (for testing webhooks locally)

```bash
npm install -g @clerk/cli
```

### 2. Start webhook forwarding

```bash
clerk listen --webhook-url http://localhost:3000/api/webhooks
```

This command:
- Creates a tunnel to your local server
- Forwards Clerk webhook events to your local endpoint
- Allows you to test webhooks without deploying

### 3. Environment Variables (Already Configured)

Your `.env` file already has:
```env
SIGNING_SECRET=whsec_tux7fOA8V5l5WI9eV2RHlaYIgyfdoM01
WEBHOOK_SECRET=whsec_tux7fOA8V5l5WI9eV2RHlaYIgyfdoM01
```

These secrets verify that webhooks are genuinely from Clerk.

---

## Production Deployment Setup

### Step 1: Deploy Your Application

Deploy to your hosting provider (Vercel, Netlify, AWS, etc.)

**Example production URL:**
```
https://marsa-cars.vercel.app
```

### Step 2: Configure Clerk Webhook in Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application
   - Navigate to **Webhooks** in the left sidebar

2. **Add Endpoint**
   - Click **"+ Add Endpoint"**
   - Enter your webhook URL:
     ```
     https://marsa-cars.vercel.app/api/webhooks
     ```
   - **Important**: Use your actual production domain, not localhost

3. **Subscribe to Events**
   Select these events:
   - ✅ `user.created` - When users sign up
   - ✅ `user.updated` - When user data changes (CRITICAL for seller role)
   - ✅ `user.deleted` - When users are deleted

4. **Copy Signing Secret**
   - After creating the endpoint, Clerk shows a **Signing Secret**
   - Copy this secret (it starts with `whsec_`)
   - Example: `whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 3: Update Production Environment Variables

Add the signing secret to your hosting platform:

#### **Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add/Update:
   - **Name**: `SIGNING_SECRET`
   - **Value**: Your new production signing secret from Step 2.4
   - **Environments**: Production, Preview, Development

#### **Other Platforms:**
Follow your platform's documentation for setting environment variables.

### Step 4: Redeploy

After updating environment variables, redeploy your application to apply changes.

### Step 5: Test the Webhook

1. **Create a test user** in your production app
2. **Check Clerk Dashboard** → Webhooks → Click your endpoint
3. **View Recent Attempts** - You should see successful webhook deliveries
4. **Check your database** - User should be created with "USER" role

---

## Testing Seller Application Flow

### End-to-End Test:

1. **Sign up** as a new user
2. **Navigate to** `/seller/apply`
3. **Fill out application**:
   - Store information
   - Business details
   - Banking information
4. **Click "Start Trial"** and pay R10 (use PayFast sandbox)
5. **Wait for payment confirmation** (should be instant in sandbox)
6. **Check that**:
   - User role is updated to "SELLER" in database
   - User can access `/seller/dashboard`
   - Subscription is created with status "TRIALING"
   - Store record is created

### Troubleshooting:

If seller role is not updating:

1. **Check PayFast ITN logs**:
   ```bash
   # Look for this in your server logs
   Successfully updated Clerk privateMetadata for user [userId] to SELLER
   ```

2. **Check Clerk webhook logs**:
   - Go to Clerk Dashboard → Webhooks
   - Click your endpoint
   - Check recent attempts for `user.updated` event
   - Should see 200 status code

3. **Check database**:
   ```sql
   SELECT id, name, email, role FROM "User" WHERE id = 'your-user-id';
   ```
   - Role should be "SELLER"

4. **Check Clerk user metadata**:
   - Clerk Dashboard → Users → Select user
   - Check **Private Metadata**
   - Should have: `{ "role": "SELLER" }`

---

## API Route Details

### Webhook Endpoint: `/api/webhooks`

**File**: `src/app/api/webhooks/route.ts`

**What it does**:
- Receives webhook events from Clerk
- Verifies authenticity using SIGNING_SECRET
- Handles user.created, user.updated, user.deleted events
- Updates database to match Clerk data

**Security**:
- Uses Svix library to verify webhook signatures
- Rejects requests without valid signatures
- Prevents unauthorized data manipulation

### PayFast ITN Endpoint: `/api/payments/payfast/trial-itn`

**File**: `src/app/api/payments/payfast/trial-itn/route.ts`

**What it does**:
- Receives payment confirmation from PayFast
- Validates payment with PayFast servers
- Creates Store and Subscription records
- Updates User role to "SELLER" in database
- Updates Clerk privateMetadata to "SELLER"
- Triggers `user.updated` webhook in Clerk

---

## Environment Variables Reference

### Required for Webhooks:

```env
# Clerk Webhook Verification
SIGNING_SECRET=whsec_xxx...
WEBHOOK_SECRET=whsec_xxx...  # Can be same as SIGNING_SECRET

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx...

# Database
DATABASE_URL=postgresql://xxx...

# PayFast (for seller trial payments)
PAYFAST_MODE=sandbox  # or 'live' for production
PAYFAST_MERCHANT_ID=xxx
PAYFAST_MERCHANT_KEY=xxx
PAYFAST_PASSPHRASE=xxx

# Application URL (for PayFast callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Common Issues & Solutions

### Issue: "Error: Missing Svix headers"
**Solution**: Webhook is not coming from Clerk. Verify webhook URL in Clerk Dashboard.

### Issue: "Error: Verification error"
**Solution**: SIGNING_SECRET doesn't match. Update environment variable with correct secret from Clerk Dashboard.

### Issue: Seller role not updating after payment
**Checklist**:
1. ✅ PayFast credentials configured correctly
2. ✅ PayFast ITN endpoint accessible (not localhost for live payments)
3. ✅ SIGNING_SECRET is production secret, not development
4. ✅ `user.updated` event is subscribed in Clerk Dashboard
5. ✅ Check server logs for errors

### Issue: Database and Clerk out of sync
**Solution**: 
- The `user.updated` webhook should sync them
- Manually fix by running:
  ```sql
  UPDATE "User" SET role = 'SELLER' WHERE id = 'user-id';
  ```
- Then update Clerk metadata in dashboard

---

## Monitoring & Maintenance

### What to Monitor:

1. **Clerk Webhook Delivery Rate**
   - Clerk Dashboard → Webhooks → Your endpoint
   - Should see successful deliveries (200 status)
   
2. **PayFast ITN Logs**
   - Check server logs for trial payment confirmations
   - Look for "Successfully updated Clerk privateMetadata"

3. **User Role Mismatches**
   - Periodically check database vs Clerk metadata
   - Users with Store records should have role="SELLER"

### Logging:

Add these logs to monitor the flow:

```typescript
console.log("Seller application completed:", { userId, storeId, subscriptionId });
console.log("Clerk metadata updated:", { userId, role: "SELLER" });
console.log("Webhook received:", { eventType, userId });
```

---

## Quick Reference

| Event | When | What Happens |
|-------|------|--------------|
| `user.created` | User signs up | Creates user in database with role="USER" |
| `user.updated` | Role changes or profile updates | Syncs role and profile data to database |
| `user.deleted` | User deletes account | Removes user from database |
| PayFast ITN | Payment confirmed | Creates Store, Subscription, updates role |

---

## Production Checklist

Before going live:

- [ ] Webhook endpoint configured in Clerk Dashboard
- [ ] Production SIGNING_SECRET in environment variables
- [ ] Webhook URL uses HTTPS (required)
- [ ] `user.created`, `user.updated`, `user.deleted` events subscribed
- [ ] PayFast live credentials configured
- [ ] PayFast ITN URL points to production domain
- [ ] Test seller application flow end-to-end
- [ ] Verify role updates in both Clerk and database
- [ ] Check webhook delivery logs show 200 status codes

---

## Support Resources

- **Clerk Webhooks Docs**: https://clerk.com/docs/integrations/webhooks
- **PayFast ITN Docs**: https://developers.payfast.co.za/docs#instant_transaction_notification
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

**Last Updated**: November 18, 2025
