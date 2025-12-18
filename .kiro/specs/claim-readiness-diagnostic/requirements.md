# Requirements Document

## Introduction

This document specifies requirements for the Claim Readiness Diagnostic, a decision-support tool that completely replaces the existing homepage. The diagnostic guides veterans through five questions to assess whether their VA claim is ready to file, providing objective recommendations based on their responses. This is not a lead generation form or quiz gimmick - it is an educational, trust-first diagnostic that helps veterans make informed decisions about their claims.

## Glossary

- **Claim Readiness Diagnostic**: An interactive assessment tool that evaluates a veteran's preparedness to file a VA disability claim
- **Diagnostic System**: The complete system including question flow, scoring logic, recommendation engine, and transparency layer
- **Question Screen**: A single-page view displaying one question with answer options
- **Score**: A numerical value (0-10) calculated from user answers that determines the recommendation
- **Recommendation Engine**: The logic that maps scores to specific recommendation categories
- **Transparency Layer**: A detailed breakdown showing why a specific recommendation was given
- **Calendly**: Third-party scheduling service for booking Claim Readiness Review appointments
- **Stripe**: Third-party payment processing service for paid services
- **Service Connection**: Medical records, nexus letters, or documented in-service events linking a condition to military service
- **Nexus Letter**: A medical opinion letter establishing the connection between a current condition and military service
- **Secondary Condition**: A disability caused by or aggravated by a service-connected condition
- **VA Denial**: A decision by the Department of Veterans Affairs to deny a disability claim
- **Claim Pathway**: The specific type of VA claim (new, supplemental, or increase) that must be selected correctly

## Requirements

### Requirement 1

**User Story:** As a veteran landing on the homepage, I want to immediately see the Claim Readiness Diagnostic, so that I can assess my claim readiness without navigating through marketing content.

#### Acceptance Criteria

1. WHEN a user navigates to the homepage THEN the system SHALL display the diagnostic intro screen as the first and primary content
2. THE system SHALL NOT display hero sections, long-form sales copy, or "learn more" content before the diagnostic
3. THE diagnostic intro screen SHALL display the title "Claim Readiness Diagnostic"
4. THE diagnostic intro screen SHALL display the subtitle "Answer five quick questions to see if your VA claim is ready to file — or if a review would help"
5. THE diagnostic intro screen SHALL display trust notes indicating "Takes ~2 minutes", "No email required", "Educational & veteran-first", and "Not affiliated with the VA"

### Requirement 2

**User Story:** As a veteran using the diagnostic, I want to answer one question at a time, so that I can focus on each question without feeling overwhelmed.

#### Acceptance Criteria

1. WHEN a user starts the diagnostic THEN the system SHALL display exactly one question per screen
2. THE system SHALL NOT display all questions simultaneously on a single page
3. WHEN a question screen loads THEN the system SHALL display a progress indicator showing "Step X of 5"
4. THE system SHALL display a visual progress bar showing completion percentage
5. WHEN a user selects an answer THEN the system SHALL automatically advance to the next question without requiring a "Next" button click

### Requirement 3

**User Story:** As a veteran answering diagnostic questions, I want clear context for each question, so that I understand what information is being assessed.

#### Acceptance Criteria

1. WHEN Question 1 displays THEN the system SHALL show "Service connection clearly documented?" with helper text "Medical records, nexus letters, or documented in-service events linking the condition"
2. WHEN Question 2 displays THEN the system SHALL show "Prior VA denial reasons addressed?" with helper text "Previous denial letters explain exactly what was missing"
3. WHEN Question 3 displays THEN the system SHALL show "Correct claim pathway selected?" with helper text "New, supplemental, or increase claims must follow the correct path"
4. WHEN Question 4 displays THEN the system SHALL show "Medical severity & impact documented?" with helper text "Symptoms, flare-ups, and functional impact on daily life"
5. WHEN Question 5 displays THEN the system SHALL show "All conditions & secondaries identified?" with helper text "Secondary conditions are often missed but materially affect ratings"

### Requirement 4

