# 🚀 Quick Setup: Payment + Booking

## What You Need Right Now

### 1. Get Your Stripe Publishable Key

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Open `booking.html`
4. Find line ~470 and replace:
   ```javascript
   const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
   ```
   With:
   ```javascript
   const stripe = Stripe('pk_test_YOUR_ACTUAL_KEY_HERE');
   ```

### 2. Check Your `.env` File

Make sure you have a `.env` file with:
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRICE_ID=price_xxxxx
DOMAIN=http://localhost:3001
```

If you don't have these values, get them from your Stripe dashboard.

### 3. Restart the Server

Stop the current server (Ctrl+C) and restart:
```bash
node local-server.js
```

### 4. Test It!

1. Open: `http://localhost:3001/diagnostic.html`
2. Complete the diagnostic
3. Click "Book Claim Readiness Review"
4. You should see the payment page
5. Click "Pay $225 & Schedule Appointment"
6. Use test card: `4242 4242 4242 4242`
7. After payment, Cal.com widget should appear

## Current Issues Fixed

✅ **"lucide is not defined"** - Fixed script loading order
✅ **"Cal is not defined"** - Fixed Cal.com initialization
✅ **Payment before booking** - Added Stripe checkout first
✅ **$225 payment** - Integrated payment flow

## What Happens Now

1. **Payment Section Shows First** - User sees $225 payment button
2. **Stripe Checkout** - User pays via Stripe
3. **Cal.com Widget Appears** - After successful payment
4. **User Books Appointment** - Selects time slot

## Test Card Numbers

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

Use any future expiry date and any 3-digit CVC.

## Still Having Issues?

### Lucide Icons Not Showing?
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors

### Stripe Not Working?
- Verify you updated the publishable key in `booking.html`
- Check `.env` file has correct keys
- Restart the server

### Cal.com Not Loading?
- Check browser console for errors
- Verify Cal.com event link: `mdnexus-lkd3ut/claim-readiness-review`
- Make sure payment completed successfully

---

**Quick Checklist:**
- [ ] Updated Stripe key in `booking.html` (line ~470)
- [ ] `.env` file has Stripe keys
- [ ] Server restarted
- [ ] Tested with card 4242 4242 4242 4242
- [ ] Cal.com widget appears after payment

**Need your Stripe keys?** https://dashboard.stripe.com/test/apikeys
