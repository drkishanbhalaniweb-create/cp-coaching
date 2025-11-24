# 🚀 Quick Setup Guide

## Step 1: Get Your Stripe Credentials

### Create a Product in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Products** in the left sidebar
3. Click **+ Add Product**
4. Fill in:
   - **Name**: C&P Exam Coaching Session
   - **Description**: 60-minute one-on-one C&P exam preparation coaching
   - **Price**: $150.00 USD
   - **Billing**: One-time
5. Click **Save product**
6. **Copy the Price ID** (starts with `price_`) - you'll need this!

### Get Your API Keys

1. Go to [API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

**Important**: Start with TEST keys. Switch to LIVE keys only when ready for production!

---

## Step 2: Get Your Calendly Link

1. Go to [Calendly Event Types](https://calendly.com/event_types/user/me)
2. Create a new event type or select existing:
   - **Event name**: C&P Exam Coaching Session
   - **Duration**: 60 minutes
   - **Location**: Phone call or Zoom
3. Click on the event to open settings
4. Copy the scheduling link (e.g., `https://calendly.com/your-username/cp-exam-coaching`)

---

## Step 3: Configure Your Project

### Option A: Automatic Setup (Recommended)

Run the setup script:
```bash
node setup.js
```

It will ask you for:
- Stripe Secret Key
- Stripe Publishable Key
- Stripe Price ID
- Calendly Link
- Domain (use `http://localhost:3000` for testing)

### Option B: Manual Setup

1. **Create `.env` file** in the project root:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_PRICE_ID=price_YOUR_PRICE_ID
CALENDLY_LINK=https://calendly.com/your-username/cp-exam-coaching
DOMAIN=http://localhost:3000
```

2. **Update `index.html`** (line 1224):
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY';
```

3. **Update `success.html`** (line 177):
```javascript
const calendlyUrl = 'https://calendly.com/your-username/cp-exam-coaching';
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Test Locally

```bash
npm run dev
```

Then visit: `http://localhost:3000`

### Test the Payment Flow

1. Click the green **"Schedule My C&P Coaching Session – $150"** button
2. You'll be redirected to Stripe Checkout
3. Use test card: **4242 4242 4242 4242**
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the payment
5. You should be redirected to the success page with Calendly

---

## Step 6: Deploy to Vercel

### First Time Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? **No**
   - Project name? **cp-exam-coaching** (or your choice)
   - Directory? **./** (press Enter)

### Add Environment Variables in Vercel

After first deployment:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `STRIPE_SECRET_KEY` = `sk_test_...` (later change to `sk_live_...`)
   - `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (later change to `pk_live_...`)
   - `STRIPE_PRICE_ID` = `price_...`
   - `CALENDLY_LINK` = `https://calendly.com/...`
   - `DOMAIN` = `https://your-domain.vercel.app`

5. Redeploy:
```bash
vercel --prod
```

---

## Step 7: Switch to Production (When Ready)

### In Stripe:
1. Go to Stripe Dashboard
2. Toggle from **Test mode** to **Live mode** (top right)
3. Create the same product in live mode
4. Get your LIVE API keys and Price ID

### In Vercel:
1. Update environment variables with LIVE keys
2. Update `DOMAIN` to your production URL
3. Redeploy

### In Your Code:
1. Update `index.html` with live publishable key
2. Redeploy to Vercel

---

## 🎯 Quick Checklist

- [ ] Stripe account created
- [ ] Product created in Stripe ($150)
- [ ] Stripe API keys copied
- [ ] Calendly account created
- [ ] Calendly event created (60 min)
- [ ] Calendly link copied
- [ ] `.env` file created with all credentials
- [ ] `index.html` updated with Stripe key
- [ ] `success.html` updated with Calendly link
- [ ] Dependencies installed (`npm install`)
- [ ] Tested locally (`npm run dev`)
- [ ] Payment flow tested with test card
- [ ] Deployed to Vercel
- [ ] Environment variables added in Vercel
- [ ] Production deployment tested

---

## 🆘 Need Help?

### Common Issues:

**"Stripe is not defined" error**
- Make sure Stripe.js is loaded in `index.html`
- Check that publishable key is correct

**Payment button does nothing**
- Open browser console (F12) to see errors
- Verify API endpoint `/api/create-checkout-session` is accessible
- Check that `.env` file exists with correct keys

**Calendly doesn't show**
- Verify Calendly link is correct and public
- Check browser console for errors
- Make sure event is active in Calendly

**Vercel deployment fails**
- Ensure all environment variables are set
- Check Vercel function logs
- Verify `vercel.json` is present

---

## 📞 Support Resources

- **Stripe Docs**: https://stripe.com/docs/payments/checkout
- **Calendly API**: https://developer.calendly.com/
- **Vercel Docs**: https://vercel.com/docs

---

## 🎉 You're All Set!

Once everything is configured, your landing page will:
1. Accept $150 payments via Stripe
2. Redirect to success page after payment
3. Show Calendly widget for scheduling
4. Send confirmation emails automatically

**Good luck with your C&P Exam Coaching service!** 🇺🇸
