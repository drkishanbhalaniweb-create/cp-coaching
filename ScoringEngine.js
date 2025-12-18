/**
 * ScoringEngine - Handles scoring logic for the Claim Readiness Diagnostic
 * 
 * This class is responsible for:
 * - Mapping answer text to point values (0, 1, or 2)
 * - Calculating total scores from answer sets
 * - Validating score ranges
 * 
 * Note: Depends on QUESTIONS from diagnostic-config.js being loaded first
 */

class ScoringEngine {
  constructor() {
    // No initialization needed - all methods are stateless
  }

  /**
   * Get point value for a specific answer
   * 
   * @param {string} questionId - The question identifier (e.g., 'service_connection')
   * @param {string} answerText - The selected answer text (e.g., 'Yes', 'No', 'Somewhat')
   * @returns {number} Point value (0, 1, or 2)
   * @throws {Error} If question or answer not found
   */
  getPointsForAnswer(questionId, answerText) {
    // Find the question by ID
    const question = QUESTIONS.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Find the answer option by text
    const option = question.options.find(opt => opt.text === answerText);
    
    if (!option) {
      throw new Error(`Answer option not found: ${answerText} for question ${questionId}`);
    }

    return option.points;
  }

  /**
   * Calculate total score from all answers
   * 
   * @param {Object} answers - Object mapping question IDs to point values
   *                          e.g., { service_connection: 2, denial_handling: 1, ... }
   * @returns {number} Total score (sum of all answer points)
   */
  calculateTotalScore(answers) {
    // Sum all point values
    const total = Object.values(answers).reduce((sum, points) => sum + points, 0);
    return total;
  }

  /**
   * Validate that a score is within the valid range
   * 
   * @param {number} score - The score to validate
   * @returns {boolean} True if score is valid (0-10), false otherwise
   */
  validateScore(score) {
    return typeof score === 'number' && score >= 0 && score <= 10;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoringEngine;
}
