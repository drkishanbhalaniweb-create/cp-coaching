# C&P Exam Coaching Landing Page

A professional landing page with integrated Stripe payment processing and Calendly scheduling for C&P Exam Coaching sessions.

## 🎯 Features

- **Stripe Integration**: Secure $150 payment processing
- **Calendly Integration**: Automatic scheduling after successful payment
- **Serverless Architecture**: Ready for Vercel deployment
- **Responsive Design**: Works on all devices
- **Professional UI**: Veteran-focused design

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A Stripe account ([Sign up here](https://dashboard.stripe.com/register))
- A Calendly account ([Sign up here](https://calendly.com/signup))
- A Vercel account for deployment ([Sign up here](https://vercel.com/signup))

### Setup Instructions

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Stripe

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Get your **Publishable Key** (starts with `pk_test_`)
3. Get your **Secret Key** (starts with `sk_test_`)
4. Create a product for "$150 C&P Exam Coaching Session"
5. Get the **Price ID** (starts with `price_`)

#### 3. Configure Calendly

1. Go to your [Calendly Event Types](https://calendly.com/event_types/user/me)
2. Create or select an event type for "C&P Exam Coaching"
3. Copy the scheduling link (e.g., `https://calendly.com/your-username/cp-exam-coaching`)

#### 4. Run Setup Script

```bash
node setup.js
```

This interactive script will:
- Prompt you for your Stripe and Calendly credentials
- Create a `.env` file with your configuration
- Update `index.html` with your Stripe publishable key
- Update `success.html` with your Calendly link

**OR** you can manually configure:

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_PRICE_ID=price_your_price_id_here
   CALENDLY_LINK=https://calendly.com/your-username/cp-exam-coaching
   DOMAIN=http://localhost:3000
   ```

3. Update `index.html` line 1224:
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY';
   ```

4. Update `success.html` line 177:
   ```javascript
   const calendlyUrl = 'https://calendly.com/your-username/cp-exam-coaching';
   ```

#### 5. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to test the payment flow.

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Any future expiry date and any 3-digit CVC

## 📦 Deployment to Vercel

### Option 1: Using Vercel CLI

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
   npm run deploy
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from your `.env` file
   - Update `DOMAIN` to your production URL

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_ID`
   - `CALENDLY_LINK`
   - `DOMAIN` (your production URL)
5. Deploy!

## 🔧 File Structure

```
cp-exam-coaching/
├── api/
│   └── create-checkout-session.js  # Serverless function for Stripe
├── index.html                       # Main landing page
├── success.html                     # Post-payment success page with Calendly
├── package.json                     # Dependencies
├── .env.example                     # Environment variables template
├── .env                            # Your credentials (gitignored)
├── setup.js                        # Interactive setup script
└── README.md                       # This file
```

## 💳 Payment Flow

1. **User clicks "Schedule My C&P Coaching Session – $150"**
2. **JavaScript calls `/api/create-checkout-session`**
3. **Serverless function creates Stripe Checkout session**
4. **User is redirected to Stripe Checkout page**
5. **User enters payment information**
6. **After successful payment, user is redirected to `success.html`**
7. **Success page displays Calendly widget for scheduling**

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Use test keys during development
- Switch to live keys only in production
- Keep your Stripe Secret Key secure
- Use environment variables in Vercel for production

## 📝 Customization

### Update Pricing

1. Change the price in Stripe Dashboard
2. Update the new Price ID in `.env`
3. Update display prices in `index.html` (search for "$150")

### Update Calendly Event

1. Change the event type in Calendly
2. Update the link in `.env`
3. Re-run `node setup.js` or manually update `success.html`

### Styling

All styles are in the `<style>` section of `index.html`. Modify CSS variables at the top:

```css
:root {
  --primary: #163b63;
  --accent: #22c55e;
  /* ... */
}
```

## 🐛 Troubleshooting

### Payment button doesn't work

- Check browser console for errors
- Verify Stripe publishable key is correct in `index.html`
- Ensure `/api/create-checkout-session.js` is accessible

### Calendly doesn't load

- Verify Calendly link is correct in `success.html`
- Check browser console for errors
- Ensure Calendly event is active and public

### Deployment issues

- Verify all environment variables are set in Vercel
- Check Vercel function logs for errors
- Ensure `DOMAIN` environment variable matches your production URL

## 📞 Support

For issues with:
- **Stripe**: [Stripe Support](https://support.stripe.com/)
- **Calendly**: [Calendly Help Center](https://help.calendly.com/)
- **Vercel**: [Vercel Support](https://vercel.com/support)

## 📄 License

This project is for Military Disability Nexus. All rights reserved.
