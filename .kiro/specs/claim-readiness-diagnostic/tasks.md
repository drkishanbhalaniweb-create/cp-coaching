# Implementation Plan

- [x] 1. Set up project structure and configuration data





  - Create question data constants with all 5 questions, titles, helpers, and answer options
  - Create recommendation configuration with score ranges, messages, colors, and CTA text
  - Define CSS custom properties for Military Disability Nexus brand colors and styling
  - Set up HTML structure with container elements for diagnostic screens
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 2. Implement ScoringEngine class





  - Write getPointsForAnswer method to map answer text to point values (0, 1, or 2)
  - Write calculateTotalScore method to sum all answer points
  - Write validateScore method to ensure score is between 0 and 10
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2.1 Write property test for Yes answers scoring


  - **Property 6: Yes answers score zero points**
  - **Validates: Requirements 5.1**

- [x] 2.2 Write property test for middle-ground answers scoring


  - **Property 7: Middle-ground answers score one point**
  - **Validates: Requirements 5.2**

- [x] 2.3 Write property test for negative answers scoring


  - **Property 8: Negative answers score two points**
  - **Validates: Requirements 5.3**

- [x] 2.4 Write property test for total score calculation


  - **Property 9: Total score is sum of answer points**
  - **Validates: Requirements 5.4**

- [x] 3. Implement RecommendationEngine class





  - Write getRecommendation method to map scores to recommendation categories
  - Write getRecommendationMessage method to return appropriate message text
  - Write getRecommendationColor method to return color based on category
  - Write getCTAText method to return appropriate CTA button text
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.1 Write property test for REVIEW_BENEFICIAL recommendation


  - **Property 10: Recommendation matches score range (beneficial)**
  - **Validates: Requirements 6.3**

- [x] 3.2 Write property test for REVIEW_STRONGLY_RECOMMENDED recommendation


  - **Property 11: Recommendation matches score range (strongly recommended)**
  - **Validates: Requirements 6.4**

- [x] 3.3 Write property test for recommendation color matching


  - **Property 12: Recommendation color matches category**
  - **Validates: Requirements 6.5**

- [x] 3.4 Write unit tests for edge case recommendations


  - Test score = 0 → FULLY_READY
  - Test score = 1-2 → OPTIONAL_CONFIRMATION
  - Test score boundaries (2→3, 6→7)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement DiagnosticController class





  - Write constructor to initialize state and answer storage
  - Write setState method to manage current screen state
  - Write recordAnswer method to store answers with points
  - Write calculateScore method using ScoringEngine
  - Write start method to transition from intro to Q1
  - Write nextQuestion method to advance through questions
  - Write showRecommendation method to display results
  - _Requirements: 2.1, 2.5, 5.4_

- [x] 4.1 Write unit tests for DiagnosticController

  - Test state transitions
  - Test answer recording
  - Test score calculation integration
  - _Requirements: 2.1, 2.5, 5.4_

- [x] 5. Implement QuestionRenderer class





  - Write renderIntro method to display intro screen with trust notes
  - Write renderQuestion method to display question with progress indicator
  - Write renderRecommendation method to display recommendation with appropriate styling
  - Write renderTransparency method to display assessment area breakdown
  - Write onAnswerSelected event handler
  - Write onStartClicked event handler
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2_

- [x] 5.1 Write property test for one question per screen


  - **Property 1: One question per screen**
  - **Validates: Requirements 2.1**

- [x] 5.2 Write property test for progress indicator accuracy

  - **Property 2: Progress indicator accuracy**
  - **Validates: Requirements 2.3**

- [x] 5.3 Write property test for progress bar percentage

  - **Property 3: Progress bar percentage accuracy**
  - **Validates: Requirements 2.4**

- [x] 5.4 Write property test for three answer options

  - **Property 5: Three answer options per question**
  - **Validates: Requirements 4.1**

- [x] 5.5 Write unit tests for QuestionRenderer

  - Test intro screen renders correct content
  - Test each question renders correct text and options
  - Test recommendation screen renders correct message
  - Test transparency layer renders correct breakdown
  - _Requirements: 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2_

- [x] 6. Implement transparency layer rendering





  - Write logic to map answer points to status indicators (✅, ⚠️, ❌)
  - Write renderTransparency method to display all five assessment areas
  - Apply appropriate styling for each status level
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.1 Write property test for adequate status display


  - **Property 13: Transparency display for adequate answers**
  - **Validates: Requirements 7.3**

- [x] 6.2 Write property test for needs attention status display


  - **Property 14: Transparency display for needs attention**
  - **Validates: Requirements 7.4**

- [x] 6.3 Write property test for missing status display


  - **Property 15: Transparency display for missing**
  - **Validates: Requirements 7.5**

