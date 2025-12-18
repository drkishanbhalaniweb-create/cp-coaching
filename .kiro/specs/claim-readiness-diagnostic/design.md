# Design Document

## Overview

This design document outlines the architecture and implementation approach for the Claim Readiness Diagnostic, an interactive decision-support tool that completely replaces the existing homepage. The diagnostic guides veterans through a five-question assessment to objectively evaluate their VA claim readiness, providing transparent recommendations based on their responses.

The system is built using vanilla HTML, CSS, and JavaScript to maximize performance and minimize complexity. It integrates with existing Calendly scheduling and Stripe payment infrastructure without modification. The design prioritizes trust, transparency, and ethical user experience - this is an educational tool first, not a lead generation mechanism.

### Key Design Principles

1. **Trust First**: Provide objective, honest assessments without aggressive sales tactics
2. **Transparency**: Show users exactly why they received their recommendation
3. **Simplicity**: One question at a time, clear language, minimal cognitive load
4. **Accessibility**: WCAG-compliant, keyboard navigable, screen reader compatible
5. **Performance**: Fast load times, smooth animations, mobile-optimized
6. **Brand Alignment**: Match militarydisabilitynexus.com aesthetic (calm, clinical, veteran-safe)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  index.html (Diagnostic Interface)                     │ │
│  │  ├─ Diagnostic Intro Screen                            │ │
│  │  ├─ Question Screens (1-5)                             │ │
│  │  ├─ Recommendation Screen                              │ │
│  │  └─ Transparency Layer                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Client-Side JavaScript                                │ │
│  │  ├─ DiagnosticController (state management)            │ │
│  │  ├─ QuestionRenderer (UI rendering)                    │ │
│  │  ├─ ScoringEngine (score calculation)                  │ │
│  │  ├─ RecommendationEngine (recommendation logic)        │ │
│  │  ├─ CalendlyIntegration (booking)                      │ │
│  │  └─ DataLogger (analytics)                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  localStorage                                           │ │
│  │  └─ Diagnostic session data                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Static File Hosting                                   │ │
│  │  └─ index.html (diagnostic)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Serverless Functions (/api directory)                 │ │
│  │  ├─ log-diagnostic.js (NEW)                            │ │
│  │  ├─ create-checkout-session.js (EXISTING)              │ │
│  │  └─ webhook.js (EXISTING)                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Stripe API      │         │  Calendly API    │          │
│  │  (EXISTING)      │         │  (EXISTING)      │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### State Machine Architecture

The diagnostic follows a linear state machine with the following states:

```
INTRO → Q1 → Q2 → Q3 → Q4 → Q5 → RECOMMENDATION → TRANSPARENCY → BOOKING
```

Each state transition is triggered by user interaction (button click or answer selection). State is maintained in memory and persisted to localStorage for analytics.

## Components and Interfaces

### Frontend Components

#### 1. DiagnosticController

**Purpose**: Central state management for the diagnostic flow.

**Responsibilities**:
- Maintain current state (intro, question 1-5, recommendation, transparency)
- Store user answers and calculated score
- Coordinate transitions between screens
- Persist data to localStorage
- Trigger data logging to backend

**Interface**:
```javascript
class DiagnosticController {
  constructor()
  
  // State management
  getCurrentState()
  setState(newState)
  
  // Answer management
  recordAnswer(questionId, answerValue, points)
  getAnswers()
  
  // Score management
  calculateScore()
  getScore()
  
  // Navigation
  start()
  nextQuestion()
  showRecommendation()
  
  // Data persistence
  saveToLocalStorage()
  loadFromLocalStorage()
  logToBackend()
}
```

**Key Methods**:
- `start()`: Initialize diagnostic, transition from intro to Q1
- `recordAnswer(questionId, answerValue, points)`: Store answer and advance
- `calculateScore()`: Sum all answer points to get total score
- `showRecommendation()`: Calculate recommendation based on score
- `logToBackend()`: POST diagnostic data to /api/log-diagnostic

#### 2. QuestionRenderer

**Purpose**: Render question screens with consistent UI.

**Responsibilities**:
- Render question text and helper text
- Render three answer option cards
- Handle answer selection and visual feedback
- Render progress indicator
- Apply animations for transitions

**Interface**:
```javascript
class QuestionRenderer {
  constructor(containerElement)
  
  // Rendering
  renderIntro()
  renderQuestion(questionData, currentStep, totalSteps)
  renderRecommendation(recommendationData)
  renderTransparency(answersData)
  
  // Event handling
  onAnswerSelected(callback)
  onStartClicked(callback)
  onBookingClicked(callback)
  
  // Animations
  transitionOut(callback)
  transitionIn()
}
```

