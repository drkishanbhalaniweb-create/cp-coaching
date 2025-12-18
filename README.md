# Claim Readiness Diagnostic

An interactive decision-support tool that helps veterans assess whether their VA disability claim is ready to file. This diagnostic provides objective, transparent recommendations based on five key assessment areas.

## Overview

The Claim Readiness Diagnostic is a trust-first educational tool that guides veterans through a five-question assessment to evaluate their VA claim readiness. It provides objective recommendations without aggressive sales tactics, showing users exactly why they received their recommendation through a transparent breakdown.

**Key Features:**
- 🎯 Five-question assessment covering critical claim readiness factors
- 📊 Objective scoring system (0-10 scale)
- 🔍 Transparent recommendation breakdown
- 📅 Integrated Calendly booking for Claim Readiness Reviews
- 💳 Stripe payment integration for paid services
- ♿ WCAG AA accessible
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast performance (vanilla JavaScript, no frameworks)

## Quick Start

### Prerequisites

- Node.js 14+ (for development and testing)
- npm or yarn
- Vercel account (for deployment)
- Stripe account (for payments)
- Calendly account (for bookings)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd claim-readiness-diagnostic
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
CALENDLY_LINK=https://calendly.com/your-link/claim-readiness-review
DOMAIN=http://localhost:3001
```

### Development

Start the local development server:
```bash
npm run dev
```

The diagnostic will be available at `http://localhost:3001`

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run property-based tests:
```bash
npm run test:pbt
```

### Deployment

Deploy to Vercel:
```bash
vercel --prod
```

Or use the Vercel GitHub integration for automatic deployments.

## Architecture

### Frontend Components

The diagnostic is built with vanilla JavaScript using a modular architecture:

- **DiagnosticController**: Central state management and flow control
- **QuestionRenderer**: UI rendering for all screens
- **ScoringEngine**: Answer scoring and calculation logic
- **RecommendationEngine**: Score-to-recommendation mapping
- **CalendlyIntegration**: Booking widget integration
- **DataLogger**: Analytics and data persistence

### Backend API

Serverless functions deployed on Vercel:

- **POST /api/log-diagnostic.js**: Logs diagnostic completion data
- **POST /api/create-checkout-session.js**: Creates Stripe checkout sessions
- **POST /api/webhook.js**: Handles Stripe webhook events

### Data Flow

```
User → Diagnostic UI → DiagnosticController → ScoringEngine → RecommendationEngine
                                ↓
                         localStorage (session data)
                                ↓
                         DataLogger → /api/log-diagnostic
                                ↓
                         CalendlyIntegration → Booking
                                ↓
                         StripeIntegration → Payment
```

## Configuration

### Question Configuration

Questions are defined in `diagnostic-config.js`:

```javascript
const QUESTIONS = [
  {
    id: 'service_connection',
    number: 1,
    title: 'Service connection clearly documented?',
    helper: 'Medical records, nexus letters, or documented in-service events linking the condition.',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  // ... additional questions
];
```

### Recommendation Configuration

Recommendations are defined in `diagnostic-config.js`:

```javascript
const RECOMMENDATIONS = {
  FULLY_READY: {
    scoreRange: [0, 0],
    message: 'Your claim is FULLY READY. No Claim Readiness Review is needed.',
    color: '#10b981',
    icon: '✅',
    ctaText: 'Book review for peace of mind',
    ctaOptional: true
  },
  // ... additional recommendations
};
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for detailed configuration options.

## API Documentation

### POST /api/log-diagnostic.js

Logs diagnostic completion data for analytics.

**Request:**
```json
{
  "timestamp": "2025-12-18T10:30:00.000Z",
  "answers": {
    "service_connection": 2,
    "denial_handling": 1,
    "pathway": 2,
    "severity": 1,
    "secondaries": 2
  },
  "score": 8,
  "recommendation": "REVIEW_STRONGLY_RECOMMENDED"
}
```

**Response:**
```json
{
  "success": true,
  "id": "diag_abc123xyz"
}
```

See [docs/API.md](docs/API.md) for complete API documentation.

## Data Storage

### localStorage Schema

Session data is stored in browser localStorage:

```javascript
{
  sessionId: "uuid-v4",
  startTime: "2025-12-18T10:30:00.000Z",
  endTime: "2025-12-18T10:32:00.000Z",
  currentState: "recommendation",
  answers: {
    service_connection: { text: "No", points: 2 },
    denial_handling: { text: "Partially", points: 1 },
    // ... additional answers
  },
  score: 8,
  recommendation: "REVIEW_STRONGLY_RECOMMENDED"
}
```

See [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) for complete schema documentation.

## Testing

### Unit Tests

Unit tests verify specific functionality:

```bash
npm test
```

Tests are located in `__tests__/` directory and cover:
- Component logic (ScoringEngine, RecommendationEngine, etc.)
- UI rendering (QuestionRenderer)
- Integration points (CalendlyIntegration, StripeIntegration)
- API endpoints

### Property-Based Tests

Property-based tests verify universal correctness properties:

```bash
npm run test:pbt
```

Properties tested include:
- Scoring consistency across all answer combinations
- Recommendation accuracy for all score ranges
- UI element presence and behavior
- Accessibility compliance

### Manual Testing

Visual and accessibility testing:
- Test files in root directory (`test-*.html`)
- Verification scripts (`verify-*.js`)
- Cross-browser testing checklist

## Accessibility

The diagnostic is WCAG AA compliant:

- ✅ ARIA labels on all interactive elements
- ✅ Full keyboard navigation support
- ✅ Screen reader compatible
- ✅ Color contrast ratios meet WCAG standards
- ✅ Focus indicators visible
- ✅ Respects prefers-reduced-motion

Test accessibility:
```bash
node verify-accessibility.js
```

## Performance

Performance targets:
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Lighthouse score ≥ 90

Test performance:
```bash
node verify-performance.js
```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

4. Verify deployment:
```bash
node verify-deployment.js
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
.
├── api/                          # Serverless functions
│   ├── create-checkout-session.js
│   ├── log-diagnostic.js
│   └── webhook.js
├── __tests__/                    # Test files
│   ├── ScoringEngine.test.js
│   ├── RecommendationEngine.test.js
│   └── ...
├── data/                         # Data storage
│   └── diagnostics.json
├── docs/                         # Documentation
│   ├── API.md
│   ├── CONFIGURATION.md
│   └── DATA_SCHEMA.md
├── CalendlyIntegration.js        # Calendly booking integration
├── DataLogger.js                 # Analytics logging
├── DiagnosticController.js       # State management
├── QuestionRenderer.js           # UI rendering
├── RecommendationEngine.js       # Recommendation logic
├── ScoringEngine.js              # Scoring logic
├── StripeIntegration.js          # Payment integration
├── diagnostic-config.js          # Configuration
├── diagnostic-main.js            # Main entry point
├── diagnostic.html               # Diagnostic page
├── index.html                    # Landing page
├── package.json                  # Dependencies
├── vercel.json                   # Vercel configuration
└── README.md                     # This file
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## License

Proprietary - Military Disability Nexus

## Support

For questions or issues:
- Email: support@militarydisabilitynexus.com
- Documentation: See `docs/` directory
- Deployment issues: See `docs/DEPLOYMENT.md`

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
