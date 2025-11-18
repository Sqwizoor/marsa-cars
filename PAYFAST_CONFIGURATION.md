# PayFast Configuration Guide

## Overview

This application uses PayFast as the payment gateway for South African transactions, including:
- Seller store trial applications (R10 fee)
- Order payments for car parts purchases

## Current Issue

The application is experiencing 500/503 errors when users try to initiate payments because PayFast credentials are not configured in the environment.

### Error Messages
- **503 Service Unavailable**: "PayFast payment gateway is not configured. Please contact support."
- **500 Internal Server Error**: "Payment configuration error"

These errors occur when `PAYFAST_MERCHANT_ID` or `PAYFAST_MERCHANT_KEY` environment variables are missing.

## Setup Instructions

### 1. Create PayFast Account

#### For Testing (Sandbox)
1. Go to [PayFast Sandbox](https://sandbox.payfast.co.za/)
2. Create a sandbox merchant account
3. Navigate to **Settings → Integration**
4. Copy your sandbox credentials:
   - Merchant ID (10-digit number)
   - Merchant Key (alphanumeric string)
   - Passphrase (optional, for added security)

#### For Production (Live)
1. Go to [PayFast](https://www.payfast.co.za/)
2. Register for a merchant account
3. Complete verification process
4. Navigate to **Settings → Integration**
5. Copy your live credentials

### 2. Configure Environment Variables

Add the following to your `.env` or `.env.local` file:

```env
# PayFast Configuration
PAYFAST_MODE=sandbox  # Use "live" for production

# Required credentials
PAYFAST_MERCHANT_ID=your_merchant_id_here
PAYFAST_MERCHANT_KEY=your_merchant_key_here

# Optional passphrase (recommended for production)
PAYFAST_PASSPHRASE=your_passphrase_here

# Optional custom URLs (defaults provided)
PAYFAST_RETURN_URL=https://yourdomain.com/checkout/payfast-return
PAYFAST_CANCEL_URL=https://yourdomain.com/checkout/payfast-cancel
PAYFAST_NOTIFY_URL=https://yourdomain.com/api/payments/payfast/itn
```

### 3. Deployment Configuration

#### Vercel
1. Go to project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - Name: `PAYFAST_MERCHANT_ID`
   - Value: Your merchant ID
   - Environment: Production, Preview, Development (as needed)
4. Repeat for `PAYFAST_MERCHANT_KEY` and `PAYFAST_PASSPHRASE`
5. Redeploy the application

#### Other Platforms
Follow your platform's documentation for setting environment variables.

### 4. Configure PayFast Dashboard

1. Log into PayFast dashboard
2. Go to **Settings → Integration**
3. Set your notification (ITN) URL:
   - Sandbox: `https://your-domain.com/api/payments/payfast/itn`
   - Live: Your production domain
4. Set passphrase (if using one)
5. Save settings

### 5. Test the Integration

#### Sandbox Testing
1. Use PayFast test cards:
   - Card Number: `4000 0000 0000 0002`
   - CVV: Any 3 digits
   - Expiry: Any future date
2. Test seller application with R10 payment
3. Test order checkout flow

#### Monitoring
- Check server logs for PayFast errors
- Monitor ITN (Instant Transaction Notification) callbacks
- Verify payment status updates in database

## Technical Details

### Affected Routes
- `/api/payments/payfast/trial-initiate` - Seller trial payment
- `/api/payments/payfast/initiate` - Order payments
- `/api/payments/payfast/itn` - Payment notifications

### Error Handling
The application now gracefully handles missing credentials:
- Returns 503 status with user-friendly message
- Logs detailed error information for debugging
- Prevents application crashes

### Configuration File
Location: `src/lib/payfast/config.ts`

The config throws an error if credentials are missing, which is caught by API routes to return proper HTTP responses.

## Sandbox vs Live Mode

### Sandbox Mode
- Set `PAYFAST_MODE=sandbox`
- Use sandbox credentials
- Test transactions only
- Amount limit: R10,000
- No real money transferred

### Live Mode
- Set `PAYFAST_MODE=live`
- Use production credentials
- Real transactions
- Requires verified PayFast account
- Real money processing

## Troubleshooting

### "PayFast payment gateway is not configured"
**Cause**: Missing `PAYFAST_MERCHANT_ID` or `PAYFAST_MERCHANT_KEY`

**Solution**: Add credentials to environment variables and redeploy

### Payment not completing
**Cause**: ITN URL not configured or not accessible

**Solution**: 
1. Verify ITN URL in PayFast dashboard
2. Check server logs for ITN webhook errors
3. Ensure `/api/payments/payfast/itn` route is accessible

### Signature verification failures
**Cause**: Passphrase mismatch

**Solution**: Ensure `PAYFAST_PASSPHRASE` matches PayFast dashboard setting

### Sandbox amount limit exceeded
**Cause**: Order total > R10,000 in sandbox mode

**Solution**: The code automatically caps at R10,000 for sandbox

## Security Best Practices

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use passphrase**: Add extra security layer for production
3. **Verify signatures**: Always validate PayFast ITN signatures
4. **HTTPS required**: PayFast requires HTTPS for live ITN callbacks
5. **IP whitelisting**: Consider restricting ITN callbacks to PayFast IPs

## PayFast IP Addresses (for ITN validation)

Sandbox:
- `41.74.179.194`
- `41.74.179.195`
- `41.74.179.196`
- `41.74.179.197`

Live:
- Check PayFast documentation for current IP ranges

## Support Resources

- [PayFast Documentation](https://developers.payfast.co.za/)
- [PayFast Sandbox](https://sandbox.payfast.co.za/)
- [PayFast Support](https://www.payfast.co.za/contact)

## Next Steps

1. ✅ **Immediate**: Add PayFast credentials to environment
2. ✅ **Testing**: Verify sandbox payments work
3. ✅ **Production**: Set up live credentials when ready
4. ⚠️ **Monitoring**: Set up alerts for payment failures
5. ⚠️ **Documentation**: Update internal docs with credentials location

---

**Status**: Configuration required before payment features can be used.

**Priority**: High - Blocking seller applications and order payments.
