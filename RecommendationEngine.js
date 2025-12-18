/**
 * RecommendationEngine - Handles recommendation logic for the Claim Readiness Diagnostic
 * 
 * This class is responsible for:
 * - Mapping scores to recommendation categories
 * - Providing recommendation messages
 * - Determining visual styling (colors, icons)
 * - Determining CTA text and behavior
 * 
 * Note: Depends on RECOMMENDATIONS and RECOMMENDATION_CATEGORIES from diagnostic-config.js being loaded first
 */

class RecommendationEngine {
  constructor() {
    // No initialization needed - all methods are stateless
  }

  /**
   * Get recommendation category based on score
   * 
   * @param {number} score - Total diagnostic score (0-10)
   * @returns {string} Recommendation category
   * @throws {Error} If score is invalid
   */
  getRecommendation(score) {
    // Validate score
    if (typeof score !== 'number' || score < 0 || score > 10) {
      throw new Error(`Invalid score: ${score}. Score must be between 0 and 10.`);
    }

    // Find matching recommendation based on score range
    for (const [category, config] of Object.entries(RECOMMENDATIONS)) {
      if (score >= config.scoreRange.min && score <= config.scoreRange.max) {
        return category;
      }
    }

    // This should never happen if RECOMMENDATIONS is configured correctly
    throw new Error(`No recommendation found for score: ${score}`);
  }

  /**
   * Get recommendation message text
   * 
   * @param {string} category - Recommendation category
   * @returns {string} Recommendation message
   * @throws {Error} If category is invalid
   */
  getRecommendationMessage(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    return config.message;
  }

  /**
   * Get recommendation color
   * 
   * @param {string} category - Recommendation category
   * @returns {string} CSS color value
   * @throws {Error} If category is invalid
   */
  getRecommendationColor(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    return config.color;
  }

  /**
   * Get recommendation icon
   * 
   * @param {string} category - Recommendation category
   * @returns {string} Icon emoji or identifier
   * @throws {Error} If category is invalid
   */
  getRecommendationIcon(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    return config.icon;
  }

  /**
   * Get CTA button text
   * 
   * @param {string} category - Recommendation category
   * @returns {string} CTA button text
   * @throws {Error} If category is invalid
   */
  getCTAText(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    return config.ctaText;
  }

  /**
   * Determine if CTA should be shown
   * 
   * @param {string} category - Recommendation category
   * @returns {boolean} True if CTA should be displayed
   * @throws {Error} If category is invalid
   */
  shouldShowCTA(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    // CTA is always shown, but the optional flag indicates its importance
    return true;
  }

  /**
   * Check if CTA is optional
   * 
   * @param {string} category - Recommendation category
   * @returns {boolean} True if CTA is optional
   * @throws {Error} If category is invalid
   */
  isCTAOptional(category) {
    const config = RECOMMENDATIONS[category];
    
    if (!config) {
      throw new Error(`Invalid recommendation category: ${category}`);
    }

    return config.ctaOptional;
  }

  /**
   * Get complete recommendation data
   * 
   * @param {number} score - Total diagnostic score (0-10)
   * @returns {Object} Complete recommendation data
   */
  getRecommendationData(score) {
    const category = this.getRecommendation(score);
    const config = RECOMMENDATIONS[category];

    return {
      category,
      score,
      message: config.message,
      color: config.color,
      icon: config.icon,
      ctaText: config.ctaText,
      ctaOptional: config.ctaOptional,
      tone: config.tone
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
}
