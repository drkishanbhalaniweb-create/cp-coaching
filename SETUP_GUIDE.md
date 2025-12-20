# Complete Setup Guide

## Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Start local server
node local-server.js
```

Server runs at: `http://localhost:3001`

### 2. Test the Application

**Main Pages:**
- Landing: `http://localhost:3001/index.html`
- Diagnostic: `http://localhost:3001/diagnostic.html`
- Booking: `http://localhost:3001/booking.html`

**Test Flow:**
1. Complete diagnostic (5 questions)
2. View recommendation
3. Click "Book Claim Readiness Review"
4. Pay $225 via Stripe
5. Schedule appointment via Cal.com

---

## Configuration

### Stripe (Already Configured)

Your Stripe key is already set in `booking.html`:
```javascript
const stripe = Stripe('pk_live_51SVcFoGp9b54FZ4D...');
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

### Cal.com (Already Configured)

Your Cal.com event is set:
```javascript
calLink: "mdnexus-lkd3ut/claim-readiness-review"
```

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Set Environment Variables** (in Vercel Dashboard)
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_...
   DOMAIN=https://your-domain.vercel.app
   ```

3. **Deploy**
   ```bash
   git push
   ```

---

## File Structure

### Core Application Files
```
├── index.html                    # Landing page
├── diagnostic.html               # Diagnostic flow
├── booking.html                  # Payment & booking
├── success.html                  # Payment success
├── diagnostic-config.js          # Diagnostic questions
├── diagnostic-main.js            # Main diagnostic logic
├── DiagnosticController.js       # State management
├── QuestionRenderer.js           # UI rendering
├── RecommendationEngine.js       # Scoring logic
├── ScoringEngine.js              # Score calculation
├── DataLogger.js                 # Analytics
├── CalIntegration.js             # Cal.com integration
├── StripeIntegration.js          # Stripe integration
└── local-server.js               # Local dev server
```

### API Endpoints
```
├── api/
│   ├── create-checkout-session.js  # Stripe checkout
│   ├── webhook.js                  # Stripe webhooks
│   └── log-diagnostic.js           # Diagnostic logging
```

### Documentation
```
├── README.md                     # Project overview
├── SETUP_GUIDE.md               # This file
├── CAL_COM_SETUP_GUIDE.md       # Cal.com details
├── QUICK_START_CAL_COM.md       # Cal.com quick ref
├── QUICK_REFERENCE_BOOKING.md   # Booking reference
└── docs/                        # Detailed docs
```

---

## Features

### ✅ Implemented

- **Diagnostic Flow** - 5-question assessment
- **Lucide Icons** - Professional SVG icons
- **Glassmorphism UI** - Modern design
- **Stripe Payment** - $225 before booking
- **Cal.com Booking** - Appointment scheduling
- **Responsive Design** - Mobile-friendly
- **Accessibility** - WCAG compliant
- **Analytics** - Session tracking

---

## Troubleshooting

### Diagnostic Not Starting?
- Check browser console for errors
- Verify all JS files are loading
- Hard refresh: Ctrl+Shift+R

### Payment Not Working?
- Verify Stripe key in `booking.html`
- Check environment variables
- Test with card: 4242 4242 4242 4242

### Cal.com Not Loading?
- Check event link is correct
- Verify payment completed
- Check browser console

### Icons Not Showing?
- Verify Lucide script loads
- Check `lucide.createIcons()` is called
- Hard refresh browser

---

## Support

- **Stripe**: https://stripe.com/docs
- **Cal.com**: https://cal.com/docs
- **Lucide Icons**: https://lucide.dev

---

## Next Steps

1. ✅ Test locally
2. ✅ Deploy to Vercel
3. ⬜ Set up custom domain
4. ⬜ Configure email notifications
5. ⬜ Add analytics tracking
6. ⬜ Set up monitoring

---

**Everything is configured and ready to deploy!** 🚀
