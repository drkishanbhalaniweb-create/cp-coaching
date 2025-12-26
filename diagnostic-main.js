/**
 * Claim Readiness Diagnostic - Main Integration Script
 * 
 * This script wires together all diagnostic components:
 * - DiagnosticController for state management
 * - QuestionRenderer for UI rendering
 * - ScoringEngine for score calculation
 * - RecommendationEngine for recommendations
 * - DataLogger for analytics
 * 
 * Requirements: 1.1, 2.1, 2.5, 6.1, 6.2, 6.3, 6.4, 7.1, 8.1, 9.1
 * 
 * Note: All dependencies are loaded via script tags in diagnostic.html before this file
 */

/**
 * Main diagnostic application class
 */
class DiagnosticApp {
  constructor() {
    this.controller = null;
    this.renderer = null;
    this.logger = null;
    this.initialized = false;
  }

  /**
   * Initialize the diagnostic application
   */
  async init() {
    try {
      // Get the main container element
      const container = document.querySelector('.diagnostic-container');
      
      if (!container) {
        throw new Error('Diagnostic container not found');
      }

      // Initialize components
      this.controller = new DiagnosticController();
      this.renderer = new QuestionRenderer(container);
      this.logger = new DataLogger();

      // Wire up event handlers
      this.wireUpEventHandlers();

      // Render initial state (intro screen)
      this.renderCurrentState();

      this.initialized = true;
      console.log('Diagnostic application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize diagnostic application:', error);
      throw error;
    }
  }

  /**
   * Wire up all event handlers
   */
  wireUpEventHandlers() {
    // Handle start button click
    this.renderer.onStartClicked(() => {
      console.log('Starting diagnostic');
      this.controller.start();
      this.renderCurrentState();
    });

    // Handle answer selection
    this.renderer.onAnswerSelected((questionId, answerText, points) => {
      console.log(`Answer selected: ${questionId} = ${answerText} (${points} points)`);
      
      // Record the answer
      this.controller.recordAnswer(questionId, answerText, points);
      
      // Add visual feedback delay before advancing
      setTimeout(() => {
        // Advance to next question or show recommendation
        this.controller.nextQuestion();
        this.renderCurrentState();
      }, 400); // Match animation duration
    });

    // Handle CTA button click - redirect to results page
    this.renderer.onBookingClicked(() => {
      console.log('CTA button clicked - redirecting to results page');
      this.redirectToResults();
    });
  }

  /**
   * Render the current state of the diagnostic
   */
  renderCurrentState() {
    const state = this.controller.getCurrentState();
    
    // Handle transitions with animations
    this.renderer.transitionOut(() => {
      // Render based on current state
      if (state === 'intro') {
        this.renderer.renderIntro();
      } else if (state.startsWith('question_')) {
        // Extract question number from state (e.g., 'question_1' -> 1)
        const questionNumber = parseInt(state.split('_')[1]);
        const questionData = QUESTIONS[questionNumber - 1];
        
        this.renderer.renderQuestion(questionData, questionNumber, 5);
      } else if (state === 'recommendation') {
        // Calculate score and get recommendation
        const score = this.controller.calculateScore();
        const recommendation = this.controller.getRecommendation();
        
        // Render recommendation screen
        this.renderer.renderRecommendation(recommendation);
        
        // Render transparency layer
        const answers = this.controller.getAnswers();
        this.renderer.renderTransparency(answers);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Log diagnostic data to backend
        this.logDiagnosticData();
        
        // Automatically redirect to results page after a brief delay
        setTimeout(() => {
          this.redirectToResults();
        }, 1500); // Give user time to see the recommendation before redirecting
      }
      
      // Transition in the new screen
      this.renderer.transitionIn();
    });
  }

  /**
   * Save diagnostic data to localStorage
   */
  saveToLocalStorage() {
    try {
      this.controller.saveToLocalStorage();
      console.log('Diagnostic data saved to localStorage');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Don't block user experience on localStorage failure
    }
  }

  /**
   * Log diagnostic data to backend
   */
  async logDiagnosticData() {
    try {
      const answers = this.controller.getAnswers();
      const score = this.controller.getScore();
      const recommendation = this.controller.getRecommendation();
      
      const result = await this.logger.logDiagnostic({
        answers: answers,
        score: score,
        recommendation: recommendation.category
      });
      
      if (result.success !== false) {
        console.log('Diagnostic data logged successfully:', result);
      }
    } catch (error) {
      console.error('Failed to log diagnostic data:', error);
      // Don't block user experience on logging failure
    }
  }

  /**
   * Redirect to results page with diagnostic data
   */
  redirectToResults() {
    try {
      const recommendation = this.controller.getRecommendation();
      
      // Log the redirect
      console.log(`Redirecting to results page with recommendation: ${recommendation.category}`);
      
      // Mark that user has completed diagnostic
      sessionStorage.setItem('diagnosticCompleted', 'true');
      sessionStorage.setItem('diagnosticRecommendation', recommendation.category);
      
      // Redirect to the results page
      window.location.href = '/results.html';
    } catch (error) {
      console.error('Failed to redirect to results:', error);
      // Fallback redirect
      window.location.href = '/results.html';
    }
  }

  /**
   * Show booking confirmation message
   */
  showBookingConfirmation() {
    // Create a simple confirmation overlay
    const confirmationHtml = `
      <div class="booking-confirmation-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 300ms ease;
      ">
        <div class="booking-confirmation-content" style="
          background: white;
          padding: 32px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          text-align: center;
        ">
          <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
          
          <h2 style="
            margin: 0 0 16px 0;
            font-size: 24px;
            color: #163b63;
          ">Booking Confirmed!</h2>
          
          <p style="
            margin: 0 0 24px 0;
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
          ">
            Your Claim Readiness Review has been scheduled. 
            Check your email for confirmation details.
          </p>
          
          <button class="booking-confirmation-close" style="
            width: 100%;
            padding: 12px 24px;
            background: #163b63;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    
    // Insert confirmation into DOM
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = confirmationHtml;
    const overlay = tempContainer.firstElementChild;
    document.body.appendChild(overlay);
    
    // Add close button handler
    const closeButton = overlay.querySelector('.booking-confirmation-close');
    
    const closeConfirmation = () => {
      overlay.style.animation = 'fadeOut 300ms ease';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    };
    
    closeButton.addEventListener('click', closeConfirmation);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeConfirmation();
      }
    });
  }
}

/**
 * Initialize the diagnostic application when DOM is ready
 */
function initializeDiagnostic() {
  const app = new DiagnosticApp();
  app.init().catch(error => {
    console.error('Failed to initialize diagnostic:', error);
  });
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
  module.exports = { DiagnosticApp, initializeDiagnostic };
}
