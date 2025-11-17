# PayFast Sandbox Account Setup Guide

## The Problem

You're using PayFast's default test credentials:
- Merchant ID: `10000100`
- Merchant Key: `46f0cd694581a`

These credentials have limitations and may have strict validation rules that cause signature mismatches.

## Solution: Create Your Own Sandbox Account

### Step 1: Create a Sandbox Account

1. Go to https://www.payfast.co.za/
2. Click **"Sign Up"** (not Login)
3. Select **"Sandbox/Test Account"**
4. Fill in your details
5. Verify your email

### Step 2: Get Your Credentials

1. Login to https://sandbox.payfast.co.za
2. Go to **Settings** → **Integration**
3. You'll find:
   - **Merchant ID** (10-digit number)
   - **Merchant Key** (13-character string)
   - **Passphrase** (optional - you can set this)

### Step 3: Configure Passphrase (Recommended)

1. Still in **Settings** → **Integration**
2. Scroll to **"Security Passphrase"**
3. Either:
   - **Option A**: Leave it EMPTY (easier for testing)
   - **Option B**: Set a passphrase (more secure)
4. Click **"Update"** or **"Save"**

### Step 4: Update Your .env File

```properties
PAYFAST_MODE=sandbox
PAYFAST_MERCHANT_ID=YOUR_NEW_MERCHANT_ID
PAYFAST_MERCHANT_KEY=YOUR_NEW_MERCHANT_KEY
PAYFAST_PASSPHRASE=YOUR_PASSPHRASE_OR_EMPTY
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

## Alternative: Verify Current Test Credentials

If you want to continue using the default test credentials, try this:

1. Visit: https://developers.payfast.co.za/docs#step_1_form_fields
2. Look for their latest test credentials
3. Check if there's a required passphrase

## Why This Happens

PayFast's shared test credentials may:
- Have rate limits
- Have IP restrictions
- Require specific passphrase
- Have outdated configuration
- Be used by too many developers simultaneously

Your own sandbox account will:
- ✅ Work reliably
- ✅ Have no rate limits
- ✅ Allow you to control passphrase
- ✅ Provide better testing environment
- ✅ Match production behavior

## Test Without Passphrase First

Current .env is set to no passphrase. Try this:

1. Restart dev server
2. Create a test order
3. Check console for signature
4. If still fails, create your own sandbox account
