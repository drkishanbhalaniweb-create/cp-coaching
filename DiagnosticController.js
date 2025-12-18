/**
 * DiagnosticController - Central state management for the Claim Readiness Diagnostic
 * 
 * This class is responsible for:
 * - Managing current state (intro, questions 1-5, recommendation, transparency)
 * - Storing user answers and calculated score
 * - Coordinating transitions between screens
 * - Persisting data to localStorage
 * - Triggering data logging to backend
 * 
 * Note: Depends on ScoringEngine, RecommendationEngine, and QUESTIONS being loaded first
 */

// State constants
const STATES = {
  INTRO: 'intro',
  QUESTION_1: 'question_1',
  QUESTION_2: 'question_2',
  QUESTION_3: 'question_3',
  QUESTION_4: 'question_4',
  QUESTION_5: 'question_5',
  RECOMMENDATION: 'recommendation',
  TRANSPARENCY: 'transparency'
};

class DiagnosticController {
  /**
   * Initialize the diagnostic controller
   */
  constructor() {
    this.currentState = STATES.INTRO;
    this.answers = {};
    this.score = null;
    this.recommendation = null;
    this.sessionId = this.generateSessionId();
    this.startTime = new Date().toISOString();
    
    // Initialize engines
    this.scoringEngine = new ScoringEngine();
    this.recommendationEngine = new RecommendationEngine();
  }

  /**
   * Generate a unique session ID
   * @returns {string} Unique session identifier
   */
  generateSessionId() {
    return `diagnostic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Set new state
   * @param {string} newState - New state to transition to
   * @throws {Error} If state is invalid
   */
  setState(newState) {
    const validStates = Object.values(STATES);
    
    if (!validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }
    
    this.currentState = newState;
  }

  /**
   * Record an answer for a question
   * @param {string} questionId - Question identifier
   * @param {string} answerValue - Selected answer text
   * @param {number} points - Points for this answer
   */
  recordAnswer(questionId, answerValue, points) {
    // Validate inputs
    if (!questionId || typeof questionId !== 'string') {
      throw new Error('Invalid question ID');
    }
    
    if (!answerValue || typeof answerValue !== 'string') {
      throw new Error('Invalid answer value');
    }
    
    if (typeof points !== 'number' || points < 0 || points > 2) {
      throw new Error('Invalid points value');
    }
    
    // Store answer with metadata
    this.answers[questionId] = {
      answerText: answerValue,
      points: points,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all recorded answers
   * @returns {Object} All answers
   */
  getAnswers() {
    return this.answers;
  }

  /**
   * Calculate total score using ScoringEngine
   * @returns {number} Total score (0-10)
   */
  calculateScore() {
    // Extract just the points from answers
    const answerPoints = {};
    
    for (const [questionId, answerData] of Object.entries(this.answers)) {
      answerPoints[questionId] = answerData.points;
    }
    
    // Use ScoringEngine to calculate total
    this.score = this.scoringEngine.calculateTotalScore(answerPoints);
    
    return this.score;
  }

  /**
   * Get current score
   * @returns {number|null} Current score or null if not calculated
   */
  getScore() {
    return this.score;
  }

  /**
   * Start the diagnostic (transition from intro to Q1)
   */
  start() {
    if (this.currentState !== STATES.INTRO) {
      throw new Error('Can only start from INTRO state');
    }
    
    this.setState(STATES.QUESTION_1);
  }

  /**
   * Advance to next question
   * @throws {Error} If not in a question state or already at last question
   */
  nextQuestion() {
    const questionStates = [
      STATES.QUESTION_1,
      STATES.QUESTION_2,
      STATES.QUESTION_3,
      STATES.QUESTION_4,
      STATES.QUESTION_5
    ];
    
    const currentIndex = questionStates.indexOf(this.currentState);
    
    if (currentIndex === -1) {
      throw new Error('Not in a question state');
    }
    
    if (currentIndex === questionStates.length - 1) {
      // Last question - move to recommendation
      this.showRecommendation();
    } else {
      // Move to next question
      this.setState(questionStates[currentIndex + 1]);
    }
  }

  /**
   * Calculate and display recommendation
   */
  showRecommendation() {
    // Calculate score if not already done
    if (this.score === null) {
      this.calculateScore();
    }
    
    // Get recommendation from engine
    this.recommendation = this.recommendationEngine.getRecommendationData(this.score);
    
    // Transition to recommendation state
    this.setState(STATES.RECOMMENDATION);
  }

  /**
   * Get current recommendation
   * @returns {Object|null} Recommendation data or null if not calculated
   */
  getRecommendation() {
    return this.recommendation;
  }

  /**
   * Save diagnostic data to localStorage
   * @throws {Error} If localStorage is not available or quota exceeded
   */
  saveToLocalStorage() {
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available');
    }
    
    const sessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: new Date().toISOString(),
      answers: this.answers,
      score: this.score,
      recommendation: this.recommendation
    };
    
    try {
      localStorage.setItem('diagnostic_session', JSON.stringify(sessionData));
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      throw new Error(`Failed to save to localStorage: ${error.message}`);
    }
  }

  /**
   * Load diagnostic data from localStorage
   * @returns {Object|null} Loaded session data or null if not found
   */
  loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const data = localStorage.getItem('diagnostic_session');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticController;
}

// Export STATES for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.STATES = STATES;
}
