// File system storage removed - use database or Vercel KV for production
// const fs = require('fs').promises;
// const path = require('path');

/**
 * Validates the diagnostic payload structure
 * @param {object} payload - Request body to validate
 * @returns {object} - { valid: boolean, error: string }
 */
function validatePayload(payload) {
  if (!payload) {
    return { valid: false, error: 'Invalid payload: Request body is empty' };
  }

  // Check required fields
  if (!payload.timestamp) {
    return { valid: false, error: 'Invalid payload: Missing timestamp' };
  }

  if (!payload.answers) {
    return { valid: false, error: 'Invalid payload: Missing answers' };
  }

  if (payload.score === undefined || payload.score === null) {
    return { valid: false, error: 'Invalid payload: Missing score' };
  }

  if (!payload.recommendation) {
    return { valid: false, error: 'Invalid payload: Missing recommendation' };
  }

  // Validate score type and range
  if (typeof payload.score !== 'number') {
    return { valid: false, error: 'Invalid payload: Score must be a number' };
  }

  if (payload.score < 0 || payload.score > 10) {
    return { valid: false, error: 'Invalid payload: Score must be between 0 and 10' };
  }

  // Validate answers structure
  const requiredAnswers = [
    'service_connection',
    'denial_handling',
    'pathway',
    'severity',
    'secondaries'
  ];

  for (const answerKey of requiredAnswers) {
    if (payload.answers[answerKey] === undefined || payload.answers[answerKey] === null) {
      return { valid: false, error: `Invalid payload: Missing answer for ${answerKey}` };
    }

    if (typeof payload.answers[answerKey] !== 'number') {
      return { valid: false, error: `Invalid payload: Answer ${answerKey} must be a number` };
    }

    if (payload.answers[answerKey] < 0 || payload.answers[answerKey] > 2) {
      return { valid: false, error: `Invalid payload: Answer ${answerKey} must be between 0 and 2` };
    }
  }

  return { valid: true };
}

/**
 * Generates a unique ID for the diagnostic session
 * @returns {string} - Unique diagnostic ID with format diag_<timestamp>_<random>
 */
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `diag_${timestamp}_${random}`;
}

/**
 * Serverless function to log diagnostic completion data
 * Validates payload, generates unique ID, stores to JSON file
 * Requirements: 9.2, 9.3, 9.4
 */
module.exports = async (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  console.log(`[${requestId}] Incoming request: ${req.method} ${req.url}`);

  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling OPTIONS preflight request`);
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.warn(`[${requestId}] Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request payload
    const validation = validatePayload(req.body);
    if (!validation.valid) {
      console.warn(`[${requestId}] Payload validation failed: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    console.log(`[${requestId}] Payload validated successfully`);

    // Generate unique ID for this diagnostic session
    const id = generateUniqueId();
    console.log(`[${requestId}] Generated diagnostic ID: ${id}`);

    // Create diagnostic entry
    const diagnosticEntry = {
      id,
      ...req.body
    };

    // TEMPORARY FIX: Log to console instead of file system
    // Vercel serverless functions have read-only filesystem
    // TODO: Integrate with Vercel KV, database, or external storage
    console.log(`[${requestId}] DIAGNOSTIC DATA:`, JSON.stringify(diagnosticEntry, null, 2));
    console.log(`[${requestId}] Diagnostic logged successfully (console only - no persistent storage)`);

    // Return success response
    res.status(200).json({
      success: true,
      id,
      note: 'Data logged to console. Configure persistent storage for production.'
    });

  } catch (error) {
    // Log error with context
    console.error(`[${requestId}] Error processing diagnostic:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Return generic error message (don't expose internal details)
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
};
