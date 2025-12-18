# Design Document

## Overview

This design document outlines the architecture and implementation approach for redesigning the landing page with modern animations while preserving existing booking and payment workflows. The system will be built using vanilla HTML, CSS, and JavaScript to maximize performance, with strategic use of animation libraries for engaging user experiences.

The redesign maintains the current Stripe payment integration and will add Calendly scheduling capabilities. All code will be deployed on Vercel's serverless platform with static file hosting. The design prioritizes performance (targeting Lighthouse scores ≥90), accessibility (WCAG compliance), and responsive design (mobile-first approach).

### Key Design Principles

1. **Performance First**: Use vanilla JavaScript and inline CSS with custom properties to minimize bundle size and maximize Core Web Vitals scores
2. **Progressive Enhancement**: Ensure core functionality works without JavaScript, with animations enhancing the experience
3. **Accessibility**: Follow WCAG guidelines with proper ARIA labels, keyboard navigation, and respect for reduced-motion preferences
4. **Maintainability**: Use CSS custom properties for theming, modular JavaScript for animations, and clear separation of concerns

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Landing Page (index.html)                             │ │
│  │  ├─ Inline CSS with Custom Properties                  │ │
│  │  ├─ Animation Library (GSAP/Lottie)                    │ │
│  │  ├─ Stripe.js v3                                       │ │
│  │  └─ Calendly Embed Script                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Client-Side JavaScript                                │ │
│  │  ├─ Animation Controller                               │ │
│  │  ├─ Stripe Payment Handler                             │ │
│  │  └─ Calendly Integration Handler                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Static File Hosting (root directory)                  │ │
│  │  ├─ index.html                                         │ │
│  │  ├─ success.html                                       │ │
│  │  └─ assets (images, etc.)                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Serverless Functions (/api directory)                 │ │
│  │  ├─ create-checkout-session.js                         │ │
│  │  └─ webhook.js                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Stripe API      │         │  Calendly API    │          │
│  │  - Checkout      │         │  - Scheduling    │          │
│  │  - Webhooks      │         │  - Embed Widget  │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The landing page will be structured as a single-page application with the following logical components:

1. **Static Content Layer**: HTML structure with semantic markup
2. **Styling Layer**: Inline CSS using custom properties for theming
3. **Animation Layer**: JavaScript-driven animations using GSAP or Lottie
4. **Integration Layer**: Stripe and Calendly SDK integrations
5. **Backend Layer**: Serverless functions for payment processing

## Components and Interfaces

### Frontend Components

#### 1. Animation Controller

**Purpose**: Manages all page animations including scroll-triggered effects, hover states, and entrance animations.

**Responsibilities**:
- Initialize animation library (GSAP or Lottie)
- Set up scroll observers for viewport-triggered animations
- Handle hover and interaction animations
- Respect `prefers-reduced-motion` media query

**Interface**:
```javascript
class AnimationController {
  constructor(options = {})
  init()
  animateOnScroll(element, animationConfig)
  animateHero()
  animateCTA(element)
  destroy()
}
```

**Key Methods**:
- `init()`: Initialize animation library and set up observers
- `animateOnScroll(element, config)`: Register element for scroll-triggered animation
- `animateHero()`: Trigger hero section entrance animations
- `animateCTA(element)`: Apply hover/pulse animations to CTA buttons
- `destroy()`: Clean up observers and event listeners

#### 2. Stripe Payment Handler

**Purpose**: Manages the Stripe Checkout flow from button click to redirect.

**Responsibilities**:
- Initialize Stripe.js with publishable key
- Handle checkout button clicks
- Call serverless function to create Checkout Session
- Redirect to Stripe Checkout or handle errors
- Manage loading states during payment flow

**Interface**:
```javascript
class StripePaymentHandler {
  constructor(publishableKey)
  init()
  handleCheckout(event)
  createCheckoutSession()
  setLoadingState(button, isLoading)
}
```