**User Story:** As a veteran answering questions, I want three clear answer options for each question, so that I can accurately represent my situation.

#### Acceptance Criteria

1. WHEN any question displays THEN the system SHALL provide exactly three selectable answer cards
2. WHEN Question 1 displays THEN the system SHALL provide options "No" (2 points), "Somewhat" (1 point), and "Yes" (0 points)
3. WHEN Question 2 displays THEN the system SHALL provide options "No" (2 points), "Partially" (1 point), and "Yes" (0 points)
4. WHEN Question 3 displays THEN the system SHALL provide options "Not sure" (2 points), "Somewhat" (1 point), and "Yes" (0 points)
5. WHEN Questions 4 and 5 display THEN the system SHALL provide options "No" (2 points), "Somewhat" (1 point), and "Yes" (0 points)

### Requirement 5

**User Story:** As a veteran completing the diagnostic, I want my answers scored objectively, so that I receive an accurate assessment of my claim readiness.

#### Acceptance Criteria

1. THE system SHALL assign 0 points for "Yes" answers
2. THE system SHALL assign 1 point for "Somewhat", "Partially", or similar middle-ground answers
3. THE system SHALL assign 2 points for "No", "Not sure", or similar negative answers
4. WHEN all questions are answered THEN the system SHALL calculate the total score by summing all answer point values
5. THE total score SHALL range from 0 (all "Yes" answers) to 10 (all "No" answers)

### Requirement 6

**User Story:** As a veteran receiving my diagnostic results, I want an objective recommendation based on my score, so that I understand whether I need a Claim Readiness Review.

#### Acceptance Criteria

1. WHEN the total score equals 0 THEN the system SHALL display the "FULLY READY" recommendation with message "Your claim is FULLY READY. No Claim Readiness Review is needed"
2. WHEN the total score is 1 or 2 THEN the system SHALL display the "OPTIONAL CONFIRMATION" recommendation with message "Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation"
3. WHEN the total score is between 3 and 6 THEN the system SHALL display the "REVIEW BENEFICIAL" recommendation with message "Your claim would BENEFIT from a Claim Readiness Review before filing"
4. WHEN the total score is 7 or greater THEN the system SHALL display the "REVIEW STRONGLY RECOMMENDED" recommendation with message "Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED"
5. THE recommendation SHALL use appropriate visual indicators: green for FULLY READY, blue for OPTIONAL CONFIRMATION, yellow for REVIEW BENEFICIAL, and red for REVIEW STRONGLY RECOMMENDED

### Requirement 7

**User Story:** As a veteran viewing my recommendation, I want to understand why I received this result, so that I can trust the diagnostic process.

#### Acceptance Criteria

1. WHEN the recommendation screen displays THEN the system SHALL show a transparency layer titled "Why this recommendation was shown"
2. THE transparency layer SHALL list all five assessment areas: "Service connection clarity", "Denial handling", "Pathway selection", "Severity documentation", and "Missing secondaries"
3. WHEN an answer scored 0 points THEN the system SHALL display "✅ Adequate" for that assessment area
4. WHEN an answer scored 1 point THEN the system SHALL display "⚠️ Needs attention" for that assessment area
5. WHEN an answer scored 2 points THEN the system SHALL display "❌ Missing" for that assessment area

### Requirement 8

**User Story:** As a veteran who needs a review, I want to book a Claim Readiness Review appointment, so that I can get professional help with my claim.

#### Acceptance Criteria

1. WHEN the recommendation is "OPTIONAL CONFIRMATION", "REVIEW BENEFICIAL", or "REVIEW STRONGLY RECOMMENDED" THEN the system SHALL display a "Book Claim Readiness Review" call-to-action button
2. WHEN the recommendation is "FULLY READY" THEN the system SHALL display an optional "Book review for peace of mind" call-to-action
3. WHEN a user clicks the booking call-to-action THEN the system SHALL trigger the Calendly booking interface
4. THE Calendly integration SHALL preserve existing configuration and functionality
5. THE system SHALL support both inline embed and modal display options for Calendly

