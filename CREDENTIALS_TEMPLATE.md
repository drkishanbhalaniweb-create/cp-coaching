# 🔐 Credentials Template

Fill in your credentials below, then use them to configure the project.

---

## Stripe Credentials

### Test Mode (for development)
```
Publishable Key: pk_test_
Secret Key: sk_test_
Price ID: price_
```

### Live Mode (for production)
```
Publishable Key: pk_live_
Secret Key: sk_live_
Price ID: price_
```

---

## Calendly

```
Scheduling Link: https://calendly.com/
```

---

## Domain

### Development
```
http://localhost:3000
```

### Production
```
https://your-domain.vercel.app
```

---

## Where to Use These:

1. **`.env` file** - Add all credentials here
2. **`index.html` line 1224** - Add Stripe Publishable Key
3. **`success.html` line 177** - Add Calendly Link
4. **Vercel Dashboard** - Add all as environment variables

---

## Quick Copy-Paste for .env

```env
# Copy this and replace with your actual values
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
CALENDLY_LINK=https://calendly.com/YOUR_USERNAME/YOUR_EVENT
DOMAIN=http://localhost:3000
```