**Key Methods**:
- `init()`: Initialize Stripe.js and attach event listeners
- `handleCheckout(event)`: Handle CTA button click
- `createCheckoutSession()`: Call `/api/create-checkout-session` endpoint
- `setLoadingState(button, isLoading)`: Update button UI during processing

#### 3. Calendly Integration Handler

**Purpose**: Manages the Calendly widget embedding and interaction.

**Responsibilities**:
- Load Calendly embed script
- Initialize inline or popup widget
- Handle widget open/close events
- Pass pre-filled data if available

**Interface**:
```javascript
class CalendlyHandler {
  constructor(calendlyUrl, options = {})
  init()
  openPopup()
  embedInline(containerElement)
  onEventScheduled(callback)
}
```

**Key Methods**:
- `init()`: Load Calendly script and initialize widget
- `openPopup()`: Open Calendly in popup mode
- `embedInline(container)`: Embed Calendly inline in specified container
- `onEventScheduled(callback)`: Register callback for successful booking

### Backend Components

#### 1. Create Checkout Session Function

**File**: `/api/create-checkout-session.js`

**Purpose**: Creates a Stripe Checkout Session and returns session details to the frontend.

**Request**:
```javascript
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: {
    email: string (optional)
  }
}
```

**Response**:
```javascript
{
  sessionId: string,
  url: string
}
```

**Error Response**:
```javascript
{
  error: string
}
```

**Implementation Details**:
- Validates environment variables (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)
- Creates Checkout Session with configured product/price
- Sets success_url to `/success.html?session_id={CHECKOUT_SESSION_ID}`
- Sets cancel_url to `/index.html`
- Includes metadata for tracking (service name, timestamp)
- Returns session ID and checkout URL

#### 2. Webhook Handler Function

**File**: `/api/webhook.js`

**Purpose**: Receives and processes Stripe webhook events for payment lifecycle management.

**Request**:
```javascript
{
  method: 'POST',
  headers: {
    'stripe-signature': string
  },
  body: raw webhook payload
}
```

**Response**:
```javascript
{
  received: boolean
}
```

**Handled Events**:
- `checkout.session.completed`: Payment successful, log details
- `checkout.session.expired`: Session expired without payment
- `payment_intent.succeeded`: Payment intent completed
- `payment_intent.payment_failed`: Payment failed
- `charge.refunded`: Refund processed

**Implementation Details**:
- Verifies webhook signature using STRIPE_WEBHOOK_SECRET
- Parses event type and data
- Logs events for monitoring
- Provides hooks for business logic (email, database updates, etc.)
- Returns 200 response to acknowledge receipt

### External Service Interfaces

#### Stripe API

**Checkout Sessions API**:
```javascript
stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: string,
    quantity: number
  }],
  mode: 'payment' | 'subscription',
  success_url: string,
  cancel_url: string,
  metadata: object,
  customer_email: string (optional)
})
```

**Webhook Verification**:
```javascript
stripe.webhooks.constructEvent(
  payload: Buffer,
  signature: string,
  secret: string
)
```

#### Calendly API

**Inline Embed**:
```javascript
Calendly.initInlineWidget({
  url: string,
  parentElement: HTMLElement,
  prefill: {
    name: string,
    email: string,
    customAnswers: object
  }
})
```

**Popup Widget**:
```javascript
Calendly.initPopupWidget({
  url: string
})
```

**Event Listener**:
```javascript
window.addEventListener('message', (e) => {
  if (e.data.event === 'calendly.event_scheduled') {
    // Handle successful booking
  }
})
```

## Data Models

### Checkout Session Data

```javascript
{
  sessionId: string,           // Stripe session ID
  url: string,                 // Checkout URL
  amount: number,              // Amount in cents
  currency: string,            // Currency code (e.g., 'usd')
  customerEmail: string,       // Customer email (optional)
  metadata: {
    service: string,           // Service name
    timestamp: string          // ISO timestamp
  }
}
```

