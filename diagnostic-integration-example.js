/**
 * Diagnostic Integration Example
 * 
 * This file demonstrates how to wire together all the diagnostic components,
 * including the CTA button to CalendlyIntegration.openPopup()
 * 
 * This is an example implementation showing the proper integration pattern.
 */

// Import required modules (in browser, these would be loaded via script tags)
// const DiagnosticController = require('./DiagnosticController.js');
// const QuestionRenderer = require('./QuestionRenderer.js');
// const CalendlyIntegration = require('./CalendlyIntegration.js');
// const DataLogger = require('./DataLogger.js');
// const { QUESTIONS } = require('./diagnostic-config.js');

/**
 * Initialize and wire up the diagnostic application
 */
function initializeDiagnostic() {
  // Get the main container element
  const container = document.querySelector('.diagnostic-container');
  
  // Initialize components
  const diagnosticController = new DiagnosticController();
  const questionRenderer = new QuestionRenderer(container);
  const calendlyIntegration = new CalendlyIntegration('https://calendly.com/your-link/claim-readiness-review');
  const dataLogger = new DataLogger();
  
  // Initialize Calendly
  calendlyIntegration.init().then(() => {
    console.log('Calendly integration ready');
  });
  
  // ============================================
  // WIRE UP EVENT HANDLERS
  // ============================================
  
  /**
   * Handle start button click
   */
  questionRenderer.onStartClicked(() => {
    console.log('Starting diagnostic');
    diagnosticController.start();
    renderCurrentState();
  });
  
  /**
   * Handle answer selection
   */
  questionRenderer.onAnswerSelected((questionId, answerText, points) => {
    console.log(`Answer selected: ${questionId} = ${answerText} (${points} points)`);
    
    // Record the answer
    diagnosticController.recordAnswer(questionId, answerText, points);
    
    // Add visual feedback delay before advancing
    setTimeout(() => {
      // Advance to next question or show recommendation
      diagnosticController.nextQuestion();
      renderCurrentState();
    }, 400); // Match animation duration
  });
  
  /**
   * Handle CTA button click - WIRE TO CALENDLY
   * This is the key integration point for task 12
   */
  questionRenderer.onBookingClicked(() => {
    console.log('CTA button clicked - opening Calendly');
    
    // Get the current recommendation to determine which CTA was clicked
    const recommendation = diagnosticController.getRecommendation();
    
    // Log the booking intent
    console.log(`Booking initiated from recommendation: ${recommendation.category}`);
    
    // Open Calendly popup
    calendlyIntegration.openPopup();
    
    // Optional: Track booking intent for analytics
    // analytics.track('booking_initiated', {
    //   recommendation: recommendation.category,
    //   score: recommendation.score
    // });
  });
  
  /**
   * Handle successful Calendly booking
   */
  calendlyIntegration.onEventScheduled((eventData) => {
    console.log('Booking confirmed:', eventData);
    
    // Optional: Show success message or redirect
    alert('Your Claim Readiness Review has been scheduled! Check your email for confirmation.');
    
    // Optional: Track successful booking
    // analytics.track('booking_completed', {
    //   event: eventData
    // });
  });
  
  // ============================================
  // RENDERING LOGIC
  // ============================================
  
  /**
   * Render the current state of the diagnostic
   */
  function renderCurrentState() {
    const state = diagnosticController.getCurrentState();
    
    // Handle transitions with animations
    questionRenderer.transitionOut(() => {
      // Render based on current state
      if (state === 'intro') {
        questionRenderer.renderIntro();
      } else if (state.startsWith('question_')) {
        // Extract question number from state (e.g., 'question_1' -> 1)
        const questionNumber = parseInt(state.split('_')[1]);
        const questionData = QUESTIONS[questionNumber - 1];
        
        questionRenderer.renderQuestion(questionData, questionNumber, 5);
      } else if (state === 'recommendation') {
        // Calculate score and get recommendation
        const score = diagnosticController.calculateScore();
        const recommendation = diagnosticController.getRecommendation();
        
        // Render recommendation screen
        questionRenderer.renderRecommendation(recommendation);
        
        // Render transparency layer
        const answers = diagnosticController.getAnswers();
        questionRenderer.renderTransparency(answers);
        
        // Save to localStorage
        try {
          diagnosticController.saveToLocalStorage();
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
        
        // Log diagnostic data to backend
        dataLogger.logDiagnostic({
          timestamp: new Date().toISOString(),
          answers: answers,
          score: score,
          recommendation: recommendation.category
        }).catch(error => {
          console.error('Failed to log diagnostic data:', error);
          // Don't block user experience on logging failure
        });
      }
      
      // Transition in the new screen
      questionRenderer.transitionIn();
    });
  }
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  // Render initial state (intro screen)
  renderCurrentState();
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiagnostic);
  } else {
    initializeDiagnostic();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeDiagnostic };
}
