# Stripe Configuration Guide

## Where to Update Stripe Information in Codebase

### 1. **`.env.example`** - Environment Variables Template
**Location**: Root directory → `.env.example`

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_PRICE_ID=price_your_price_id_here
```

**What to update:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)
- `STRIPE_PRICE_ID` - Your Stripe price ID (starts with `price_`)

---

### 2. **`booking.html`** - Frontend Stripe Key
**Location**: Root directory → `booking.html` → Line ~534

```javascript
// Initialize Stripe
const stripe = Stripe('pk_live_51SVcFoGp9b54FZ4DnEJBUFWqKZ3lSP8QDxjLfhkX8fJyM4qJAR6aWfBWfDsjTBmwE3YDbE6kyUpWHLiH1XXz9jEt00YH4ZDUkq');
```

**What to update:**
- Replace the key with your **Stripe Publishable Key** (starts with `pk_`)
- This is the public key used on the frontend

**How to find it:**
1. Open `booking.html` in editor
2. Search for: `const stripe = Stripe(`
3. Replace the key inside the quotes

---

### 3. **`api/create-checkout-session.js`** - Backend API
**Location**: `api/` folder → `create-checkout-session.js`

This file uses environment variables:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// ...
price: process.env.STRIPE_PRICE_ID,
```

**What to update:**
- Set `STRIPE_SECRET_KEY` in environment variables
- Set `STRIPE_PRICE_ID` in environment variables

**No code changes needed** - Just update `.env` file

---

### 4. **`local-server.js`** - Local Development Server
**Location**: Root directory → `local-server.js`

This file uses environment variables:
```javascript
const stripe = require('stripe')((process.env.STRIPE_SECRET_KEY || '').trim());
// ...
price: process.env.STRIPE_PRICE_ID,
```

**What to update:**
- Set `STRIPE_SECRET_KEY` in `.env` file
- Set `STRIPE_PRICE_ID` in `.env` file

**No code changes needed** - Just update `.env` file

---

## Quick Summary: Where to Change What

| What | Where | How |
|------|-------|-----|
| **Secret Key** | `.env` file | `STRIPE_SECRET_KEY=sk_...` |
| **Publishable Key (Frontend)** | `booking.html` line ~534 | Replace in `Stripe('pk_...')` |
| **Publishable Key (Env)** | `.env` file | `STRIPE_PUBLISHABLE_KEY=pk_...` |
| **Price ID** | `.env` file | `STRIPE_PRICE_ID=price_...` |

---

## Step-by-Step: Update Stripe Configuration

### For Local Development

1. **Create `.env` file** (if not exists)
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
   DOMAIN=http://localhost:3001
   ```

3. **Update `booking.html`** (line ~534)
   ```javascript
   const stripe = Stripe('pk_test_xxxxxxxxxxxxx');
   ```

4. **Restart server**
   ```bash
   node local-server.js
   ```

### For Production (Vercel)

1. **Update `.env` file** with live keys
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
   DOMAIN=https://your-domain.vercel.app
   ```

2. **Update `booking.html`** (line ~534)
   ```javascript
   const stripe = Stripe('pk_live_xxxxxxxxxxxxx');
   ```

3. **Set Vercel Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all Stripe keys

4. **Deploy**
   ```bash
   git push
   ```

---

## Finding Your Stripe Keys

### Get Keys from Stripe Dashboard

1. Go to **https://dashboard.stripe.com**
2. Click **"Developers"** in left sidebar
3. Click **"API Keys"**
4. You'll see:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### Get Price ID

1. Go to **https://dashboard.stripe.com**
2. Click **"Products"** in left sidebar
3. Click your product (e.g., "Claim Readiness Review")
4. Scroll to **"Pricing"** section
5. Your Price ID is shown (starts with `price_`)

---

## Files That Use Stripe Configuration

```
Codebase Structure:
├── .env                          ← Update here (local)
├── .env.example                  ← Template
├── booking.html                  ← Update publishable key here
├── api/
│   ├── create-checkout-session.js ← Uses env variables
│   └── webhook.js                ← Uses env variables
├── local-server.js               ← Uses env variables
└── vercel.json                   ← Vercel config
```

---

## Environment Variables Used

| Variable | Used In | Purpose |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | `api/create-checkout-session.js`, `local-server.js` | Backend authentication |
| `STRIPE_PUBLISHABLE_KEY` | `booking.html` | Frontend Stripe initialization |
| `STRIPE_PRICE_ID` | `api/create-checkout-session.js`, `local-server.js` | Which product to charge |
| `DOMAIN` | `api/create-checkout-session.js` | Redirect URL after payment |

---

## Testing vs Production

### Test Mode
- Use keys starting with `sk_test_` and `pk_test_`
- Use test card: `4242 4242 4242 4242`
- No real charges

### Live Mode
- Use keys starting with `sk_live_` and `pk_live_`
- Real charges will be processed
- Use real cards

---

## Common Issues

### "Missing STRIPE_PRICE_ID"
- Check `.env` file has `STRIPE_PRICE_ID=price_...`
- Restart server after updating `.env`

### "Stripe is not defined"
- Check `booking.html` has correct publishable key
- Verify Stripe script loads: `<script src="https://js.stripe.com/v3/"></script>`

### Wrong Amount Charged
- Check `STRIPE_PRICE_ID` points to correct price in Stripe
- Verify price amount in Stripe dashboard

---

## Summary

**To change Stripe configuration:**

1. **Local**: Update `.env` file + `booking.html` line ~534
2. **Production**: Update Vercel environment variables + `booking.html` line ~534
3. **Restart** server/redeploy after changes

That's it! 🎉