### Webhook Event Data

```javascript
{
  id: string,                  // Event ID
  type: string,                // Event type
  data: {
    object: {
      id: string,              // Session/Payment ID
      amount_total: number,    // Total amount in cents
      customer_email: string,  // Customer email
      payment_status: string,  // Payment status
      metadata: object         // Custom metadata
    }
  }
}
```

### Animation Configuration

```javascript
{
  element: HTMLElement,        // Target element
  trigger: string,             // 'load' | 'scroll' | 'hover' | 'click'
  animation: {
    type: string,              // 'fade' | 'slide' | 'scale' | 'custom'
    duration: number,          // Duration in seconds
    delay: number,             // Delay in seconds
    easing: string,            // Easing function
    from: object,              // Starting properties
    to: object                 // Ending properties
  },
  threshold: number            // Intersection observer threshold (0-1)
}
```

### CSS Custom Properties Schema

```css
:root {
  /* Colors */
  --primary: #163b63;
  --primary-dark: #0f243d;
  --primary-light: #1f4f85;
  --accent: #f4b41a;
  --bg: #f3f4f8;
  --bg-soft: #e5edf7;
  --text: #111827;
  --muted: #6b7280;
  --white: #ffffff;
  --border: #d1d5db;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-soft: 0 18px 40px rgba(15, 23, 42, 0.18);
  --shadow-hard: 0 10px 20px rgba(15, 23, 42, 0.3);
  
  /* Typography */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-heading: inherit;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Scroll-triggered animations activate for all viewport entries

*For any* content section on the page, when that section enters the viewport during scrolling, the animation system should trigger the appropriate entrance animation (fade-in, slide-in, etc.).

**Validates: Requirements 1.2**

### Property 2: Interactive elements provide hover feedback

*For any* interactive element (button, link, form input), when a user hovers over it, the system should apply visual feedback through CSS changes or animation effects.

**Validates: Requirements 1.3**

### Property 3: CSS custom properties are used consistently

*For any* style property that appears multiple times (colors, spacing, shadows, etc.), the system should define it as a CSS custom property and reference that property rather than hardcoding values.

**Validates: Requirements 1.4**

### Property 4: Checkout session creation returns valid session data

*For any* valid payment request to `/api/create-checkout-session`, the serverless function should return a response containing both `sessionId` and `url` properties with non-empty string values.

**Validates: Requirements 4.3**

### Property 5: Webhook signature verification precedes event processing

*For any* webhook event received at `/api/webhook`, the system should verify the Stripe signature before executing any business logic or logging event details.

**Validates: Requirements 4.5**

### Property 6: Responsive layout adapts to all viewport sizes

*For any* viewport width (from 320px to 2560px), the landing page should render without horizontal scrolling, with all content visible and properly sized for that viewport.

**Validates: Requirements 5.1**

### Property 7: Touch targets meet minimum size requirements

*For any* interactive element on mobile viewports (≤768px), the element should have a minimum touch target size of 44x44 pixels to ensure usability.

**Validates: Requirements 5.5**

### Property 8: Interactive elements have ARIA labels

*For any* interactive element (button, link, form control), the element should have appropriate ARIA attributes (aria-label, aria-labelledby, or semantic HTML that provides accessible names).

**Validates: Requirements 6.1**

### Property 9: Keyboard navigation reaches all interactive features

*For any* interactive element on the page, the element should be reachable via keyboard navigation (Tab key) and operable via keyboard events (Enter, Space).

**Validates: Requirements 6.2**

### Property 10: Text contrast meets WCAG standards

*For any* text element on the page, the contrast ratio between the text color and its background color should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 6.3**

### Property 11: Reduced motion preferences are respected

*For any* animation on the page, when the user has `prefers-reduced-motion: reduce` set in their browser, the animation should either be disabled or replaced with a simpler, non-motion alternative.

**Validates: Requirements 6.4**

### Property 12: Animations use hardware-accelerated properties

*For any* CSS animation or transition, the animation should primarily use hardware-accelerated properties (transform, opacity) rather than layout-triggering properties (width, height, top, left).

**Validates: Requirements 7.4**

### Property 13: Images and videos are lazy-loaded

*For any* image or video element on the page (except above-the-fold hero images), the element should have `loading="lazy"` attribute or be loaded via intersection observer to defer loading until needed.

**Validates: Requirements 7.5**

### Property 14: Serverless function errors are logged

*For any* error that occurs in a serverless function (create-checkout-session or webhook), the error should be logged with sufficient context (error message, stack trace, request details) before returning an error response.

**Validates: Requirements 10.4**

### Property 15: Webhook handlers are idempotent

*For any* webhook event, processing the same event multiple times (identified by event ID) should produce the same result as processing it once, with no duplicate side effects.

**Validates: Requirements 10.5**

### Property 16: Payment failure prevents booking confirmation

*For any* booking attempt where payment fails (payment_intent.payment_failed event), the system should not create or confirm a booking, ensuring payment and booking are synchronized.

**Validates: Requirements 11.4**

### Property 17: Booking confirmation requires payment completion

*For any* paid booking, the booking should only be confirmed after receiving a successful payment event (checkout.session.completed), ensuring no bookings are confirmed without payment.

**Validates: Requirements 11.3**

## Error Handling

### Frontend Error Handling

#### Animation Errors

**Strategy**: Graceful degradation - if animations fail to load or execute, the page should remain functional without animations.

**Implementation**:
- Wrap animation initialization in try-catch blocks
- Provide fallback static styles if animation library fails to load
- Log animation errors to console for debugging
- Never block page rendering waiting for animations

**Example**:
```javascript
try {
  animationController.init();
} catch (error) {
  console.error('Animation initialization failed:', error);
  // Page continues to function without animations
}
```

#### Payment Flow Errors

**Strategy**: User-friendly error messages with retry capability.

**Implementation**:
- Catch network errors when calling `/api/create-checkout-session`
- Display clear error messages to users (avoid technical jargon)
- Provide retry button or alternative contact method
- Log errors for monitoring
- Reset button loading state on error

**Error Types**:
1. **Network Errors**: "Unable to connect. Please check your internet connection and try again."
2. **Server Errors**: "Something went wrong. Please try again or contact support."
3. **Stripe Errors**: Display Stripe's user-friendly error message

**Example**:
```javascript
try {
  const response = await fetch('/api/create-checkout-session', {...});
  if (!response.ok) throw new Error('Server error');
  const data = await response.json();
  window.location.href = data.url;
} catch (error) {
  console.error('Checkout error:', error);
  alert('Unable to process payment. Please try again or contact support.');
  setLoadingState(button, false);
}
```

#### Calendly Integration Errors

**Strategy**: Fallback to alternative booking methods.

**Implementation**:
- Detect if Calendly script fails to load
- Provide fallback contact information (email, phone)
- Display error message if widget fails to initialize
- Log errors for monitoring

**Example**:
```javascript
if (typeof Calendly === 'undefined') {
  console.error('Calendly failed to load');
  document.getElementById('calendly-fallback').style.display = 'block';
}
```

### Backend Error Handling

#### Serverless Function Errors

**Strategy**: Secure error responses with detailed logging.

**Implementation**:
- Validate all environment variables on function start
- Catch all errors and return generic user-facing messages
- Log detailed error information server-side
- Return appropriate HTTP status codes
- Never expose sensitive information in error responses

**Error Types**:
1. **Configuration Errors**: Missing environment variables
2. **Stripe API Errors**: Invalid keys, rate limits, network issues
3. **Validation Errors**: Invalid request data

**Example**:
```javascript
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  const session = await stripe.checkout.sessions.create({...});
  res.status(200).json({ sessionId: session.id, url: session.url });
} catch (error) {
  console.error('Checkout session creation failed:', error);
  res.status(500).json({ 
    error: 'Unable to process payment. Please try again or contact support.' 
  });
}
```

#### Webhook Error Handling

**Strategy**: Fail safely and return appropriate status codes to Stripe.

**Implementation**:
- Verify webhook signature before processing
- Return 400 for signature verification failures
- Return 200 for successfully received events (even if processing fails)
- Log all webhook events and errors
- Implement idempotency to handle duplicate events

**Error Types**:
1. **Signature Verification Failures**: Invalid or missing signature
2. **Event Processing Errors**: Errors in business logic
3. **Unknown Event Types**: Events not handled by the system

**Example**:
```javascript
try {
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Process event
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
} catch (error) {
  console.error('Webhook error:', error);
  if (error.message.includes('signature')) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  res.status(500).json({ error: 'Webhook processing failed' });
}
```

### Error Monitoring

**Strategy**: Comprehensive logging for debugging and monitoring.

**Implementation**:
- Log all errors with context (timestamp, user agent, request details)
- Use Vercel's built-in logging for serverless functions
- Consider adding error tracking service (e.g., Sentry) for production
- Monitor error rates and set up alerts for critical errors

**Logged Information**:
- Error message and stack trace
- Request details (method, URL, headers)
- User context (IP, user agent)
- Timestamp
- Environment (development, production)

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific functionality and property-based tests for universal correctness properties. This comprehensive approach ensures both concrete examples work correctly and general rules hold across all inputs.

### Unit Testing

**Purpose**: Verify specific examples, edge cases, and integration points work correctly.

**Framework**: Jest (for JavaScript testing)

**Test Categories**:

1. **Component Tests**:
   - Animation controller initialization
   - Stripe payment handler button clicks
   - Calendly widget embedding
   - Loading state management

2. **API Endpoint Tests**:
   - `/api/create-checkout-session` returns valid session data
   - `/api/webhook` handles known event types
   - Error responses for invalid requests
   - Environment variable validation

3. **Integration Tests**:
   - Complete payment flow from button click to redirect
   - Calendly booking flow
   - Webhook event processing

4. **Edge Case Tests**:
   - Empty or malformed request bodies
   - Missing environment variables
   - Network timeouts
   - Invalid Stripe signatures

**Example Unit Test**:
```javascript
describe('StripePaymentHandler', () => {
  test('should create checkout session on button click', async () => {
    const handler = new StripePaymentHandler('pk_test_123');
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessionId: 'sess_123', url: 'https://checkout.stripe.com/...' })
    });
    global.fetch = mockFetch;
    
    await handler.handleCheckout({ currentTarget: document.createElement('button') });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/create-checkout-session', expect.any(Object));
  });
});
```

### Property-Based Testing

**Purpose**: Verify universal properties hold across all valid inputs through randomized testing.

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Annotation**: Each property-based test must include a comment explicitly referencing the correctness property from this design document using the format: `**Feature: landing-page-redesign, Property {number}: {property_text}**`

**Property Test Categories**:

1. **Animation Properties**:
   - Scroll-triggered animations (Property 1)
   - Hover feedback (Property 2)
   - Reduced motion respect (Property 11)
   - Hardware acceleration (Property 12)

2. **API Properties**:
   - Checkout session response structure (Property 4)
   - Webhook signature verification (Property 5)
   - Error logging (Property 14)
   - Idempotency (Property 15)

3. **Accessibility Properties**:
   - ARIA labels (Property 8)
   - Keyboard navigation (Property 9)
   - Color contrast (Property 10)

4. **Responsive Design Properties**:
   - Viewport adaptation (Property 6)
   - Touch target sizing (Property 7)

5. **Performance Properties**:
   - Lazy loading (Property 13)
   - CSS custom properties (Property 3)

**Example Property Test**:
```javascript
/**
 * Feature: landing-page-redesign, Property 4: Checkout session creation returns valid session data
 * Validates: Requirements 4.3
 */
