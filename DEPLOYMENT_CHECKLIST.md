# Deployment Checklist

This checklist ensures the Claim Readiness Diagnostic is properly deployed to Vercel and all functionality works in production.

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in Vercel:

- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- [ ] `STRIPE_PRICE_ID` - Your Stripe price ID (starts with `price_`)
- [ ] `CALENDLY_LINK` - Your Calendly scheduling link
- [ ] `DOMAIN` - Your production domain (e.g., `https://yourdomain.com`)

**How to set in Vercel:**
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for Production, Preview, and Development environments

### 2. Code Review

- [ ] All tests pass locally (`npm test`)
- [ ] No console errors in browser
- [ ] All JavaScript files are properly linked in diagnostic.html
- [ ] CSS is properly inlined or linked
- [ ] No hardcoded API keys or secrets in code

### 3. Configuration Files

- [ ] `vercel.json` is properly configured
- [ ] `package.json` has correct dependencies
- [ ] `.gitignore` excludes sensitive files
- [ ] `/data` directory exists with `.gitkeep`

### 4. API Endpoints

- [ ] `/api/log-diagnostic.js` - Logs diagnostic data
- [ ] `/api/create-checkout-session.js` - Creates Stripe checkout
- [ ] `/api/webhook.js` - Handles Stripe webhooks

## Deployment Steps

### Step 1: Deploy to Preview

```bash
# Deploy to preview environment
vercel

# Or using npm script
npm run deploy
```

This creates a preview deployment with a unique URL.

### Step 2: Test Preview Deployment

Run the verification script against the preview URL:

```bash
VERCEL_URL=https://your-preview-url.vercel.app node verify-deployment.js
```

Or test manually:
- [ ] Visit the preview URL
- [ ] Complete the diagnostic flow (all 5 questions)
- [ ] Verify recommendation displays correctly
- [ ] Verify transparency layer shows correct status
- [ ] Click "Book Claim Readiness Review" button
- [ ] Verify Calendly popup opens
- [ ] Test payment flow (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify redirect to success page after payment

### Step 3: Verify API Endpoints

Test each API endpoint in preview:

**Log Diagnostic:**
```bash
curl -X POST https://your-preview-url.vercel.app/api/log-diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-01T00:00:00Z",
    "answers": {
      "service_connection": 0,
      "denial_handling": 1,
      "pathway": 0,
      "severity": 1,
      "secondaries": 0
    },
    "score": 2,
    "recommendation": "OPTIONAL_CONFIRMATION"
  }'
```

Expected response: `{"success": true, "id": "..."}`

**Create Checkout Session:**
```bash
curl -X POST https://your-preview-url.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json"
```

Expected response: Redirect URL or checkout session data

### Step 4: Cross-Browser Testing

Test on multiple browsers in preview:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Step 5: Performance Testing

Run Lighthouse audit on preview URL:
- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 90
- [ ] Best Practices score ≥ 90
- [ ] SEO score ≥ 90

### Step 6: Deploy to Production

Once preview testing is complete:

```bash
# Deploy to production
vercel --prod
```

### Step 7: Verify Production Deployment

Run verification script against production:

```bash
VERCEL_URL=https://yourdomain.com node verify-deployment.js
```

### Step 8: Post-Deployment Testing

Complete the full diagnostic flow in production:
- [ ] Homepage loads diagnostic interface
- [ ] All 5 questions display correctly
- [ ] Progress indicator updates correctly
- [ ] Scoring calculates correctly
- [ ] Recommendation displays correctly
- [ ] Transparency layer shows correct breakdown
- [ ] Calendly integration works
- [ ] Payment flow works (test with real card or test mode)
- [ ] Success page displays after payment
- [ ] Data is logged to backend

### Step 9: Monitor for Errors

Check Vercel logs for any errors:
1. Go to Vercel Dashboard → Your Project → Logs
2. Monitor for any 4xx or 5xx errors
3. Check function execution logs
4. Verify no CORS errors

### Step 10: Stripe Webhook Configuration

If using Stripe webhooks, configure the webhook endpoint:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Issue: API endpoints return 404

**Solution:** Ensure `/api` directory is in the root of your project and files are named correctly.

### Issue: Environment variables not working

**Solution:** 
1. Verify variables are set in Vercel Dashboard
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Issue: CORS errors

**Solution:** Verify `vercel.json` has CORS headers configured for `/api/*` routes.

### Issue: Data not being logged

**Solution:**
1. Check `/data` directory exists
2. Verify `/api/log-diagnostic.js` has write permissions
3. Check Vercel function logs for errors

### Issue: Calendly not loading

**Solution:**
1. Verify `CALENDLY_LINK` environment variable is set
2. Check browser console for script loading errors
3. Verify Calendly link is valid and active

### Issue: Stripe checkout fails

**Solution:**
1. Verify Stripe keys are correct (test vs. live mode)
2. Check `STRIPE_PRICE_ID` is valid
3. Verify `DOMAIN` environment variable is set correctly
4. Check Stripe Dashboard for error details

## Rollback Plan

If issues occur in production:

1. **Immediate rollback:**
   ```bash
   vercel rollback
   ```

2. **Or redeploy previous version:**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

## Monitoring

Set up monitoring for:
- [ ] Uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Error tracking (e.g., Sentry)
- [ ] Analytics (e.g., Google Analytics, Plausible)
- [ ] Vercel Analytics (built-in)

## Success Criteria

Deployment is successful when:
- ✅ All verification tests pass
- ✅ Complete diagnostic flow works end-to-end
- ✅ No console errors in browser
- ✅ No errors in Vercel function logs
- ✅ Lighthouse scores meet targets
- ✅ Cross-browser testing passes
- ✅ Payment flow works correctly
- ✅ Data logging works correctly

## Post-Deployment

- [ ] Update DNS if needed
- [ ] Configure custom domain in Vercel
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Update any external links to point to new domain
- [ ] Notify stakeholders of deployment
- [ ] Monitor for 24 hours for any issues

## Notes

- Vercel automatically handles SSL certificates
- Vercel provides automatic HTTPS redirects
- Function logs are available in Vercel Dashboard
- Preview deployments are created for every push to non-production branches
- Production deployments require explicit `--prod` flag or merge to main branch
