# ⚡ Quick Deploy to Production

## 🚀 Fast Track (30 Minutes)

### Step 1: Update Dependencies (2 min)
```bash
npm audit fix --force
npm install
```

### Step 2: Get Live Stripe Credentials (10 min)

1. Go to https://dashboard.stripe.com
2. **Toggle to LIVE mode** (top right, switch from "Test" to "Live")
3. Create product:
   - Products → Add Product
   - Name: "C&P Exam Coaching Session"
   - Price: $150.00 USD
   - One-time payment
   - **Copy the Price ID** (starts with `price_`)

4. Get API keys:
   - Developers → API Keys
   - Copy **Publishable key** (pk_live_...)
   - Reveal and copy **Secret key** (sk_live_...)

### Step 3: Update Local Files (5 min)

**Update `.env`:**
```env
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
STRIPE_PRICE_ID=price_YOUR_LIVE_PRICE_ID_HERE
CALENDLY_LINK=https://calendly.com/dr-kishanbhalani-web/c-p-examination-coaching
DOMAIN=https://your-domain.vercel.app
```

**Update `index.html` line 1224:**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_ACTUAL_LIVE_KEY';
```

### Step 4: Deploy to Vercel (10 min)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 5: Configure Vercel Environment Variables (3 min)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add these variables (use LIVE keys):
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_PRICE_ID` = `price_...`
   - `CALENDLY_LINK` = `https://calendly.com/...`
   - `DOMAIN` = `https://your-domain.vercel.app`

5. Redeploy:
```bash
vercel --prod
```

### Step 6: Test Live Payment (5 min)

⚠️ **IMPORTANT:** Use a REAL card for testing, then immediately refund!

1. Visit your production URL
2. Click payment button
3. Use real card details
4. Complete payment
5. Verify redirect to success page
6. Check Calendly loads
7. **Immediately refund in Stripe dashboard:**
   - Payments → Find transaction → Refund

---

## 🔥 Critical Fixes Before Launch

### Fix 1: Update Vulnerable Dependencies
```bash
npm install -D vercel@latest
npm audit fix
```

### Fix 2: Add Webhook Endpoint (Optional but Recommended)

Create `api/webhook.js`:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      // TODO: Send confirmation email, log to database, etc.
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
};
```

Then in Stripe Dashboard:
1. Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.vercel.app/api/webhook`
3. Events: Select `checkout.session.completed` and `payment_intent.payment_failed`
4. Copy webhook secret
5. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET`

### Fix 3: Add Better Error Handling

Update `api/create-checkout-session.js`:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
        console.error('Missing Stripe configuration');
        return res.status(500).json({ 
            error: 'Server configuration error. Please contact support.' 
        });
    }

    try {
        const domain = process.env.DOMAIN || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/index.html`,
            metadata: {
                service: 'C&P Exam Coaching Session',
            },
            customer_email: req.body?.email || undefined,
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        
        // Don't expose internal errors to users
        res.status(500).json({ 
            error: 'Unable to process payment. Please try again or contact support.' 
        });
    }
};
```

---

## 📋 Post-Deployment Checklist

### Immediately After Deploy
- [ ] Visit production URL
- [ ] Test payment with real card
- [ ] Verify Calendly loads
- [ ] Refund test payment
- [ ] Check Vercel logs for errors
- [ ] Test on mobile device
- [ ] Test on different browser

### Within 24 Hours
- [ ] Monitor Stripe dashboard
- [ ] Check for any error emails from Vercel
- [ ] Verify SSL certificate is active
- [ ] Test from different locations
- [ ] Check page load speed
- [ ] Verify all links work
- [ ] Test contact information

### Within 1 Week
- [ ] Review first real transactions
- [ ] Check Calendly booking rate
- [ ] Monitor conversion rate
- [ ] Gather initial feedback
- [ ] Fix any reported issues
- [ ] Optimize based on analytics

---

## 🆘 Troubleshooting

### "Payment button doesn't work"
1. Check browser console (F12)
2. Verify Stripe publishable key in `index.html`
3. Check Vercel function logs
4. Ensure CORS headers are set
5. Test API endpoint directly

### "Redirects to wrong URL after payment"
1. Check `DOMAIN` environment variable in Vercel
2. Verify it matches your production URL
3. Redeploy after changing

### "Calendly doesn't load"
1. Verify Calendly link is correct
2. Check that event is active and public
3. Test Calendly link directly
4. Check browser console for errors

### "Webhook not receiving events"
1. Verify webhook URL in Stripe dashboard
2. Check webhook secret is correct
3. Test webhook with Stripe CLI
4. Check Vercel function logs

---

## 💡 Pro Tips

### Use Stripe Test Mode First
Even in production, you can toggle between test and live mode in Stripe dashboard. Start with test mode to verify everything works.

### Monitor Everything
Set up monitoring from day one:
- Vercel Analytics (built-in)
- Stripe Dashboard (check daily)
- Google Analytics (add tracking code)
- UptimeRobot (free uptime monitoring)

### Have a Rollback Plan
```bash
# If something goes wrong, rollback to previous deployment
vercel rollback
```

### Keep Test Environment
Maintain a separate test deployment:
```bash
# Deploy to preview (test environment)
vercel

# Deploy to production
vercel --prod
```

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Payment button works
- ✅ Stripe checkout loads
- ✅ Payment processes successfully
- ✅ Redirects to success page
- ✅ Calendly widget loads
- ✅ Booking can be completed
- ✅ Confirmation emails arrive
- ✅ No errors in logs
- ✅ Works on mobile
- ✅ SSL certificate active

---

## 📞 Emergency Contacts

- **Stripe Support:** https://support.stripe.com/ (24/7)
- **Vercel Support:** https://vercel.com/support
- **Calendly Support:** https://help.calendly.com/

---

## 🎉 You're Ready!

Follow these steps and you'll be live in 30 minutes!

**Questions?** Check the full documentation in `PRODUCTION_READINESS.md`

**Good luck! 🚀**
