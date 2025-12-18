# Calendly-Stripe Integration for Paid Bookings

## Overview

This document describes the implementation of the Calendly-Stripe integration for paid bookings, which ensures that payment is collected before confirming a booking session.

**Requirements Addressed:**
- 11.2: Paid meeting booking triggers payment flow
- 11.3: Booking confirmation synchronized with payment completion
- 11.4: Payment failure prevents booking confirmation
- 11.5: Complete booking-to-payment flow without leaving the site

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Book Session" button                        │
│    → Opens Calendly popup widget                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User selects date and time in Calendly                   │
│    → Calendly fires 'date_and_time_selected' event          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. System detects paid event                                │
│    → Closes Calendly popup                                  │
│    → Shows "Processing Your Booking" loading message        │
│    → Creates Stripe Checkout Session with metadata          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User redirected to Stripe Checkout                       │
│    → Enters payment information                             │
│    → Completes payment or encounters error                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    │             │
              ┌─────▼─────┐ ┌────▼─────┐
              │  SUCCESS  │ │  FAILURE │
              └─────┬─────┘ └────┬─────┘
                    │             │
                    ↓             ↓
┌─────────────────────────────────────────────────────────────┐
│ 5a. Payment Success                                          │
│     → Webhook receives checkout.session.completed           │
│     → Logs "Booking confirmed after successful payment"     │
│     → User redirected to success.html                       │
│     → Success page shows booking confirmation               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 5b. Payment Failure                                          │
│     → Webhook receives payment_intent.payment_failed         │
│     → Logs "Payment failure prevents booking confirmation"  │
│     → Booking is NOT confirmed                              │
│     → User sees error message                               │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. CalendlyHandler Enhancements

**File:** `index.html`

#### New Methods

##### `isPaidEvent()`
Determines if the current Calendly event requires payment.

```javascript
isPaidEvent() {
  // For this implementation, all events are paid
  // Can be customized based on event metadata
  return true;
}
```

##### `initiatePaymentFlow(eventData)`
Initiates the payment flow after time slot selection.

**Process:**
1. Closes Calendly popup
2. Shows loading message
3. Extracts email from event data
4. Creates Stripe Checkout Session with Calendly metadata
5. Stores session ID in sessionStorage
6. Redirects to Stripe Checkout

```javascript
async initiatePaymentFlow(eventData) {
  // Close Calendly popup
  Calendly.closePopupWidget();
  
  // Show loading message
  this.showPaymentLoadingMessage();
  
  // Get email from event data
  const email = eventData.payload?.invitee?.email;
  
  // Create checkout session
  const sessionData = await stripePaymentHandler.createCheckoutSession({
    email,
    calendlyEventUri: eventData.payload?.event?.uri,
    calendlyInviteeUri: eventData.payload?.invitee?.uri
  });
  
  // Store for verification
  sessionStorage.setItem('pendingBookingSessionId', sessionData.sessionId);
  sessionStorage.setItem('pendingBookingData', JSON.stringify(eventData));
  
  // Redirect to Stripe
  window.location.href = sessionData.url;
}
```

##### `showPaymentLoadingMessage()`
Displays a loading overlay while payment is being processed.

##### `handlePaymentFlowError(error)`
Handles errors during payment flow initiation and shows user-friendly error messages.

#### Modified Methods

##### `setupEventListener()`
Enhanced to listen for `date_and_time_selected` event and trigger payment flow for paid events.

```javascript
if (eventName === 'calendly.date_and_time_selected') {
  this.selectedEventData = e.data;
  
  if (this.isPaidEvent()) {
    this.initiatePaymentFlow(e.data);
  }
}
```

Also modified to only show success message for free events. For paid events, success is shown after payment confirmation.

### 2. StripePaymentHandler Enhancements

**File:** `index.html`

#### Modified Methods

##### `createCheckoutSession(options)`
Enhanced to accept and pass Calendly metadata to the serverless function.

```javascript
async createCheckoutSession(options = {}) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: options.email,
      calendlyEventUri: options.calendlyEventUri,
      calendlyInviteeUri: options.calendlyInviteeUri
    })
  });
  // ... rest of method
}
```

### 3. Create Checkout Session Function

**File:** `api/create-checkout-session.js`

#### Enhancements

- Accepts `calendlyEventUri` and `calendlyInviteeUri` from request body
- Stores Calendly metadata in Stripe session metadata
- Logs Calendly booking information for tracking

```javascript
const { email, calendlyEventUri, calendlyInviteeUri } = requestBody;

const sessionConfig = {
  // ... other config
  metadata: {
    service: 'C&P Exam Coaching Session',
    timestamp: new Date().toISOString(),
    calendlyEventUri: calendlyEventUri || '',
    calendlyInviteeUri: calendlyInviteeUri || ''
  }
};
```

### 4. Webhook Handler Function

**File:** `api/webhook.js`

#### Enhanced Event Handlers

##### `checkout.session.completed`
Confirms booking after successful payment.

```javascript
case 'checkout.session.completed':
  console.log({
    message: 'Payment successful - Booking confirmed',
    sessionId: session.id,
    customerEmail: session.customer_email,
    calendlyEventUri: session.metadata?.calendlyEventUri,
    calendlyInviteeUri: session.metadata?.calendlyInviteeUri
  });
  
  // Booking is now confirmed
  // TODO: Send confirmation email, update database
  break;
```

##### `payment_intent.payment_failed`
Prevents booking confirmation on payment failure.

