# Quick Start: Calendly-Stripe Integration

## 🚀 Quick Setup (5 Minutes)

### 1. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=https://yourdomain.com
```

### 2. Update Calendly URL

In `index.html`, find and update:

```javascript
const CALENDLY_URL = 'https://calendly.com/your-username/your-event';
```

### 3. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded`
   - `charge.refunded`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Deploy to Vercel

```bash
vercel --prod
```

## ✅ Quick Test (2 Minutes)

### Test Successful Payment:

1. Open your deployed site
2. Click "Book Your Session"
3. Select any date/time in Calendly
4. Use test card: **4242 4242 4242 4242**
5. Complete payment
6. ✅ Should see "Booking Confirmed!"

### Test Failed Payment:

1. Start booking flow again
2. Select date/time
3. Use declined card: **4000 0000 0000 0002**
4. ✅ Should see payment error
5. ✅ Should NOT see booking confirmation

## 🔍 Quick Verification

### Check Webhook Logs:

**Vercel:**
1. Dashboard → Your Project → Functions
2. Click `webhook.js`
3. View logs

**Look for:**
- ✅ "Payment successful - Booking confirmed"
- ✅ "Payment failure prevents booking confirmation"

**Stripe:**
1. Dashboard → Developers → Webhooks
2. Click your endpoint
3. View recent events

## 📋 Quick Troubleshooting

### Issue: Calendly doesn't close after time selection
**Fix:** Check browser console for errors

### Issue: No redirect to Stripe
**Fix:** Verify `STRIPE_PUBLISHABLE_KEY` is set correctly

### Issue: Webhook not receiving events
**Fix:** Verify webhook URL and secret in Stripe dashboard

### Issue: Success page doesn't show session ID
**Fix:** Check URL has `?session_id=` parameter

## 🧪 Test Page

Open `test-calendly-stripe-integration.html` for:
- Complete flow diagram
- Test checklist
- Stripe test cards
- Quick actions

## 📖 Full Documentation

For complete details, see:
- `CALENDLY_STRIPE_INTEGRATION.md` - Full documentation
- `TASK_12_IMPLEMENTATION_SUMMARY.md` - Implementation summary

## 🎯 What This Does

1. **User books session** → Calendly opens
2. **User selects time** → Payment flow starts
3. **User pays** → Stripe processes payment
4. **Payment succeeds** → Booking confirmed ✅
5. **Payment fails** → Booking NOT confirmed ❌

## 🔐 Security Notes

- ✅ All payments processed by Stripe (PCI compliant)
- ✅ Webhook signatures verified
- ✅ No sensitive data in frontend
- ✅ HTTPS enforced

## 📞 Support

Questions? Contact:
- Email: info@militarydisabilitynexus.com
- Phone: +1 307 301-2019

## ✨ That's It!

Your Calendly-Stripe integration is ready to accept paid bookings!