describe('Property: Checkout session response structure', () => {
  test('should return sessionId and url for any valid request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.option(fc.emailAddress(), { nil: undefined })
        }),
        async (requestBody) => {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          
          const data = await response.json();
          
          // Property: Response must contain sessionId and url
          expect(data).toHaveProperty('sessionId');
          expect(data).toHaveProperty('url');
          expect(typeof data.sessionId).toBe('string');
          expect(typeof data.url).toBe('string');
          expect(data.sessionId.length).toBeGreaterThan(0);
          expect(data.url).toMatch(/^https:\/\//);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Visual Regression Testing

**Purpose**: Ensure UI changes don't introduce unintended visual regressions.

**Approach**: Manual testing with screenshots at key breakpoints (mobile, tablet, desktop).

**Test Cases**:
- Hero section rendering
- Animation states (before, during, after)
- Responsive layouts at 320px, 768px, 1024px, 1920px
- Hover states for interactive elements
- Loading states during payment flow

### Performance Testing

**Purpose**: Verify performance requirements are met.

**Tools**:
- Lighthouse CI for automated performance scoring
- Web Vitals library for Core Web Vitals measurement
- Chrome DevTools for manual performance profiling

**Metrics**:
- Lighthouse Performance Score ≥ 90
- First Contentful Paint < 2 seconds
- Largest Contentful Paint < 2.5 seconds
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

**Test Execution**:
- Run Lighthouse on every deployment
- Test on throttled connections (3G, 4G)
- Test on various devices (mobile, tablet, desktop)

### Accessibility Testing

**Purpose**: Ensure WCAG compliance and usability for all users.

**Tools**:
- axe DevTools for automated accessibility scanning
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

**Test Cases**:
- All interactive elements have ARIA labels (Property 8)
- Complete keyboard navigation (Property 9)
- Color contrast ratios (Property 10)
- Reduced motion support (Property 11)
- Focus indicators visible
- Semantic HTML structure

### End-to-End Testing

**Purpose**: Verify complete user flows work correctly.

**Approach**: Manual testing of critical paths.

**Test Scenarios**:
1. **Booking Flow**:
   - Click CTA button
   - Calendly widget opens
   - Select time slot
   - Complete booking
   - Verify confirmation

2. **Payment Flow**:
   - Click payment CTA
   - Redirect to Stripe Checkout
   - Enter test card details
   - Complete payment
   - Redirect to success page

3. **Combined Flow**:
   - Book paid session
   - Complete payment
   - Verify booking confirmed
   - Check webhook received

### Test Environment Setup

**Local Testing**:
- Use `.env` file with test API keys
- Run local server on port 3001
- Use Stripe test mode
- Use Calendly test event links

**CI/CD Testing**:
- Run unit tests on every commit
- Run property tests on pull requests
- Run Lighthouse on preview deployments
- Manual E2E testing before production deployment

**Test Data**:
- Stripe test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)
- Test email addresses: `test@example.com`
- Test webhook events: Use Stripe CLI to trigger test events

## Implementation Notes

### Animation Library Selection

**Recommended**: GSAP (GreenSock Animation Platform)

**Rationale**:
- Lightweight core library (~50KB gzipped)
- Excellent performance with hardware acceleration
- Simple API for common animations
- Good documentation and community support
- Works well with vanilla JavaScript

**Alternative**: Lottie for complex vector animations exported from After Effects

**Implementation Approach**:
- Load GSAP from CDN or npm package
- Create AnimationController class to centralize animation logic
- Use ScrollTrigger plugin for viewport-triggered animations
- Respect `prefers-reduced-motion` media query

### CSS Organization

**Approach**: Inline CSS with custom properties defined in `:root`

**Structure**:
```html
<style>
  :root {
    /* Custom properties */
  }
  
  /* Reset and base styles */
  
  /* Component styles */
  
  /* Responsive styles */
  
  /* Animation styles */
</style>
```

**Benefits**:
- No external CSS file to load
- Custom properties enable easy theming
- Inline styles reduce HTTP requests
- Simple to maintain without build tools

### Deployment Configuration

**Vercel Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Environment Variables** (set in Vercel dashboard):
- `STRIPE_SECRET_KEY`: Stripe secret key (sk_live_... or sk_test_...)
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (pk_live_... or pk_test_...)
- `STRIPE_PRICE_ID`: Stripe price ID for the coaching session
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (whsec_...)
- `CALENDLY_LINK`: Calendly scheduling URL
- `DOMAIN`: Production domain (e.g., https://example.com)

### Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **Webhook Verification**: Always verify Stripe signatures
3. **HTTPS**: Ensure all traffic uses HTTPS (Vercel provides this)
4. **CORS**: Configure appropriate CORS headers for API endpoints
5. **Input Validation**: Validate all user inputs before processing
6. **Error Messages**: Don't expose sensitive information in error messages

### Performance Optimizations

1. **Inline Critical CSS**: Include all CSS inline to eliminate render-blocking requests
2. **Lazy Load Images**: Use `loading="lazy"` for below-the-fold images
3. **Optimize Images**: Compress and serve appropriate sizes for different viewports
4. **Minimize JavaScript**: Only load necessary libraries (Stripe.js, Calendly, GSAP)
5. **Use CDN**: Load third-party scripts from CDN for better caching
6. **Preconnect**: Add `<link rel="preconnect">` for external domains
7. **Font Loading**: Use system fonts to avoid web font loading delay

### Accessibility Best Practices

1. **Semantic HTML**: Use appropriate HTML5 elements (header, nav, main, section, footer)
2. **ARIA Labels**: Add aria-label or aria-labelledby to interactive elements
3. **Focus Management**: Ensure visible focus indicators and logical tab order
4. **Color Contrast**: Maintain 4.5:1 ratio for normal text, 3:1 for large text
5. **Keyboard Navigation**: All functionality accessible via keyboard
6. **Screen Reader Testing**: Test with NVDA, JAWS, or VoiceOver
7. **Reduced Motion**: Respect prefers-reduced-motion preference

### Browser Compatibility

**Target Browsers**:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

**Polyfills**: None required for target browsers (all support modern JavaScript and CSS)

**Fallbacks**:
- CSS Grid with flexbox fallback for older browsers
- Intersection Observer with scroll event fallback
- CSS custom properties with fallback values

### Maintenance and Updates

**Code Organization**:
- Keep animation logic in separate AnimationController class
- Keep payment logic in separate StripePaymentHandler class
- Keep Calendly logic in separate CalendlyHandler class
- Document all custom properties in CSS comments
- Add JSDoc comments to JavaScript functions

**Version Control**:
- Use semantic versioning for releases
- Tag production deployments
- Maintain changelog for significant changes

**Monitoring**:
- Monitor Vercel function logs for errors
- Track Stripe webhook delivery in Stripe dashboard
- Monitor Core Web Vitals in production
- Set up alerts for critical errors

## Conclusion

This design provides a comprehensive blueprint for redesigning the landing page with modern animations while maintaining existing booking and payment functionality. The architecture prioritizes performance, accessibility, and maintainability through the use of vanilla JavaScript, inline CSS with custom properties, and serverless functions on Vercel.

The dual testing approach (unit tests + property-based tests) ensures both specific functionality and universal correctness properties are verified. The design addresses all requirements from the requirements document and provides clear implementation guidance for developers.

Key success factors:
- Lightweight technology stack for optimal performance
- Clear separation of concerns between components
- Comprehensive error handling and logging
- Strong focus on accessibility and responsive design
- Thorough testing strategy covering all correctness properties