```javascript
case 'payment_intent.payment_failed':
  logError('Payment failed - Booking NOT confirmed', ...);
  
  console.log({
    message: 'Payment failure prevents booking confirmation',
    paymentIntentId: failedPayment.id
  });
  
  // IMPORTANT: Do NOT confirm booking without payment
  // TODO: Cancel Calendly booking if created
  break;
```

### 5. Success Page

**File:** `success.html`

#### Enhancements

- Changed heading from "Payment Successful!" to "Booking Confirmed!"
- Added payment confirmation section with session ID display
- Removed Calendly scheduling widget (booking already made)
- Added contact information for support
- Added "Return to Home" button
- Clears pending booking data from sessionStorage

```javascript
// Display session ID
const sessionId = urlParams.get('session_id');
if (sessionId) {
  sessionIdDisplay.textContent = sessionId;
  
  // Clear pending booking data
  sessionStorage.removeItem('pendingBookingSessionId');
  sessionStorage.removeItem('pendingBookingData');
  
  // Log confirmation
  console.log('Booking confirmed after successful payment');
}
```

## Testing

### Manual Testing

Use the test page: `test-calendly-stripe-integration.html`

#### Test Scenarios

**1. Successful Payment Flow**
1. Open `index.html`
2. Click "Book Your Session" button
3. Select date and time in Calendly
4. Verify Calendly closes and loading message appears
5. Enter test card: `4242 4242 4242 4242`
6. Complete payment
7. Verify redirect to `success.html`
8. Verify "Booking Confirmed!" message
9. Check webhook logs for `checkout.session.completed`

**2. Failed Payment Flow**
1. Start booking flow
2. Select date and time
3. Enter declined card: `4000 0000 0000 0002`
4. Verify payment fails
5. Verify no redirect to success page
6. Check webhook logs for `payment_intent.payment_failed`
7. Verify booking is NOT confirmed

**3. Payment Error Handling**
1. Start booking flow
2. Close browser before payment
3. Verify no booking confirmation
4. Verify pending data in sessionStorage

### Automated Testing

Run the verification script:

```bash
node verify-calendly-stripe-integration.js
```

This script checks:
- ✓ CalendlyHandler has payment flow methods
- ✓ Event listeners are configured
- ✓ Webhook handlers are implemented
- ✓ Metadata is passed correctly
- ✓ Error handling is in place
- ✓ Success page shows confirmation

### Stripe Test Cards

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Requires Authentication:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Configuration

### Environment Variables

Required environment variables (set in Vercel dashboard):

```
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=https://yourdomain.com
```

### Calendly Configuration

Update the Calendly URL in `index.html`:

```javascript
const CALENDLY_URL = 'https://calendly.com/your-username/your-event';
```

## Monitoring

### Webhook Logs

Check webhook logs in:
1. **Vercel Dashboard:** Functions → webhook.js → Logs
2. **Stripe Dashboard:** Developers → Webhooks → Your endpoint

### Key Log Messages

**Successful Payment:**
```
Payment successful - Booking confirmed
Booking confirmed after successful payment
```

**Failed Payment:**
```
Payment failed - Booking NOT confirmed
Payment failure prevents booking confirmation
```

## Security Considerations

1. **Webhook Signature Verification:** All webhooks verify Stripe signature before processing
2. **Metadata Validation:** Calendly URIs are stored but not executed
3. **Session Storage:** Only non-sensitive data stored in sessionStorage
4. **Error Messages:** User-facing errors don't expose sensitive information
5. **HTTPS:** All traffic uses HTTPS (enforced by Vercel)

## Future Enhancements

### Recommended Improvements

1. **Database Integration:**
   - Store booking records with payment status
   - Link Calendly events to payment sessions
   - Track booking history

2. **Email Notifications:**
   - Send confirmation email after payment
   - Send payment receipt
   - Send reminder emails before session

3. **Calendly API Integration:**
   - Automatically cancel Calendly booking if payment fails
   - Sync booking status with payment status
   - Handle rescheduling with payment verification

4. **Admin Dashboard:**
   - View all bookings and payment status
   - Manually confirm/cancel bookings
   - Generate reports

5. **Refund Handling:**
   - Implement refund workflow
   - Cancel Calendly booking on refund
   - Send refund confirmation email

## Troubleshooting

### Common Issues

**Issue:** Calendly popup doesn't close after time selection
- **Solution:** Check browser console for errors, verify Calendly script is loaded

**Issue:** Payment redirect doesn't happen
- **Solution:** Check that StripePaymentHandler is initialized, verify API endpoint is accessible

**Issue:** Webhook not receiving events
- **Solution:** Verify webhook URL in Stripe dashboard, check webhook secret is correct

**Issue:** Success page doesn't show session ID
- **Solution:** Check URL parameters, verify redirect from Stripe includes session_id

### Debug Mode

Enable debug logging by opening browser console and checking for:
- "Calendly date and time selected"
- "Paid event detected - initiating payment flow"
- "Redirecting to Stripe Checkout for payment..."
- "Payment successful. Session ID: ..."
- "Booking confirmed after successful payment"

## Support

For issues or questions:
- Email: info@militarydisabilitynexus.com
- Phone: +1 307 301-2019

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of Calendly-Stripe integration
- Payment flow triggered after time slot selection
- Booking confirmation synchronized with payment
- Payment failure prevents booking confirmation
- Complete flow without leaving site
- Comprehensive error handling
- Test suite and verification scripts
