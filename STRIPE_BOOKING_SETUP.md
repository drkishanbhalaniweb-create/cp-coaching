# Stripe + Cal.com Booking Setup

## Overview

The booking flow now requires payment before scheduling:
1. User completes diagnostic
2. Clicks "Book Claim Readiness Review"
3. Redirected to booking page
4. Pays $225 via Stripe
5. After successful payment, Cal.com widget appears
6. User schedules appointment

## Setup Required

### 1. Update Stripe Publishable Key

In `booking.html` (line ~470), replace:
```javascript
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
```

With your actual Stripe publishable key:
```javascript
const stripe = Stripe('pk_live_xxxxxxxxxxxxx'); // or pk_test_ for testing
```

### 2. Environment Variables

Ensure these are set in your `.env` file (for local) and Vercel (for production):

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
DOMAIN=https://your-domain.vercel.app
```

### 3. Create Stripe Price

1. Go to Stripe Dashboard → Products
2. Create a new product: "Claim Readiness Review"
3. Set price: $225.00
4. Copy the Price ID (starts with `price_`)
5. Add to environment variables

## Testing Locally

### 1. Update `.env` file

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
DOMAIN=http://localhost:3001
```

### 2. Update `booking.html`

Replace the Stripe key on line ~470:
```javascript
const stripe = Stripe('pk_test_xxxxxxxxxxxxx');
```

### 3. Test the Flow

1. Open `http://localhost:3001/diagnostic.html`
2. Complete diagnostic
3. Click "Book Claim Readiness Review"
4. Click "Pay $225 & Schedule Appointment"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Any future date, any CVC
7. After payment, Cal.com widget should appear

## Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

## User Flow

```
1. Diagnostic Complete
   ↓
2. Click "Book Claim Readiness Review"
   ↓
3. Redirected to /booking.html
   ↓
4. See payment section ($225)
   ↓
5. Click "Pay $225 & Schedule Appointment"
   ↓
6. Stripe Checkout opens
   ↓
7. Enter payment details
   ↓
8. Payment successful
   ↓
9. Redirected to /booking.html?payment_success=true
   ↓
10. Cal.com widget appears
   ↓
11. User selects time slot
   ↓
12. Appointment booked!
```

## Files Modified

- `booking.html` - Added payment section and Stripe integration
- `api/create-checkout-session.js` - Updated success URL to redirect to booking page
- `diagnostic-main.js` - Removed Calendly references

## Security Notes

1. **Never commit Stripe keys to git**
2. Use test keys for development
3. Use live keys only in production
4. Store keys in environment variables
5. Rotate keys if exposed

## Troubleshooting

### "Stripe is not defined"

- Check that Stripe.js is loaded: `<script src="https://js.stripe.com/v3/"></script>`
- Ensure script loads before your code runs

### "lucide is not defined"

- Check that Lucide is loaded: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`
- Use `window.addEventListener('load', ...)` to wait for all scripts

### "Cal is not defined"

- Cal.com script loads asynchronously
- Check browser console for loading errors
- Verify Cal.com event link is correct

### Payment works but Cal.com doesn't show

- Check URL has `?payment_success=true` parameter
- Verify Cal.com script loaded successfully
- Check browser console for errors

## Production Deployment

### 1. Set Vercel Environment Variables

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_PRICE_ID
vercel env add DOMAIN
```

### 2. Update booking.html

Replace test key with production key:
```javascript
const stripe = Stripe('pk_live_xxxxxxxxxxxxx');
```

### 3. Deploy

```bash
git add .
git commit -m "Add Stripe payment before Cal.com booking"
git push
```

### 4. Test Production

1. Complete diagnostic on production site
2. Test payment with real card (or test card in test mode)
3. Verify Cal.com widget appears after payment
4. Book test appointment

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Cal.com Docs**: https://cal.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing

---

**Next Steps:**
1. Get your Stripe keys from dashboard
2. Update `booking.html` with publishable key
3. Set environment variables
4. Test locally
5. Deploy to production
