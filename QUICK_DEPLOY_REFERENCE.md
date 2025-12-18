# Quick Deploy Reference Card

## 🚀 Deploy in 3 Steps

### 1. Set Environment Variables in Vercel

Go to Vercel Dashboard → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
CALENDLY_LINK=https://calendly.com/username/event
DOMAIN=https://yourdomain.com
```

### 2. Deploy

```bash
# Preview first
npm run deploy:preview

# Then production
npm run deploy
```

### 3. Verify

```bash
# Test deployment
VERCEL_URL=https://your-url.vercel.app npm run verify:deployment
```

---

## 📋 Quick Checklist

- [ ] Environment variables set
- [ ] Tests pass locally
- [ ] Deploy to preview
- [ ] Test preview deployment
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

## 🧪 Test Stripe Payment

Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 🔧 Troubleshooting

**API 404?** Check `/api` directory exists

**CORS errors?** Verify `vercel.json` headers

**Env vars not working?** Redeploy after setting

**Rollback:** `vercel rollback`

---

## 📚 Full Documentation

- **DEPLOYMENT_GUIDE.md** - Complete guide
- **DEPLOYMENT_CHECKLIST.md** - Detailed checklist
- **DEPLOYMENT_READY.md** - Task completion summary

---

## 🆘 Need Help?

1. Check Vercel logs: `vercel logs`
2. Review documentation above
3. Visit [vercel.com/docs](https://vercel.com/docs)