- [x] 7. Implement animation system





  - Write transitionOut method with fade/slide animations
  - Write transitionIn method for screen entrance
  - Add CSS classes for fade-out, fade-in, slide-out, slide-in
  - Implement prefers-reduced-motion detection and instant transitions
  - Add visual feedback animation for answer selection
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 7.1 Write property test for auto-advance on answer selection


  - **Property 4: Auto-advance on answer selection**
  - **Validates: Requirements 2.5**

- [x] 7.2 Write property test for question transition animations


  - **Property 28: Question transition animations**
  - **Validates: Requirements 15.1**

- [x] 7.3 Write property test for answer selection visual feedback


  - **Property 29: Answer selection visual feedback**
  - **Validates: Requirements 15.2**

- [x] 7.4 Write property test for animation duration


  - **Property 30: Animation duration constraint**
  - **Validates: Requirements 15.3**

- [x] 7.5 Write property test for reduced motion support


  - **Property 31: Reduced motion respect**
  - **Validates: Requirements 15.4**

- [x] 7.6 Write property test for no layout shift


  - **Property 32: No layout shift from animations**
  - **Validates: Requirements 15.5**

- [x] 8. Implement localStorage persistence





  - Write saveToLocalStorage method in DiagnosticController
  - Write loadFromLocalStorage method to restore session
  - Store session ID, timestamps, answers, score, and recommendation
  - Handle localStorage errors gracefully (quota exceeded, disabled)
  - _Requirements: 9.1_

- [x] 8.1 Write property test for localStorage persistence


  - **Property 18: localStorage persistence on completion**
  - **Validates: Requirements 9.1**

- [x] 8.2 Write unit tests for localStorage operations

  - Test data is saved correctly
  - Test data can be loaded
  - Test error handling for quota exceeded
  - _Requirements: 9.1_

- [x] 9. Implement DataLogger class





  - Write logDiagnostic method to POST data to backend
  - Write formatPayload method to create JSON payload with timestamp, answers, score, recommendation
  - Implement error handling that doesn't block user experience
  - Add CORS headers to request
  - _Requirements: 9.2, 9.3_

- [x] 9.1 Write property test for diagnostic payload structure


  - **Property 19: Diagnostic payload structure**
  - **Validates: Requirements 9.3**

- [x] 9.2 Write unit tests for DataLogger


  - Test payload formatting
  - Test POST request is made
  - Test error handling doesn't block user
  - _Requirements: 9.2, 9.3_

- [x] 10. Create /api/log-diagnostic.js serverless function





  - Validate request payload structure (timestamp, answers, score, recommendation)
  - Generate unique ID for each diagnostic session
  - Implement JSON file storage (append to /data/diagnostics.json)
  - Return success response with session ID
  - Add error handling and logging
  - Configure CORS headers
  - _Requirements: 9.2, 9.3, 9.4_

- [x] 10.1 Write unit tests for log-diagnostic endpoint


  - Test valid payload is accepted
  - Test invalid payload is rejected
  - Test unique ID generation
  - Test CORS headers
  - _Requirements: 9.2, 9.3_

- [x] 11. Implement CalendlyIntegration class





  - Write init method to load Calendly embed script from CDN
  - Write openPopup method to display Calendly in modal
  - Write onEventScheduled method to handle booking events
  - Add error handling for script load failures
  - Display fallback contact information if Calendly fails
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 11.1 Write property test for Calendly trigger on CTA click


  - **Property 17: Calendly trigger on CTA click**
  - **Validates: Requirements 8.3**

- [x] 11.2 Write unit tests for CalendlyIntegration

  - Test script loading
  - Test popup initialization
  - Test event handling
  - Test error handling
  - _Requirements: 8.2, 8.3, 8.5_

- [x] 12. Implement CTA button logic





  - Write logic to determine which CTA to display based on recommendation
  - Display "Book Claim Readiness Review" for OPTIONAL, BENEFICIAL, STRONGLY_RECOMMENDED
  - Display "Book review for peace of mind" for FULLY_READY
  - Wire CTA buttons to CalendlyIntegration.openPopup()
  - _Requirements: 8.1, 8.2_

- [x] 12.1 Write property test for CTA display logic


  - **Property 16: CTA display for non-ready recommendations**
  - **Validates: Requirements 8.1**

- [x] 12.2 Write unit tests for CTA button rendering


  - Test correct CTA text for each recommendation
  - Test CTA click triggers Calendly
  - _Requirements: 8.1, 8.2_

- [x] 13. Integrate Stripe payment flow (preserve existing)





  - Verify existing /api/create-checkout-session.js works with diagnostic
  - Add payment trigger for paid bookings if needed
  - Ensure Stripe.js v3 is loaded
  - Test redirect to success page after payment
  - Implement error handling with user-friendly messages
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13.1 Write property test for payment success redirect


  - **Property 20: Payment success redirect**
  - **Validates: Requirements 10.4**

