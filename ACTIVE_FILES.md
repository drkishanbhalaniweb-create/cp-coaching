# Active Files - Claim Readiness Diagnostic

## Production Files in Use

### HTML Pages
- **diagnostic.html** - Main diagnostic questionnaire (5 questions)
- **results.html** - Personalized results page with score-based recommendations and payment
- **success.html** - Payment success page with Cal.com booking widget

### JavaScript - Core Application
- **diagnostic-main.js** - Main application entry point and orchestration
- **diagnostic-config.js** - Configuration and question definitions
- **DiagnosticController.js** - State management and flow control
- **QuestionRenderer.js** - Question UI rendering
- **ScoringEngine.js** - Score calculation logic
- **RecommendationEngine.js** - Recommendation generation based on score
- **DataLogger.js** - Analytics and diagnostic data logging

### JavaScript - Integrations
- **StripeIntegration.js** - Stripe payment processing

### Configuration & Build
- **package.json** - NPM dependencies and scripts
- **package-lock.json** - Locked dependency versions
- **vercel.json** - Vercel deployment configuration
- **jest.config.js** - Jest testing configuration
- **jest.setup.js** - Jest test setup

### API Endpoints
- **api/create-checkout-session.js** - Stripe checkout session creation
- **api/log-diagnostic.js** - Diagnostic data logging endpoint
- **api/webhook.js** - Stripe webhook handler

### Tests
- **__tests__/** - Test suite directory
  - diagnostic-integration.test.js
  - DiagnosticController.test.js
  - QuestionRenderer.test.js
  - ScoringEngine.test.js
  - RecommendationEngine.test.js
  - StripeIntegration.test.js
  - payment-integration.test.js
  - log-diagnostic.test.js
  - DataLogger.test.js
  - And other test files

### Documentation
- **README.md** - Main project documentation
- **.env** - Environment variables
- **.env.example** - Example environment variables
- **.gitignore** - Git ignore rules

### Preserved (Not Used)
- **copy/** - Backup folder (preserved as requested)

## Deleted Files (No Longer Used)
- index.html - Old landing page
- booking.html - Old booking page
- test-booking.html - Test file
- CalIntegration.js - Unintegrated Cal.com integration
- local-server.js - Development-only server

## User Flow
1. User visits `/diagnostic.html`
2. Completes 5-question diagnostic
3. Automatically redirected to `/results.html`
4. Views personalized results based on score
5. Clicks payment button to book consultation
6. Completes Stripe payment ($225)
7. Redirected to `/success.html`
8. Books appointment via Cal.com widget
