# Deployment Guide - Claim Readiness Diagnostic

This guide provides step-by-step instructions for deploying the Claim Readiness Diagnostic to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Stripe Account**: For payment processing
4. **Calendly Account**: For appointment scheduling

## Quick Deploy

### Option 1: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
npm run deploy:preview

# After testing, deploy to production
npm run deploy
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project settings (see below)
4. Click "Deploy"

## Configuration

### 1. Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `STRIPE_PRICE_ID` | Stripe price ID for service | `price_...` |
| `CALENDLY_LINK` | Your Calendly scheduling URL | `https://calendly.com/username/event` |
| `DOMAIN` | Your production domain | `https://yourdomain.com` |

**Important:** Set variables for all environments (Production, Preview, Development)

### 2. Project Settings

In Vercel Dashboard → Settings:

- **Framework Preset**: None (vanilla JavaScript)
- **Build Command**: Leave empty
- **Output Directory**: `.` (root)
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or higher

### 3. Domain Configuration

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued (automatic)

## Deployment Workflow

### Development Workflow

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Run tests
npm test

# 4. Deploy to preview
npm run deploy:preview

# 5. Test preview deployment
VERCEL_URL=https://your-preview-url.vercel.app npm run verify:deployment

# 6. If tests pass, deploy to production
npm run deploy
```

### Continuous Deployment

Vercel automatically deploys:
- **Preview deployments**: Every push to any branch
- **Production deployments**: Every push to `main` branch (if configured)

To enable automatic production deployments:
1. Go to Settings → Git
2. Enable "Production Branch"
3. Set to `main` or your preferred branch

## Testing Deployment

### Automated Testing

Run the verification script:

```bash
# Test local development
DOMAIN=http://localhost:3000 npm run verify:deployment

# Test preview deployment
VERCEL_URL=https://your-preview-url.vercel.app npm run verify:deployment

# Test production
VERCEL_URL=https://yourdomain.com npm run verify:deployment
```

### Manual Testing

1. **Homepage**: Visit root URL, should show diagnostic intro
2. **Complete Flow**: Answer all 5 questions
3. **Recommendation**: Verify correct recommendation displays
4. **Transparency**: Check assessment breakdown
5. **Calendly**: Click CTA, verify popup opens
6. **Payment**: Test with Stripe test card `4242 4242 4242 4242`
7. **Success**: Verify redirect to success page

### Test Cards (Stripe Test Mode)

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date and any 3-digit CVC.

## Monitoring

### Vercel Dashboard

Monitor your deployment:
1. **Deployments**: View all deployments and their status
2. **Logs**: Real-time function logs
3. **Analytics**: Traffic and performance metrics
4. **Speed Insights**: Core Web Vitals

### Function Logs

View serverless function logs:
1. Go to Deployments → Select deployment
2. Click "Functions" tab
3. Select function to view logs

### Error Tracking

Check for errors:
```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Working

**Symptoms**: API calls fail, Stripe/Calendly not working

**Solution**:
- Verify variables are set in Vercel Dashboard
- Check variable names (case-sensitive)
- Redeploy after adding variables
- Ensure variables are set for correct environment

#### 2. API Endpoints Return 404

**Symptoms**: `/api/log-diagnostic` or other endpoints not found

**Solution**:
- Verify `/api` directory exists in root
- Check file names match exactly
- Ensure files export a default function
- Redeploy

#### 3. CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solution**:
- Verify `vercel.json` has CORS headers
- Check headers are applied to `/api/*` routes
- Clear browser cache
- Redeploy

#### 4. Data Not Being Logged

**Symptoms**: Diagnostic completions not saved

**Solution**:
- Check `/data` directory exists
- Verify function has write permissions
- Check function logs for errors
- Test endpoint manually with curl

#### 5. Slow Performance

**Symptoms**: Lighthouse score < 90, slow load times

**Solution**:
- Verify CSS is inlined
- Check JavaScript is minified
- Ensure images are optimized
- Use Vercel Analytics to identify bottlenecks

### Getting Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **Function Logs**: Check Vercel Dashboard → Logs
4. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Rollback

If deployment has issues:

```bash
# Rollback to previous deployment
vercel rollback
```

Or via Dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

## Performance Optimization

### Vercel Edge Network

Vercel automatically:
- Serves static files from global CDN
- Caches responses
- Compresses assets
- Provides automatic HTTPS

### Custom Optimizations

Already implemented:
- Inlined CSS (no external stylesheets)
- Minimal JavaScript bundle
- Efficient DOM manipulation
- Optimized animations
- Lazy loading where appropriate

### Monitoring Performance

Use Vercel Analytics:
1. Enable in Settings → Analytics
2. View Core Web Vitals
3. Monitor Real Experience Score
4. Track performance over time

## Security

### Best Practices

- ✅ Environment variables for secrets
- ✅ HTTPS enforced (automatic)
- ✅ CORS configured properly
- ✅ No secrets in code
- ✅ Input validation on API endpoints
- ✅ Stripe webhook signature verification

### Stripe Security

1. **Use webhook secrets**: Verify webhook signatures
2. **Test mode first**: Test thoroughly before going live
3. **Monitor dashboard**: Check for suspicious activity
4. **Rotate keys**: If compromised, rotate immediately

## Going Live

### Pre-Launch Checklist

- [ ] All tests pass
- [ ] Environment variables set for production
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Stripe in live mode (not test mode)
- [ ] Calendly link is correct
- [ ] Cross-browser testing complete
- [ ] Performance testing complete
- [ ] Error monitoring set up
- [ ] Backup plan in place

### Launch Steps

1. Switch Stripe to live mode
2. Update environment variables with live keys
3. Deploy to production
4. Run verification tests
5. Monitor for 24 hours
6. Announce launch

### Post-Launch

- Monitor error rates
- Check function logs daily
- Review analytics weekly
- Gather user feedback
- Plan improvements

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor uptime

**Weekly**:
- Review analytics
- Check performance metrics
- Update dependencies if needed

**Monthly**:
- Review diagnostic data
- Analyze conversion rates
- Plan feature improvements

### Updates

To deploy updates:
```bash
# 1. Make changes
# 2. Test locally
npm test

# 3. Deploy to preview
npm run deploy:preview

# 4. Test preview
# 5. Deploy to production
npm run deploy
```

## Support

For issues or questions:
1. Check this guide
2. Review DEPLOYMENT_CHECKLIST.md
3. Check Vercel documentation
4. Contact Vercel support

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Stripe Documentation](https://stripe.com/docs)
- [Calendly API](https://developer.calendly.com/)
- [Web Vitals](https://web.dev/vitals/)