### Requirement 9

**User Story:** As a business owner, I want to collect diagnostic data, so that I can review veteran needs and improve the service.

#### Acceptance Criteria

1. WHEN a user completes the diagnostic THEN the system SHALL store answers and score in localStorage
2. THE system SHALL provide a POST endpoint at /api/log-diagnostic.js to receive diagnostic data
3. THE diagnostic data payload SHALL include timestamp, all five answers with their point values, total score, and recommendation category
4. THE system SHALL store diagnostic data in a reviewable format (JSON file, database, or log dashboard)
5. THE stored data SHALL be accessible for business review and analysis

### Requirement 10

**User Story:** As a veteran who needs to pay for services, I want the payment integration to work seamlessly, so that I can complete my booking without issues.

#### Acceptance Criteria

1. WHEN payment is required for a booking THEN the system SHALL use the existing /api/create-checkout-session.js endpoint
2. THE system SHALL use Stripe.js v3 for payment processing
3. THE payment integration SHALL maintain all existing functionality without regression
4. WHEN payment is successful THEN the system SHALL redirect to the appropriate success page
5. THE system SHALL handle payment errors gracefully with user-friendly messages

### Requirement 11

**User Story:** As a veteran using the diagnostic on any device, I want the interface to work perfectly, so that I can complete the assessment regardless of my device.

#### Acceptance Criteria

1. THE diagnostic SHALL use a mobile-first design approach
2. THE diagnostic SHALL adapt to mobile, tablet, and desktop screen sizes
3. THE diagnostic SHALL provide large tap targets suitable for touch interaction
4. WHEN viewed on mobile devices THEN the system SHALL maintain readability and usability of all content
5. THE diagnostic SHALL function correctly on all modern browsers (Chrome, Firefox, Safari, Edge)

### Requirement 12

**User Story:** As a veteran with accessibility needs, I want the diagnostic to be fully accessible, so that I can use it regardless of my abilities.

#### Acceptance Criteria

1. THE diagnostic SHALL include ARIA labels on all interactive elements
2. THE diagnostic SHALL support full keyboard navigation
3. THE diagnostic SHALL maintain WCAG-compliant color contrast ratios
4. THE diagnostic SHALL be compatible with screen readers
5. THE diagnostic SHALL provide clear focus indicators for keyboard navigation

### Requirement 13

**User Story:** As a veteran using the diagnostic, I want the interface to match the Military Disability Nexus brand, so that I feel confident in the service.

#### Acceptance Criteria

1. THE diagnostic SHALL use glassmorphism cards with soft blur backgrounds
2. THE diagnostic SHALL use navy/deep blue gradients as primary colors
3. THE diagnostic SHALL use red only for high-risk states or primary call-to-action buttons
4. THE diagnostic SHALL use rounded corners (12-16px) and subtle shadows
5. THE diagnostic SHALL maintain heavy white space and a calm, trust-first, clinical aesthetic

### Requirement 14

**User Story:** As a developer, I want the diagnostic built with vanilla JavaScript, so that it loads quickly and performs well.

#### Acceptance Criteria

1. THE diagnostic SHALL be built using vanilla HTML, CSS, and JavaScript without frameworks
2. THE diagnostic SHALL achieve fast load times and smooth interactions
3. THE diagnostic SHALL use efficient DOM manipulation techniques
4. THE diagnostic SHALL minimize JavaScript bundle size
5. THE diagnostic SHALL use CSS animations where possible instead of JavaScript animations

### Requirement 15

**User Story:** As a veteran completing the diagnostic, I want smooth transitions between questions, so that the experience feels polished and professional.

#### Acceptance Criteria

1. WHEN transitioning between questions THEN the system SHALL use smooth fade or slide animations
2. WHEN an answer is selected THEN the system SHALL provide visual feedback before advancing
3. THE animations SHALL complete within 300-500 milliseconds
4. THE animations SHALL respect the user's prefers-reduced-motion settings
5. THE animations SHALL not cause layout shifts or visual jank
