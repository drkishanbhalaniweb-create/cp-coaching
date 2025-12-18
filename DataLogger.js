/**
 * DataLogger - Handles logging diagnostic data to backend
 * 
 * This class is responsible for:
 * - Formatting diagnostic data for backend
 * - POSTing data to /api/log-diagnostic endpoint
 * - Handling logging errors gracefully
 * - Ensuring logging doesn't block user experience
 */

class DataLogger {
  constructor() {
    this.endpoint = '/api/log-diagnostic';
  }

  /**
   * Format diagnostic data into payload for backend
   * 
   * @param {Object} answers - Answer data with points
   * @param {number} score - Total diagnostic score
   * @param {string} recommendation - Recommendation category
   * @returns {Object} Formatted payload
   */
  formatPayload(answers, score, recommendation) {
    // Extract just the points from answer objects
    const answerPoints = {};
    
    for (const [questionId, answerData] of Object.entries(answers)) {
      // Handle both formats: { points: X } or just the number
      answerPoints[questionId] = typeof answerData === 'object' ? answerData.points : answerData;
    }

    return {
      timestamp: new Date().toISOString(),
      answers: answerPoints,
      score: score,
      recommendation: recommendation
    };
  }

  /**
   * Log diagnostic data to backend
   * 
   * @param {Object} diagnosticData - Complete diagnostic data
   * @param {Object} diagnosticData.answers - Answer data
   * @param {number} diagnosticData.score - Total score
   * @param {string} diagnosticData.recommendation - Recommendation category
   * @returns {Promise<Object>} Response from backend
   */
  async logDiagnostic(diagnosticData) {
    try {
      // Format the payload
      const payload = this.formatPayload(
        diagnosticData.answers,
        diagnosticData.score,
        diagnosticData.recommendation
      );

      // POST to backend with CORS headers
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Parse response
      const result = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(result.error || 'Failed to log diagnostic data');
      }

      return result;
    } catch (error) {
      // Handle error gracefully - don't block user experience
      this.handleLoggingError(error);
      
      // Return a success-like response so user flow continues
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle logging errors gracefully
   * 
   * @param {Error} error - The error that occurred
   */
  handleLoggingError(error) {
    // Log to console for debugging, but don't disrupt user
    console.error('Diagnostic logging failed:', error);
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, but for now we just log it
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLogger;
}