- [x] 13.2 Write property test for payment error handling


  - **Property 21: Payment error handling**
  - **Validates: Requirements 10.5**

- [x] 13.3 Write integration test for payment flow



  - Test complete flow from CTA to Stripe to success page
  - Test error scenarios
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 14. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement responsive design





  - Add CSS media queries for mobile (≤768px), tablet (769-1024px), desktop (>1024px)
  - Ensure layouts adapt properly at 320px, 768px, 1024px, 1920px
  - Implement mobile-first CSS approach
  - Ensure touch targets are minimum 44x44px on mobile
  - Test on various devices and screen sizes
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 15.1 Write property test for responsive layout adaptation


  - **Property 22: Responsive layout adaptation**
  - **Validates: Requirements 11.2**

- [x] 15.2 Write property test for touch target sizing


  - **Property 23: Touch target minimum size**
  - **Validates: Requirements 11.3**

- [x] 16. Implement accessibility features





  - Add ARIA labels to all interactive elements (buttons, answer cards)
  - Ensure proper semantic HTML structure
  - Implement keyboard navigation support (Tab, Enter, Space)
  - Add visible focus indicators with appropriate styling
  - Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
  - Test with screen readers (NVDA, JAWS, VoiceOver)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 16.1 Write property test for ARIA labels


  - **Property 24: ARIA labels on interactive elements**
  - **Validates: Requirements 12.1**

- [x] 16.2 Write property test for keyboard navigation

  - **Property 25: Keyboard navigation support**
  - **Validates: Requirements 12.2**

- [x] 16.3 Write property test for color contrast

  - **Property 26: WCAG color contrast compliance**
  - **Validates: Requirements 12.3**

- [x] 16.4 Write property test for focus indicators

  - **Property 27: Focus indicator visibility**
  - **Validates: Requirements 12.5**

- [x] 17. Implement glassmorphism styling





  - Apply glassmorphism effects to answer cards and containers
  - Use soft blur backgrounds with backdrop-filter
  - Apply navy/deep blue gradients to background
  - Use rounded corners (12-16px) and subtle shadows
  - Ensure red is used only for high-risk states and primary CTAs
  - Maintain heavy white space throughout
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 18. Wire up complete diagnostic flow





  - Connect intro screen "Start Diagnostic" button to DiagnosticController.start()
  - Connect answer selections to DiagnosticController.recordAnswer()
  - Connect question transitions to QuestionRenderer animations
  - Connect recommendation display to RecommendationEngine
  - Connect transparency layer to answer data
  - Connect CTA buttons to CalendlyIntegration
  - Connect completion to DataLogger
  - _Requirements: 1.1, 2.1, 2.5, 6.1, 6.2, 6.3, 6.4, 7.1, 8.1, 9.1_

- [x] 18.1 Write integration test for complete diagnostic flow


  - Test flow from intro through all questions to recommendation
  - Test transparency layer displays correctly
  - Test data is logged correctly
  - _Requirements: 1.1, 2.1, 2.5, 6.1, 6.2, 6.3, 6.4, 7.1, 9.1_

- [x] 19. Performance optimization





  - Inline all CSS to eliminate render-blocking requests
  - Minimize JavaScript bundle size
  - Use efficient DOM manipulation (minimize reflows)
  - Optimize images and assets
  - Add preconnect links for Calendly and Stripe domains
  - Test First Contentful Paint < 1.5s
  - Test Largest Contentful Paint < 2.5s
  - Test Cumulative Layout Shift < 0.1
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 19.1 Write performance tests


  - Run Lighthouse and verify score ≥ 90
  - Test Core Web Vitals metrics
  - _Requirements: 14.2_

- [x] 20. Cross-browser testing




  - Test on Chrome (latest 2 versions)
  - Test on Firefox (latest 2 versions)
  - Test on Safari (latest 2 versions)
  - Test on Mobile Safari (iOS 13+)
  - Test on Chrome Mobile (Android 8+)
  - Verify all functionality works across browsers
  - _Requirements: 11.5_

- [x] 21. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Deployment preparation




  - Update vercel.json configuration if needed
  - Verify environment variables are set correctly
  - Create /data directory for diagnostic logs
  - Test deployment on Vercel preview
  - Verify all API endpoints work in production
  - Test complete flow in production environment
  - _Requirements: All_



- [x] 23. Documentation


  - Document question configuration format
  - Document recommendation configuration format
  - Document API endpoint specifications
  - Document localStorage schema
  - Document deployment process
  - Create README with setup instructions
  - _Requirements: All_
