# Live Mode Setup Guide

This application is now configured for **LIVE MODE** Stripe payments for production.

## Required Setup Steps

### 1. Get Your Live Mode Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys (NOT test mode)
2. Make sure you're viewing **Live** keys (toggle at top right)
3. Copy your:
   - **Secret Key** (starts with `sk_live_`)
   - **Publishable Key** (starts with `pk_live_`)

### 2. Create a Live Mode Product & Price

1. Go to https://dashboard.stripe.com/products
2. Click **+ Add product**
3. Fill in details:
   - **Name**: Claim Readiness Review
   - **Price**: $225.00 USD
   - **Billing period**: One-time
4. Copy the **Price ID** (starts with `price_`)

### 3. Update Environment Variables

Update your `.env` file with your live mode credentials:

```env
# Stripe Configuration - LIVE MODE
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY
STRIPE_PRICE_ID=price_YOUR_ACTUAL_PRICE_ID

# Domain Configuration (your production domain)
DOMAIN=https://yourdomain.com
```

### 4. Update Frontend Stripe Key

In `results.html`, update the Stripe initialization:

```javascript
const stripe = Stripe('pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY');
```

## Important Notes

⚠️ **LIVE MODE MEANS REAL MONEY**
- All transactions will charge real credit cards
- Test cards will NOT work in live mode
- Ensure everything is tested before going live

✅ **Testing Before Going Live**
- Use Stripe's test mode first to verify the flow
- Test the entire payment → booking flow
- Verify webhook handling
- Check email confirmations

## Webhook Configuration

If using webhooks for booking confirmations:

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
4. Copy the signing secret to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

## Deployment Checklist

- [ ] Live mode Stripe keys added to `.env`
- [ ] Live mode price ID created and added to `.env`
- [ ] Frontend Stripe key updated to live mode
- [ ] Domain updated to production URL
- [ ] Webhooks configured (if applicable)
- [ ] SSL certificate installed (HTTPS required)
- [ ] Payment flow tested end-to-end
- [ ] Error handling verified
- [ ] Monitoring/alerts set up

## Support

For Stripe live mode issues:
- Check Stripe Dashboard → Logs for API errors
- Verify webhook delivery in Stripe Dashboard
- Review payment intent details in Stripe Dashboard