**Key Methods**:
- `renderQuestion(questionData, step, total)`: Render question screen with progress
- `renderRecommendation(data)`: Render recommendation with appropriate styling
- `renderTransparency(answers)`: Render breakdown of assessment areas
- `transitionOut(callback)`: Fade out current screen, call callback when complete

#### 3. ScoringEngine

**Purpose**: Calculate scores based on answer values.

**Responsibilities**:
- Map answer text to point values
- Calculate total score
- Validate score range (0-10)

**Interface**:
```javascript
class ScoringEngine {
  constructor()
  
  // Scoring
  getPointsForAnswer(questionId, answerText)
  calculateTotalScore(answers)
  validateScore(score)
}
```

**Key Methods**:
- `getPointsForAnswer(questionId, answerText)`: Return 0, 1, or 2 based on answer
- `calculateTotalScore(answers)`: Sum all answer points
- `validateScore(score)`: Ensure score is between 0 and 10

#### 4. RecommendationEngine

**Purpose**: Map scores to recommendation categories.

**Responsibilities**:
- Determine recommendation category from score
- Provide recommendation message text
- Provide appropriate visual styling (color, icon)
- Determine CTA text and behavior

**Interface**:
```javascript
class RecommendationEngine {
  constructor()
  
  // Recommendation logic
  getRecommendation(score)
  getRecommendationMessage(category)
  getRecommendationColor(category)
  getRecommendationIcon(category)
  getCTAText(category)
  shouldShowCTA(category)
}
```

**Key Methods**:
- `getRecommendation(score)`: Return category (FULLY_READY, OPTIONAL, BENEFICIAL, STRONGLY_RECOMMENDED)
- `getRecommendationMessage(category)`: Return appropriate message text
- `getRecommendationColor(category)`: Return color (green, blue, yellow, red)
- `getCTAText(category)`: Return appropriate CTA button text

#### 5. CalendlyIntegration

**Purpose**: Handle Calendly booking widget integration.

**Responsibilities**:
- Load Calendly embed script
- Initialize popup or inline widget
- Handle booking events
- Preserve existing Calendly configuration

**Interface**:
```javascript
class CalendlyIntegration {
  constructor(calendlyUrl)
  
  // Initialization
  init()
  
  // Widget display
  openPopup()
  embedInline(containerElement)
  
  // Event handling
  onEventScheduled(callback)
}
```

**Key Methods**:
- `init()`: Load Calendly script from CDN
- `openPopup()`: Open Calendly in modal overlay
- `onEventScheduled(callback)`: Register callback for successful bookings

#### 6. DataLogger

**Purpose**: Log diagnostic data for business analytics.

**Responsibilities**:
- Format diagnostic data for backend
- POST data to /api/log-diagnostic
- Handle logging errors gracefully
- Ensure logging doesn't block user experience

**Interface**:
```javascript
class DataLogger {
  constructor()
  
  // Logging
  logDiagnostic(diagnosticData)
  formatPayload(answers, score, recommendation)
  
  // Error handling
  handleLoggingError(error)
}
```

**Key Methods**:
- `logDiagnostic(data)`: POST diagnostic data to backend
- `formatPayload(answers, score, recommendation)`: Create JSON payload
- `handleLoggingError(error)`: Log error to console, don't disrupt user

### Backend Components

#### 1. Log Diagnostic Function (NEW)

**File**: `/api/log-diagnostic.js`

**Purpose**: Receive and store diagnostic completion data for business analytics.

**Request**:
```javascript
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: {
    timestamp: string,           // ISO 8601 timestamp
    answers: {
      service_connection: number,  // 0, 1, or 2
      denial_handling: number,     // 0, 1, or 2
      pathway: number,             // 0, 1, or 2
      severity: number,            // 0, 1, or 2
      secondaries: number          // 0, 1, or 2
    },
    score: number,               // 0-10
    recommendation: string       // Category name
  }
}
```

**Response**:
```javascript
{
  success: boolean,
  id: string                     // Unique log entry ID
}
```

**Error Response**:
```javascript
{
  error: string
}
```

