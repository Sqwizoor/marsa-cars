# PayFast Integration Fixes

## Issues Identified and Fixed

### 1. **Signature Generation (CRITICAL)** ⚠️
### 1. **Signature Generation (CRITICAL)** ⚠️
- **Problem**: Signature construction didn't match PayFast form spec
- **PayFast Requirement**: Use URL-encoded values (spaces as '+'), include all non-blank fields (incl. `merchant_key`), preserve field order, append passphrase, then MD5
- **Fix Applied**: Signature now encodes values, preserves insertion order, includes `merchant_key`, excludes only `signature`, and appends passphrase before hashing

### 2. **Amount Validation (CRITICAL)**
4. **Field order**: Keys must follow the HTML form spec order (not alphabetical)
   - **Solution**: Code preserves insertion order from the payload you provide
- **Fix Applied**: Automatic capping at 10,000 ZAR in sandbox mode

### 3. **Email Confirmation Type**
- **Problem**: email_confirmation sent as number instead of string
- **Fix Applied**: Changed to string "1" (PayFast prefers strings)

### 4. **Data Validation**
- **Problem**: Empty or undefined fields causing signature mismatch
- **Fix Applied**: Proper filtering of empty values before signature generation

### 5. **Email Validation**
- **Problem**: Email might be undefined
- **Fix Applied**: Better email extraction from Clerk user object

## Required Actions

### For Testing (Sandbox Mode)

1. **Test with smaller amounts**: 
   - Maximum: 10,000 ZAR
   - Recommended test amount: 100.00 - 1,000.00 ZAR

1. **Verify Configuration**:
   ```bash
   # Visit these endpoints to check your config and signature
   http://localhost:3000/api/payments/payfast/test-config
   http://localhost:3000/api/payments/payfast/test-signature
   ```

3. **Test Credentials** (Already in your .env):
   - Merchant ID: `10000100`
   - Merchant Key: `46f0cd694581a`
   - These are PayFast's official sandbox credentials

### For localhost Testing (Important!)

PayFast needs to send ITN (Instant Transaction Notifications) to your server. Since you're on `localhost:3000`, PayFast CANNOT reach you. You have two options:

#### Option A: Use ngrok (Recommended for testing)
```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose localhost:3000
ngrok http 3000
```

Then update your `.env`:
```properties
NEXT_PUBLIC_APP_URL=https://YOUR-NGROK-URL.ngrok.io
PAYFAST_NOTIFY_URL=https://YOUR-NGROK-URL.ngrok.io/api/payments/payfast/itn
```

#### Option B: Deploy to a public URL
- Deploy to Vercel/Netlify/Railway
- Update `.env` with your public URL

### Sandbox Passphrase (Optional but Recommended)

The passphrase is optional but improves security. To set one:

1. Login to PayFast sandbox: https://sandbox.payfast.co.za
2. Go to Settings > Integration
3. Set a passphrase
4. Update your `.env`:
   ```properties
   PAYFAST_PASSPHRASE=your_secure_passphrase_here
   ```

## Testing Steps

1. **Restart your dev server** after making changes to `.env`
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Test configuration**:
   ```
   Visit: http://localhost:3000/api/payments/payfast/test-config
   ```

3. **Create a test order** with amount ≤ 10,000 ZAR

4. **Check console logs** for:
   - PayFast redirect URL
   - Payment data
   - Signature

## Common PayFast Sandbox Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Amount exceeds limit | Use amount ≤ 10,000 ZAR |
| Invalid signature | Wrong passphrase or data mismatch | Verify passphrase in both .env and PayFast dashboard |
| Cannot reach notify_url | localhost not accessible | Use ngrok or deploy to public URL |
| Invalid email | Email format incorrect | Check user email in Clerk |

## Debugging Checklist

- [ ] Amount is ≤ 10,000 ZAR for sandbox
- [ ] All required fields are present (merchant_id, merchant_key, amount, item_name)
- [ ] Email address is valid
- [ ] Using correct sandbox credentials
- [ ] **Passphrase matches PayFast dashboard (or empty in both places)** ⚠️ CRITICAL
- [ ] notify_url is publicly accessible (not localhost)
- [ ] Dev server restarted after .env changes
- [ ] Check console logs for "PayFast Signature Generation" debug output
- [ ] Verify parameter string is NOT URL encoded (check test-signature endpoint)

## Fixing "Generated signature does not match" Error

This is the MOST COMMON error. Here's how to fix it:

### Step 1: Check Passphrase Match
```bash
# In your PayFast Sandbox Dashboard:
1. Login to https://sandbox.payfast.co.za
2. Go to Settings → Integration
3. Check if you have a "Security Passphrase" set
4. If YES: Copy it EXACTLY to your .env file
5. If NO: Make sure PAYFAST_PASSPHRASE is EMPTY in .env
```

### Step 2: Test Signature Generation
```bash
# Start dev server
npm run dev

# Visit test endpoint
http://localhost:3000/api/payments/payfast/test-signature

# This will show you:
- Your current passphrase status
- Example parameter strings
- Generated signatures
```

### Step 3: Common Causes
1. **Passphrase mismatch**: Most common cause
   - Solution: Ensure .env matches PayFast dashboard
2. **Extra spaces**: Trailing spaces in .env values
   - Solution: Remove any spaces around passphrase
3. **Wrong encoding**: Parameter string was URL encoded
   - Solution: Already fixed in the code
4. **Field order**: Keys must be alphabetically sorted
   - Solution: Already handled in the code

## Next Steps

1. **CHECK YOUR PASSPHRASE FIRST** ⚠️
2. Reduce your order amount to under 10,000 ZAR
3. Restart dev server after any .env changes
4. Test the payment flow
5. Check console logs for "PayFast Signature Generation" output
6. Visit test-signature endpoint to verify signature generation

## For Production (Live Mode)

1. Get production credentials from PayFast
2. Update `.env`:
   ```properties
   PAYFAST_MODE=live
   PAYFAST_MERCHANT_ID=your_live_merchant_id
   PAYFAST_MERCHANT_KEY=your_live_merchant_key
   PAYFAST_PASSPHRASE=your_live_passphrase
   ```
3. Ensure all URLs are public and HTTPS
4. Test thoroughly in sandbox before going live
