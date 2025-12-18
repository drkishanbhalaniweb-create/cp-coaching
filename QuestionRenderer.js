/**
 * QuestionRenderer - Handles UI rendering for the Claim Readiness Diagnostic
 * 
 * This class is responsible for:
 * - Rendering the intro screen with trust notes
 * - Rendering question screens with progress indicators
 * - Rendering recommendation screens with appropriate styling
 * - Rendering transparency layer showing assessment breakdown
 * - Handling user interactions (answer selection, start button)
 * - Managing screen transitions and animations
 * 
 * Note: Depends on QUESTIONS, ASSESSMENT_AREAS, and STATUS_INDICATORS from diagnostic-config.js being loaded first
 */

class QuestionRenderer {
  /**
   * Initialize the renderer with a container element
   * @param {HTMLElement} containerElement - The main container for the diagnostic
   */
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error('Container element is required');
    }
    
    this.container = containerElement;
    this.callbacks = {
      onAnswerSelected: null,
      onStartClicked: null,
      onBookingClicked: null
    };
  }

  /**
   * Render the intro screen with trust notes
   */
  renderIntro() {
    const introScreen = this.container.querySelector('#intro-screen');
    
    if (!introScreen) {
      throw new Error('Intro screen element not found');
    }

    // Intro screen is already in the HTML, just make it visible
    this.hideAllScreens();
    introScreen.classList.add('active');

    // Set up start button event listener
    const startButton = introScreen.querySelector('#start-diagnostic-btn');
    if (startButton && this.callbacks.onStartClicked) {
      startButton.addEventListener('click', this.callbacks.onStartClicked);
    }
  }

  /**
   * Render a question screen with progress indicator
   * @param {Object} questionData - Question data from configuration
   * @param {number} currentStep - Current question number (1-5)
   * @param {number} totalSteps - Total number of questions (5)
   */
  renderQuestion(questionData, currentStep, totalSteps) {
    if (!questionData) {
      throw new Error('Question data is required');
    }

    if (currentStep < 1 || currentStep > totalSteps) {
      throw new Error(`Invalid step: ${currentStep}. Must be between 1 and ${totalSteps}`);
    }

    const questionScreen = this.container.querySelector('#question-screen');
    
    if (!questionScreen) {
      throw new Error('Question screen element not found');
    }

    // Hide all screens and show question screen
    this.hideAllScreens();
    questionScreen.classList.add('active');

    // Update progress indicator
    const progressIndicator = questionScreen.querySelector('#progress-indicator');
    if (progressIndicator) {
      progressIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
    }

    // Update progress bar using transform for better performance (no reflow)
    const progressBarContainer = questionScreen.querySelector('.progress-bar-container');
    const progressBar = questionScreen.querySelector('#progress-bar');
    if (progressBar && progressBarContainer) {
      const percentage = (currentStep / totalSteps) * 100;
      // Use transform: scaleX instead of width to avoid reflow
      progressBar.style.transform = `scaleX(${percentage / 100})`;
      
      // Update ARIA attributes for accessibility
      progressBarContainer.setAttribute('aria-valuenow', percentage.toString());
      progressBarContainer.setAttribute('aria-label', `Diagnostic progress: ${currentStep} of ${totalSteps} questions completed`);
    }

    // Update question title
    const questionTitle = questionScreen.querySelector('#question-title');
    if (questionTitle) {
      questionTitle.textContent = questionData.title;
    }

    // Update question helper text
    const questionHelper = questionScreen.querySelector('#question-helper');
    if (questionHelper) {
      questionHelper.textContent = questionData.helper;
    }

    // Render answer options
    this.renderAnswerOptions(questionData);
  }

  /**
   * Render answer option cards
   * @param {Object} questionData - Question data with options
   * @private
   */
  renderAnswerOptions(questionData) {
    const answerOptionsContainer = this.container.querySelector('#answer-options');
    
    if (!answerOptionsContainer) {
      throw new Error('Answer options container not found');
    }

    // Clear existing options
    answerOptionsContainer.innerHTML = '';

    // Get the document object (support both browser and JSDOM)
    const doc = this.container.ownerDocument || document;

    // Create answer cards for each option
    questionData.options.forEach((option, index) => {
      const answerCard = doc.createElement('button');
      answerCard.className = 'answer-card';
      answerCard.textContent = option.text;
      answerCard.setAttribute('role', 'button');
      answerCard.setAttribute('aria-label', `Select answer: ${option.text}`);
      answerCard.setAttribute('tabindex', '0');
      answerCard.dataset.questionId = questionData.id;
      answerCard.dataset.answerText = option.text;
      answerCard.dataset.points = option.points;

      // Add click event listener
      answerCard.addEventListener('click', () => {
        this.handleAnswerSelection(answerCard, questionData.id, option.text, option.points);
      });

      // Add keyboard support (Enter and Space)
      answerCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleAnswerSelection(answerCard, questionData.id, option.text, option.points);
        }
      });

      answerOptionsContainer.appendChild(answerCard);
    });
  }

  /**
   * Handle answer selection
   * @param {HTMLElement} selectedCard - The selected answer card
   * @param {string} questionId - Question identifier
   * @param {string} answerText - Selected answer text
   * @param {number} points - Points for this answer
   * @private
   */
  handleAnswerSelection(selectedCard, questionId, answerText, points) {
    // Add visual feedback animation
    this.addAnswerSelectionFeedback(selectedCard);
    selectedCard.classList.add('selected');

    // Call the callback if registered
    if (this.callbacks.onAnswerSelected) {
      this.callbacks.onAnswerSelected(questionId, answerText, points);
    }
  }

  /**
   * Render recommendation screen with appropriate styling
   * @param {Object} recommendationData - Recommendation data from RecommendationEngine
   */
  renderRecommendation(recommendationData) {
    if (!recommendationData) {
      throw new Error('Recommendation data is required');
    }

    const recommendationScreen = this.container.querySelector('#recommendation-screen');
    
    if (!recommendationScreen) {
      throw new Error('Recommendation screen element not found');
    }

    // Hide all screens and show recommendation screen
    this.hideAllScreens();
    recommendationScreen.classList.add('active');

    // Update recommendation icon
    const iconElement = recommendationScreen.querySelector('#recommendation-icon');
    if (iconElement) {
      iconElement.textContent = recommendationData.icon;
      iconElement.setAttribute('aria-label', `Recommendation: ${recommendationData.category}`);
    }

    // Update recommendation message
    const messageElement = recommendationScreen.querySelector('#recommendation-message');
    if (messageElement) {
      messageElement.textContent = recommendationData.message;
      messageElement.style.color = recommendationData.color;
    }

    // Update CTA button
    const ctaButton = recommendationScreen.querySelector('#cta-button');
    if (ctaButton) {
      ctaButton.textContent = recommendationData.ctaText;
      
      // Add event listener for booking
      if (this.callbacks.onBookingClicked) {
        ctaButton.addEventListener('click', this.callbacks.onBookingClicked);
      }
    }
  }

  /**
   * Render transparency layer showing assessment area breakdown
   * @param {Object} answersData - Object mapping question IDs to answer data
   */
  renderTransparency(answersData) {
    if (!answersData) {
      throw new Error('Answers data is required');
    }

    const assessmentAreasContainer = this.container.querySelector('#assessment-areas');
    
    if (!assessmentAreasContainer) {
      throw new Error('Assessment areas container not found');
    }

    // Clear existing content
    assessmentAreasContainer.innerHTML = '';

    // Get the document object (support both browser and JSDOM)
    const doc = this.container.ownerDocument || document;

    // Create assessment area elements for each question
    Object.entries(answersData).forEach(([questionId, answerData]) => {
      const areaName = ASSESSMENT_AREAS[questionId];
      const points = answerData.points;

      // Determine status based on points
      let status;
      if (points === 0) {
        status = STATUS_INDICATORS.ADEQUATE;
      } else if (points === 1) {
        status = STATUS_INDICATORS.NEEDS_ATTENTION;
      } else if (points === 2) {
        status = STATUS_INDICATORS.MISSING;
      }

      // Create assessment area element
      const areaElement = doc.createElement('div');
      areaElement.className = 'assessment-area';
      areaElement.setAttribute('role', 'listitem');

      // Create icon element
      const iconElement = doc.createElement('span');
      iconElement.className = 'assessment-icon';
      iconElement.textContent = status.icon;
      iconElement.setAttribute('aria-hidden', 'true');

      // Create label element
      const labelElement = doc.createElement('span');
      labelElement.className = 'assessment-label';
      labelElement.textContent = areaName;

      // Create status element
      const statusElement = doc.createElement('span');
      statusElement.className = 'assessment-status';
      statusElement.textContent = status.label;

      // Assemble the area element
      areaElement.appendChild(iconElement);
      areaElement.appendChild(labelElement);
      areaElement.appendChild(statusElement);

      assessmentAreasContainer.appendChild(areaElement);
    });
  }

  /**
   * Register callback for answer selection
   * @param {Function} callback - Function to call when answer is selected
   */
  onAnswerSelected(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onAnswerSelected = callback;
  }

  /**
   * Register callback for start button click
   * @param {Function} callback - Function to call when start is clicked
   */
  onStartClicked(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onStartClicked = callback;
  }

  /**
   * Register callback for booking button click
   * @param {Function} callback - Function to call when booking is clicked
   */
  onBookingClicked(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callbacks.onBookingClicked = callback;
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} True if reduced motion is preferred
   * @private
   */
  prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Transition out current screen with animation
   * @param {Function} callback - Function to call when transition completes
   */
  transitionOut(callback) {
    const activeScreen = this.container.querySelector('.screen.active');
    
    if (!activeScreen) {
      if (callback) callback();
      return;
    }

    // Check for reduced motion preference
    const reducedMotion = this.prefersReducedMotion();
    const duration = reducedMotion ? 0 : 400;

    // Add fade-out and slide-out classes
    activeScreen.classList.add('fade-out', 'slide-out');

    // Wait for animation to complete
    setTimeout(() => {
      activeScreen.classList.remove('active', 'fade-out', 'slide-out');
      if (callback) callback();
    }, duration);
  }

  /**
   * Transition in new screen with animation
   */
  transitionIn() {
    const activeScreen = this.container.querySelector('.screen.active');
    
    if (!activeScreen) {
      return;
    }

    // Check for reduced motion preference
    const reducedMotion = this.prefersReducedMotion();
    const duration = reducedMotion ? 0 : 400;

    // Start with fade-in and slide-in classes
    activeScreen.classList.add('fade-in', 'slide-in');

    // Clean up after animation
    setTimeout(() => {
      activeScreen.classList.remove('fade-in', 'slide-in');
    }, duration);
  }

  /**
   * Add visual feedback animation for answer selection
   * @param {HTMLElement} answerCard - The answer card element
   * @private
   */
  addAnswerSelectionFeedback(answerCard) {
    if (!answerCard) return;

    // Check for reduced motion preference
    const reducedMotion = this.prefersReducedMotion();
    
    if (reducedMotion) {
      // Instant feedback without animation
      answerCard.classList.add('selected');
      return;
    }

    // Add selection animation class
    answerCard.classList.add('answer-selected');

    // Remove animation class after it completes
    setTimeout(() => {
      answerCard.classList.remove('answer-selected');
    }, 300);
  }

  /**
   * Hide all screens
   * @private
   */
  hideAllScreens() {
    const screens = this.container.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionRenderer;
}
