# Troubleshooting Guide

## Current Issues & Solutions

### ✅ FIXED: Cal is not defined
**Problem**: Cal.com script wasn't fully loaded before trying to use it

**Solution**: Added retry logic that waits for Cal to load
- Now checks if `Cal` is defined before using it
- Retries every 100ms until Cal is available
- Fixed in `booking.html`

---

### ✅ FIXED: Stripe Test/Live Mode Mismatch
**Problem**: Error said "test mode session with live mode key"

**Current Status**: 
- ✅ Frontend: Using `pk_test_...` (test mode)
- ✅ Backend: Using `sk_test_...` (test mode)
- ✅ Both are in TEST MODE - should work now

**If still seeing error**:
1. **Hard refresh** browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache**
3. **Restart server**

---

### ✅ FIXED: Favicon 404
**Problem**: Browser looking for favicon.ico

**Solution**: Created favicon.ico from logo.png

---

## How to Test Payment Now

### Step 1: Hard Refresh
Press `Ctrl + Shift + R` to clear cache

### Step 2: Test Payment
1. Go to: `http://localhost:3001/booking.html`
2. Click "Pay $225 & Schedule Appointment"
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date
5. Any 3-digit CVC

### Step 3: After Payment
- You'll be redirected back to booking page
- Cal.com widget should appear
- Select a time slot to book

---

## Stripe Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0000 0000 9995 | ❌ Insufficient funds |

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any 5 digits

---

## Current Configuration

### Stripe Keys (Test Mode)
```
Frontend (booking.html):
  pk_test_51SVaSlPZSF0DdZds...

Backend (.env):
  STRIPE_SECRET_KEY=sk_test_51SVaSlPZSF0DdZds...
  STRIPE_PRICE_ID=price_1SgpppPZSF0DdZdsqjo5DhLd
```

### Cal.com
```
Event Link: mdnexus-lkd3ut/claim-readiness-review
```

---

## Common Errors & Fixes

### "Cal is not defined"
**Fix**: Already fixed with retry logic. If still seeing:
- Hard refresh: `Ctrl + Shift + R`
- Check browser console for Cal.com script loading errors

### "Stripe mode mismatch"
**Fix**: 
1. Verify both keys are test mode (`pk_test_` and `sk_test_`)
2. Hard refresh browser
3. Clear browser cache
4. Restart server

### "Payment failed"
**Check**:
1. `.env` file has correct `STRIPE_PRICE_ID`
2. Price exists in Stripe dashboard
3. Server is running
4. Using test card: `4242 4242 4242 4242`

### "Cal.com widget not showing"
**Check**:
1. Payment completed successfully
2. URL has `?payment_success=true` parameter
3. Browser console for errors
4. Cal.com event link is correct

---

## Verification Checklist

- [ ] Server running at `http://localhost:3001`
- [ ] `.env` file has all Stripe keys
- [ ] Both Stripe keys are TEST mode (`pk_test_` and `sk_test_`)
- [ ] Hard refreshed browser (`Ctrl + Shift + R`)
- [ ] Using test card: `4242 4242 4242 4242`
- [ ] No errors in browser console
- [ ] Payment redirects back to booking page
- [ ] Cal.com widget appears after payment

---

## If Still Having Issues

### 1. Check Server Logs
Look at terminal where server is running for errors

### 2. Check Browser Console
Press `F12` → Console tab → Look for errors

### 3. Verify Stripe Dashboard
- Go to: https://dashboard.stripe.com/test/payments
- Check if payment session was created
- Verify price amount matches

### 4. Test API Directly
```bash
curl -X POST http://localhost:3001/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"service":"claim-readiness-review","amount":22500}'
```

Should return: `{"sessionId":"cs_test_...","url":"https://checkout.stripe.com/..."}`

---

## Next Steps

1. ✅ Hard refresh browser
2. ✅ Test payment with card `4242 4242 4242 4242`
3. ✅ Verify Cal.com widget loads
4. ✅ Book test appointment

**Everything should work now!** 🎉

---

## For Production

When ready to go live:

1. **Get Live Stripe Keys**
   - Go to Stripe Dashboard
   - Switch to LIVE mode
   - Copy live keys (`pk_live_` and `sk_live_`)

2. **Update booking.html**
   ```javascript
   const stripe = Stripe('pk_live_...');
   ```

3. **Update Vercel Environment Variables**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_... (live price)
   ```

4. **Test with real card** (small amount first!)

5. **Deploy**
   ```bash
   git push
   ```