**Implementation Details**:
- Validate request payload structure
- Generate unique ID for each diagnostic session
- Store data in JSON file or database (implementation flexible)
- Return success response quickly (don't block user)
- Log errors for monitoring
- Support CORS for cross-origin requests

**Storage Options**:
1. **JSON File**: Append to `/data/diagnostics.json` (simple, no database needed)
2. **Database**: Store in PostgreSQL, MongoDB, etc. (scalable, queryable)
3. **Log Service**: Send to logging service like Logtail (managed, searchable)

#### 2. Create Checkout Session Function (EXISTING)

**File**: `/api/create-checkout-session.js`

**Purpose**: Create Stripe Checkout Session for paid bookings.

**Status**: EXISTING - No modifications required

**Integration**: Called when user books paid Claim Readiness Review

#### 3. Webhook Handler Function (EXISTING)

**File**: `/api/webhook.js`

**Purpose**: Handle Stripe webhook events for payment lifecycle.

**Status**: EXISTING - No modifications required

**Integration**: Processes payment events for paid bookings

### External Service Interfaces

#### Calendly API (EXISTING)

**Popup Widget**:
```javascript
Calendly.initPopupWidget({
  url: 'https://calendly.com/your-link/claim-readiness-review'
})
```

**Event Listener**:
```javascript
window.addEventListener('message', (e) => {
  if (e.data.event === 'calendly.event_scheduled') {
    // Handle successful booking
    console.log('Booking confirmed:', e.data.payload)
  }
})
```

#### Stripe API (EXISTING)

**Checkout Flow**:
```javascript
// Frontend calls backend
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
const { url } = await response.json()
window.location.href = url
```

## Data Models

### Question Data Model

```javascript
{
  id: string,                    // 'service_connection', 'denial_handling', etc.
  number: number,                // 1-5
  title: string,                 // Question text
  helper: string,                // Helper text explaining the question
  options: [
    {
      text: string,              // Answer option text
      points: number             // 0, 1, or 2
    }
  ]
}
```

**Example**:
```javascript
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
}
```

### Answer Data Model

```javascript
{
  questionId: string,            // Question identifier
  answerText: string,            // Selected answer text
  points: number,                // Points assigned (0, 1, or 2)
  timestamp: string              // ISO 8601 timestamp
}
```

### Diagnostic Session Data Model

```javascript
{
  sessionId: string,             // Unique session identifier
  startTime: string,             // ISO 8601 timestamp
  endTime: string,               // ISO 8601 timestamp
  answers: {
    service_connection: number,  // 0, 1, or 2
    denial_handling: number,
    pathway: number,
    severity: number,
    secondaries: number
  },
  score: number,                 // 0-10
  recommendation: string,        // Category name
  userAgent: string,             // Browser user agent
  viewport: {
    width: number,
    height: number
  }
}
```

### Recommendation Data Model

```javascript
{
  category: string,              // 'FULLY_READY', 'OPTIONAL_CONFIRMATION', etc.
  score: number,                 // The score that generated this recommendation
  message: string,               // Main recommendation message
  color: string,                 // CSS color value
  icon: string,                  // Emoji or icon identifier
  ctaText: string,               // Call-to-action button text
  ctaOptional: boolean,          // Whether CTA is optional
  tone: string                   // 'objective', 'serious', etc.
}
```

**Example**:
```javascript
{
  category: 'REVIEW_BENEFICIAL',
  score: 5,
  message: 'Your claim would BENEFIT from a Claim Readiness Review before filing.',
  color: '#f59e0b',              // Yellow
  icon: '⚠️',
  ctaText: 'Book Claim Readiness Review',
  ctaOptional: false,
  tone: 'objective'
}
```

### Transparency Data Model

```javascript
{
  assessmentAreas: [
    {
      name: string,              // 'Service connection clarity'
      status: string,            // 'adequate', 'needs_attention', 'missing'
      icon: string,              // '✅', '⚠️', '❌'
      points: number             // 0, 1, or 2
    }
  ]
}
```

### CSS Custom Properties Schema

```css
:root {
  /* Brand Colors - Military Disability Nexus */
  --navy-primary: #163b63;
  --navy-dark: #0f243d;
  --navy-light: #1f4f85;
  --blue-accent: #3b82f6;
  --red-cta: #dc2626;
  
  /* Recommendation Colors */
  --green-ready: #10b981;
  --blue-optional: #3b82f6;
  --yellow-beneficial: #f59e0b;
  --red-recommended: #dc2626;
  
  /* Neutral Colors */
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-900: #111827;
  
  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-soft: 0 10px 30px rgba(15, 36, 61, 0.12);
  --shadow-medium: 0 15px 40px rgba(15, 36, 61, 0.18);
  --shadow-hard: 0 20px 50px rgba(15, 36, 61, 0.25);
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: blur(10px);
  
  /* Typography */
  --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  --font-size-3xl: 40px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Z-index */
  --z-base: 1;
  --z-card: 10;
  --z-modal: 100;
  --z-overlay: 1000;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: One question per screen

*For any* question state (Q1-Q5), the system should display exactly one question with its answer options, and no other questions should be visible simultaneously.

**Validates: Requirements 2.1**

### Property 2: Progress indicator accuracy

*For any* question number (1-5), the progress indicator should display "Step X of 5" where X matches the current question number.

**Validates: Requirements 2.3**

### Property 3: Progress bar percentage accuracy

*For any* question number (1-5), the progress bar should display a completion percentage equal to (question number / 5) * 100.

**Validates: Requirements 2.4**

### Property 4: Auto-advance on answer selection

*For any* answer selection on questions 1-4, the system should automatically transition to the next question without requiring a "Next" button click.

**Validates: Requirements 2.5**

### Property 5: Three answer options per question

*For any* question (Q1-Q5), the system should provide exactly three selectable answer cards.

**Validates: Requirements 4.1**

### Property 6: Yes answers score zero points

*For any* "Yes" answer across all questions, the system should assign 0 points to that answer.

**Validates: Requirements 5.1**

### Property 7: Middle-ground answers score one point

*For any* "Somewhat" or "Partially" answer across all questions, the system should assign 1 point to that answer.

**Validates: Requirements 5.2**

### Property 8: Negative answers score two points

*For any* "No" or "Not sure" answer across all questions, the system should assign 2 points to that answer.

**Validates: Requirements 5.3**

### Property 9: Total score is sum of answer points

*For any* set of five answers, the total score should equal the sum of all individual answer point values.

**Validates: Requirements 5.4**

### Property 10: Recommendation matches score range (beneficial)

*For any* total score between 3 and 6 (inclusive), the system should display the "REVIEW BENEFICIAL" recommendation.

**Validates: Requirements 6.3**

### Property 11: Recommendation matches score range (strongly recommended)

*For any* total score of 7 or greater, the system should display the "REVIEW STRONGLY RECOMMENDED" recommendation.

**Validates: Requirements 6.4**

### Property 12: Recommendation color matches category

*For any* recommendation category, the system should display the appropriate color: green for FULLY_READY, blue for OPTIONAL_CONFIRMATION, yellow for REVIEW_BENEFICIAL, red for REVIEW_STRONGLY_RECOMMENDED.

**Validates: Requirements 6.5**

### Property 13: Transparency display for adequate answers

*For any* answer that scored 0 points, the transparency layer should display "✅ Adequate" for that assessment area.

**Validates: Requirements 7.3**

### Property 14: Transparency display for needs attention

*For any* answer that scored 1 point, the transparency layer should display "⚠️ Needs attention" for that assessment area.

**Validates: Requirements 7.4**

### Property 15: Transparency display for missing

*For any* answer that scored 2 points, the transparency layer should display "❌ Missing" for that assessment area.

**Validates: Requirements 7.5**

### Property 16: CTA display for non-ready recommendations

*For any* recommendation category of OPTIONAL_CONFIRMATION, REVIEW_BENEFICIAL, or REVIEW_STRONGLY_RECOMMENDED, the system should display a "Book Claim Readiness Review" call-to-action button.

**Validates: Requirements 8.1**

### Property 17: Calendly trigger on CTA click

*For any* booking CTA button click, the system should trigger the Calendly booking interface (popup or inline).

**Validates: Requirements 8.3**

### Property 18: localStorage persistence on completion

*For any* completed diagnostic session, the system should store the answers and score in browser localStorage.

**Validates: Requirements 9.1**

### Property 19: Diagnostic payload structure

*For any* diagnostic completion that is logged to the backend, the payload should include timestamp, all five answers with point values, total score, and recommendation category.

**Validates: Requirements 9.3**

### Property 20: Payment success redirect

*For any* successful Stripe payment, the system should redirect the user to the success page.

**Validates: Requirements 10.4**

### Property 21: Payment error handling

*For any* payment error, the system should display a user-friendly error message without exposing technical details.

**Validates: Requirements 10.5**

### Property 22: Responsive layout adaptation

*For any* viewport width (320px to 2560px), the diagnostic should render without horizontal scrolling and with all content properly sized.

**Validates: Requirements 11.2**

### Property 23: Touch target minimum size

*For any* interactive element on mobile viewports (≤768px), the element should have a minimum touch target size of 44x44 pixels.

**Validates: Requirements 11.3**

### Property 24: ARIA labels on interactive elements

*For any* interactive element (button, answer card, link), the element should have an appropriate ARIA label or accessible name.

**Validates: Requirements 12.1**

### Property 25: Keyboard navigation support

*For any* interactive element, the element should be reachable via Tab key and operable via Enter or Space key.

**Validates: Requirements 12.2**

### Property 26: WCAG color contrast compliance

*For any* text element, the contrast ratio between text color and background color should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 12.3**

### Property 27: Focus indicator visibility

*For any* focusable element when focused, a clear visual focus indicator should be visible.

**Validates: Requirements 12.5**

### Property 28: Question transition animations

*For any* transition between questions, the system should apply a smooth fade or slide animation.

**Validates: Requirements 15.1**

### Property 29: Answer selection visual feedback

*For any* answer selection, the system should provide visual feedback (highlight, scale, etc.) before advancing to the next question.

**Validates: Requirements 15.2**

### Property 30: Animation duration constraint

*For any* animation in the diagnostic, the animation duration should be between 300 and 500 milliseconds.

**Validates: Requirements 15.3**

### Property 31: Reduced motion respect

*For any* animation, when the user has prefers-reduced-motion enabled, the animation should be disabled or replaced with an instant transition.

**Validates: Requirements 15.4**

### Property 32: No layout shift from animations

*For any* animation, the animation should not cause Cumulative Layout Shift (CLS) or visual jank by using transform and opacity properties only.

**Validates: Requirements 15.5**

## Error Handling

### Frontend Error Handling

#### State Management Errors

**Strategy**: Graceful degradation with user notification.

**Implementation**:
- Validate state transitions before executing
- Catch errors in state updates and log to console
- Provide fallback UI if state becomes corrupted
- Allow user to restart diagnostic if unrecoverable

**Example**:
```javascript
try {
  diagnosticController.setState('question_2');
} catch (error) {
  console.error('State transition failed:', error);
  // Show error message and restart button
  showErrorMessage('Something went wrong. Please restart the diagnostic.');
}
```

#### Answer Recording Errors

**Strategy**: Prevent data loss, allow retry.

**Implementation**:
- Validate answer data before recording
- Catch localStorage errors (quota exceeded, disabled)
- Provide user feedback if answer not recorded
- Allow user to re-select answer

**Example**:
```javascript
try {
  diagnosticController.recordAnswer(questionId, answer, points);
  localStorage.setItem('diagnostic_session', JSON.stringify(sessionData));
} catch (error) {
  console.error('Failed to record answer:', error);
  alert('Unable to save your answer. Please try again.');
}
```

#### Calendly Integration Errors

**Strategy**: Fallback to alternative booking methods.

**Implementation**:
- Detect if Calendly script fails to load
- Provide fallback contact information
- Display error message with alternative booking options
- Log errors for monitoring

**Example**:
```javascript
if (typeof Calendly === 'undefined') {
  console.error('Calendly failed to load');
  showFallbackBooking();
}
```

#### Payment Integration Errors

**Strategy**: User-friendly error messages with retry capability.

**Implementation**:
- Catch network errors when calling checkout endpoint
- Display clear, non-technical error messages
- Provide retry button
- Log errors for debugging
- Maintain button state during errors

**Example**:
```javascript
try {
  const response = await fetch('/api/create-checkout-session', {...});
  if (!response.ok) throw new Error('Payment session creation failed');
  const { url } = await response.json();
  window.location.href = url;
} catch (error) {
  console.error('Payment error:', error);
  showErrorMessage('Unable to process payment. Please try again or contact support.');
}
```

### Backend Error Handling

#### Log Diagnostic Function Errors

**Strategy**: Fail gracefully, don't block user experience.

**Implementation**:
- Validate request payload structure
- Catch storage errors (file system, database)
- Return success even if logging fails (don't block user)
- Log errors server-side for monitoring
- Implement retry logic for transient failures

**Error Types**:
1. **Invalid Payload**: Missing or malformed data
2. **Storage Errors**: File system full, database unavailable
3. **Network Errors**: Timeout, connection refused

**Example**:
```javascript
try {
  validatePayload(req.body);
  await storeDiagnosticData(req.body);
  res.status(200).json({ success: true, id: generateId() });
} catch (error) {
  console.error('Diagnostic logging failed:', error);
  // Still return success to not block user
  res.status(200).json({ success: true, id: 'error' });
}
```

#### Existing API Error Handling

**Strategy**: Maintain existing error handling patterns.

**Implementation**:
- No changes to /api/create-checkout-session.js
- No changes to /api/webhook.js
- Ensure diagnostic doesn't break existing error handling

### Error Monitoring

**Strategy**: Comprehensive logging for debugging.

**Implementation**:
- Log all errors with context (timestamp, user agent, state)
- Use Vercel's built-in logging for serverless functions
- Consider error tracking service (Sentry) for production
- Monitor error rates and set up alerts

**Logged Information**:
- Error message and stack trace
- Current diagnostic state
- User context (viewport, browser)
- Timestamp
- Session ID

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific functionality and property-based tests for universal correctness properties. This ensures both concrete examples work correctly and general rules hold across all inputs.

### Unit Testing

**Purpose**: Verify specific examples, edge cases, and integration points.

**Framework**: Jest (JavaScript testing)

**Test Categories**:

1. **Component Tests**:
   - DiagnosticController state transitions
   - QuestionRenderer rendering output
   - ScoringEngine point calculations
   - RecommendationEngine category mapping
   - CalendlyIntegration initialization
   - DataLogger payload formatting

2. **UI Tests**:
   - Intro screen displays correct content
   - Each question displays correct text and options
   - Recommendation screen displays correct message
   - Transparency layer displays correct breakdown
   - CTA buttons display for correct recommendations

3. **Integration Tests**:
   - Complete diagnostic flow from intro to recommendation
   - Calendly booking flow
   - Payment flow with Stripe
   - Data logging to backend

4. **Edge Case Tests**:
   - Score = 0 (all Yes) → FULLY_READY
   - Score = 10 (all No) → REVIEW_STRONGLY_RECOMMENDED
   - Score boundaries (2→3, 6→7)
   - localStorage quota exceeded
   - Calendly script load failure
   - Payment API errors

**Example Unit Test**:
```javascript
describe('ScoringEngine', () => {
  test('should assign 0 points for Yes answers', () => {
    const engine = new ScoringEngine();
    expect(engine.getPointsForAnswer('service_connection', 'Yes')).toBe(0);
  });
  
  test('should calculate total score correctly', () => {
    const engine = new ScoringEngine();
    const answers = {
      service_connection: 2,
      denial_handling: 1,
      pathway: 2,
      severity: 1,
      secondaries: 2
    };
    expect(engine.calculateTotalScore(answers)).toBe(8);
  });
});
```

### Property-Based Testing

**Purpose**: Verify universal properties hold across all valid inputs through randomized testing.

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Test Annotation**: Each property-based test must include a comment referencing the correctness property using the format: `**Feature: claim-readiness-diagnostic, Property {number}: {property_text}**`

**Property Test Categories**:

1. **Scoring Properties**:
   - Yes answers always score 0 (Property 6)
   - Middle-ground answers always score 1 (Property 7)
   - Negative answers always score 2 (Property 8)
   - Total score equals sum of parts (Property 9)

2. **Recommendation Properties**:
   - Score 3-6 → REVIEW_BENEFICIAL (Property 10)
   - Score ≥7 → REVIEW_STRONGLY_RECOMMENDED (Property 11)
   - Recommendation color matches category (Property 12)

3. **Transparency Properties**:
   - 0 points → "✅ Adequate" (Property 13)
   - 1 point → "⚠️ Needs attention" (Property 14)
   - 2 points → "❌ Missing" (Property 15)

4. **UI Properties**:
   - One question per screen (Property 1)
   - Progress indicator accuracy (Property 2)
   - Progress bar percentage (Property 3)
   - Three answer options (Property 5)

5. **Accessibility Properties**:
   - ARIA labels present (Property 24)
   - Keyboard navigation (Property 25)
   - Color contrast (Property 26)
   - Focus indicators (Property 27)

6. **Animation Properties**:
   - Animation duration 300-500ms (Property 30)
   - Reduced motion respect (Property 31)
   - No layout shift (Property 32)

**Example Property Test**:
```javascript
/**
 * Feature: claim-readiness-diagnostic, Property 9: Total score is sum of answer points
 * Validates: Requirements 5.4
 */
describe('Property: Total score calculation', () => {
  test('should equal sum of all answer points for any answer combination', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          service_connection: fc.integer({ min: 0, max: 2 }),
          denial_handling: fc.integer({ min: 0, max: 2 }),
          pathway: fc.integer({ min: 0, max: 2 }),
          severity: fc.integer({ min: 0, max: 2 }),
          secondaries: fc.integer({ min: 0, max: 2 })
        }),
        (answers) => {
          const engine = new ScoringEngine();
          const totalScore = engine.calculateTotalScore(answers);
          const expectedSum = Object.values(answers).reduce((a, b) => a + b, 0);
          
          expect(totalScore).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Example Property Test for Recommendations**:
```javascript
/**
 * Feature: claim-readiness-diagnostic, Property 10: Recommendation matches score range (beneficial)
 * Validates: Requirements 6.3
 */
describe('Property: REVIEW_BENEFICIAL recommendation', () => {
  test('should display for any score between 3 and 6', async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 6 }),
        (score) => {
          const engine = new RecommendationEngine();
          const recommendation = engine.getRecommendation(score);
          
          expect(recommendation.category).toBe('REVIEW_BENEFICIAL');
          expect(recommendation.message).toContain('would BENEFIT');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Visual Testing

**Purpose**: Ensure UI matches design specifications.

**Approach**: Manual testing with screenshots at key breakpoints.

**Test Cases**:
- Intro screen rendering
- Each question screen (Q1-Q5)
- All four recommendation screens
- Transparency layer
- Mobile, tablet, desktop layouts (320px, 768px, 1024px, 1920px)
- Glassmorphism effects
- Color scheme adherence

### Accessibility Testing

**Purpose**: Ensure WCAG compliance and usability for all users.

**Tools**:
- axe DevTools for automated scanning
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

**Test Cases**:
- All interactive elements have ARIA labels (Property 24)
- Complete keyboard navigation (Property 25)
- Color contrast ratios (Property 26)
- Focus indicators visible (Property 27)
- Screen reader announces all content correctly
- Semantic HTML structure

### Performance Testing

**Purpose**: Verify fast load times and smooth interactions.

**Tools**:
- Lighthouse for performance scoring
- Chrome DevTools for profiling
- Web Vitals library for Core Web Vitals

**Metrics**:
- First Contentful Paint < 1.5 seconds
- Largest Contentful Paint < 2.5 seconds
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms
- Total Blocking Time < 300ms

**Test Execution**:
- Run Lighthouse on every deployment
- Test on throttled connections (3G, 4G)
- Test on various devices

### End-to-End Testing

**Purpose**: Verify complete user flows work correctly.

**Approach**: Manual testing of critical paths.

**Test Scenarios**:

1. **Complete Diagnostic Flow**:
   - Load homepage
   - Click "Start Diagnostic"
   - Answer all 5 questions
   - View recommendation
   - View transparency layer
   - Verify correct recommendation based on answers

2. **Booking Flow**:
   - Complete diagnostic
   - Click booking CTA
   - Calendly widget opens
   - Select time slot
   - Complete booking

3. **Payment Flow** (if applicable):
   - Complete diagnostic with paid recommendation
   - Click booking CTA
   - Redirect to Stripe Checkout
   - Enter test card
   - Complete payment
   - Redirect to success page

4. **Data Logging Flow**:
   - Complete diagnostic
   - Verify localStorage contains session data
   - Verify backend receives POST request
   - Verify data is stored correctly

### Test Environment Setup

**Local Testing**:
- Use `.env` file with test API keys
- Run local server on port 3001
- Use Stripe test mode
- Use Calendly test event links

**CI/CD Testing**:
- Run unit tests on every commit
- Run property tests on pull requests
- Manual E2E testing before production deployment

**Test Data**:
- Stripe test cards: `4242 4242 4242 4242` (success)
- Test email: `test@example.com`
- All answer combinations for scoring tests

## Implementation Details

### Question Data Configuration

**Storage**: Define questions as JavaScript constants in the main script.

**Structure**:
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
  // ... Q2-Q5
];
```

### Recommendation Configuration

**Storage**: Define recommendation rules as JavaScript constants.

**Structure**:
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
  OPTIONAL_CONFIRMATION: {
    scoreRange: [1, 2],
    message: 'Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation.',
    color: '#3b82f6',
    icon: 'ℹ️',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false
  },
  // ... REVIEW_BENEFICIAL, REVIEW_STRONGLY_RECOMMENDED
};
```

### Animation Implementation

**Approach**: CSS transitions with JavaScript class toggles.

**Transition Classes**:
```css
.fade-out {
  opacity: 0;
  transition: opacity 300ms ease;
}

.fade-in {
  opacity: 1;
  transition: opacity 300ms ease;
}

.slide-out-left {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 400ms ease, opacity 400ms ease;
}

.slide-in-right {
  transform: translateX(0);
  opacity: 1;
  transition: transform 400ms ease, opacity 400ms ease;
}
```

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### localStorage Schema

**Key**: `diagnostic_session`

**Value**:
```javascript
{
  sessionId: string,             // UUID
  startTime: string,             // ISO 8601
  endTime: string,               // ISO 8601 (when completed)
  currentState: string,          // 'intro', 'question_1', etc.
  answers: {
    service_connection: { text: string, points: number },
    denial_handling: { text: string, points: number },
    pathway: { text: string, points: number },
    severity: { text: string, points: number },
    secondaries: { text: string, points: number }
  },
  score: number,
  recommendation: string
}
```

### Backend API Specification

#### POST /api/log-diagnostic.js

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
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

**Success Response** (200):
```json
{
  "success": true,
  "id": "diag_abc123xyz"
}
```

**Error Response** (400):
```json
{
  "error": "Invalid payload structure"
}
```

**Error Response** (500):
```json
{
  "error": "Internal server error"
}
```

**Implementation Options**:

1. **JSON File Storage** (Simple):
```javascript
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const id = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry = { id, ...data };
    
    const filePath = path.join(process.cwd(), 'data', 'diagnostics.json');
    let diagnostics = [];
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      diagnostics = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
    
    diagnostics.push(entry);
    await fs.writeFile(filePath, JSON.stringify(diagnostics, null, 2));
    
    res.status(200).json({ success: true, id });
  } catch (error) {
    console.error('Diagnostic logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

2. **Database Storage** (Scalable):
```javascript
// Using PostgreSQL or MongoDB
module.exports = async (req, res) => {
  try {
    const data = req.body;
    const result = await db.diagnostics.insert(data);
    res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Diagnostic logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

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
  ]
}
```

**Environment Variables** (Vercel Dashboard):
- `STRIPE_SECRET_KEY`: Existing Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Existing Stripe publishable key
- `STRIPE_PRICE_ID`: Existing Stripe price ID
- `STRIPE_WEBHOOK_SECRET`: Existing webhook secret
- `CALENDLY_LINK`: Calendly scheduling URL
- `DOMAIN`: Production domain

**No new environment variables required** - all existing infrastructure is reused.

### Security Considerations

1. **Data Privacy**: Diagnostic data contains no PII, only answer choices and scores
2. **API Security**: Log endpoint accepts POST only, validates payload structure
3. **HTTPS**: All traffic uses HTTPS (Vercel provides this)
4. **CORS**: Configure appropriate CORS headers for API endpoints
5. **Rate Limiting**: Consider rate limiting on log endpoint to prevent abuse
6. **Input Validation**: Validate all user inputs before processing
7. **Error Messages**: Don't expose sensitive information in error messages

### Browser Compatibility

**Target Browsers**:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

**Required Features**:
- localStorage API
- Fetch API
- CSS Custom Properties
- CSS Grid and Flexbox
- ES6 JavaScript (const, let, arrow functions, classes)

**No Polyfills Required** - all target browsers support these features natively.

### Maintenance and Updates

**Code Organization**:
- Keep all diagnostic logic in separate classes
- Use CSS custom properties for easy theming
- Document all configuration constants
- Add JSDoc comments to all functions

**Version Control**:
- Use semantic versioning
- Tag production deployments
- Maintain changelog

**Monitoring**:
- Monitor Vercel function logs for errors
- Track diagnostic completion rates
- Monitor Core Web Vitals
- Set up alerts for critical errors

## Conclusion

This design provides a comprehensive blueprint for implementing the Claim Readiness Diagnostic as a complete homepage replacement. The architecture prioritizes trust, transparency, and ethical user experience through objective assessments and clear explanations.

The system is built using vanilla JavaScript for optimal performance, with strategic use of CSS animations for smooth interactions. It integrates seamlessly with existing Calendly and Stripe infrastructure without requiring modifications to existing code.

The dual testing approach (unit tests + property-based tests) ensures both specific functionality and universal correctness properties are verified. The design addresses all requirements from the requirements document and provides clear implementation guidance.

**Key Success Factors**:
- **Trust-First Design**: Objective recommendations without aggressive sales tactics
- **Transparency**: Clear explanation of why each recommendation was given
- **Simplicity**: One question at a time, minimal cognitive load
- **Performance**: Vanilla JavaScript, fast load times, smooth animations
- **Accessibility**: WCAG-compliant, keyboard navigable, screen reader compatible
- **Brand Alignment**: Matches Military Disability Nexus aesthetic
- **Data Collection**: Comprehensive analytics for business insights
- **Seamless Integration**: Works with existing Calendly and Stripe infrastructure

**Implementation Priorities**:
1. Core diagnostic flow (intro → questions → recommendation → transparency)
2. Scoring and recommendation engine
3. UI/UX with brand-aligned styling
4. Calendly integration for bookings
5. Data logging for analytics
6. Accessibility features
7. Performance optimizations
8. Comprehensive testing

**Success Metrics**:
- Diagnostic completion rate > 70%
- Time to complete < 3 minutes
- Booking conversion rate (measurable through Calendly)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility: WCAG AA compliance
- Zero critical errors in production

This design ensures the Claim Readiness Diagnostic will serve as an effective, ethical, and trustworthy tool for veterans to assess their VA claim readiness while providing valuable business insights for Military Disability Nexus.
