/**
 * Claim Readiness Diagnostic - Configuration Data
 * 
 * This file contains all question data, recommendation configurations,
 * and scoring rules for the diagnostic system.
 */

// ============================================
// QUESTION DATA
// ============================================

const QUESTIONS = [
  {
    id: 'service_connection',
    number: 1,
    title: 'Service connection clearly documented?',
    helper: 'Medical records, nexus letters, or documented in-service events linking the condition',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'denial_handling',
    number: 2,
    title: 'Prior VA denial reasons addressed?',
    helper: 'Previous denial letters explain exactly what was missing',
    options: [
      { text: 'No', points: 2 },
      { text: 'Partially', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'pathway',
    number: 3,
    title: 'Correct claim pathway selected?',
    helper: 'New, supplemental, or increase claims must follow the correct path',
    options: [
      { text: 'Not sure', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'severity',
    number: 4,
    title: 'Medical severity & impact documented?',
    helper: 'Symptoms, flare-ups, and functional impact on daily life',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'secondaries',
    number: 5,
    title: 'All conditions & secondaries identified?',
    helper: 'Secondary conditions are often missed but materially affect ratings',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  }
];

// ============================================
// RECOMMENDATION CONFIGURATION
// ============================================

const RECOMMENDATION_CATEGORIES = {
  FULLY_READY: 'FULLY_READY',
  OPTIONAL_CONFIRMATION: 'OPTIONAL_CONFIRMATION',
  REVIEW_BENEFICIAL: 'REVIEW_BENEFICIAL',
  REVIEW_STRONGLY_RECOMMENDED: 'REVIEW_STRONGLY_RECOMMENDED'
};

const RECOMMENDATIONS = {
  [RECOMMENDATION_CATEGORIES.FULLY_READY]: {
    category: RECOMMENDATION_CATEGORIES.FULLY_READY,
    scoreRange: { min: 0, max: 0 },
    message: 'Your claim is FULLY READY. No Claim Readiness Review is needed',
    color: '#10b981', // Green
    icon: '✅',
    ctaText: 'Book review for peace of mind',
    ctaOptional: true,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION]: {
    category: RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION,
    scoreRange: { min: 1, max: 2 },
    message: 'Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation',
    color: '#3b82f6', // Blue
    icon: '✓',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL]: {
    category: RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL,
    scoreRange: { min: 3, max: 6 },
    message: 'Your claim would BENEFIT from a Claim Readiness Review before filing',
    color: '#f59e0b', // Yellow
    icon: '⚠️',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED]: {
    category: RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED,
    scoreRange: { min: 7, max: 10 },
    message: 'Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED',
    color: '#dc2626', // Red
    icon: '❌',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false,
    tone: 'serious'
  }
};

// ============================================
// ASSESSMENT AREA LABELS
// ============================================

const ASSESSMENT_AREAS = {
  service_connection: 'Service connection clarity',
  denial_handling: 'Denial handling',
  pathway: 'Pathway selection',
  severity: 'Severity documentation',
  secondaries: 'Missing secondaries'
};

// ============================================
// STATUS INDICATORS
// ============================================

const STATUS_INDICATORS = {
  ADEQUATE: { icon: '✅', label: 'Adequate', points: 0 },
  NEEDS_ATTENTION: { icon: '⚠️', label: 'Needs attention', points: 1 },
  MISSING: { icon: '❌', label: 'Missing', points: 2 }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUESTIONS,
    RECOMMENDATION_CATEGORIES,
    RECOMMENDATIONS,
    ASSESSMENT_AREAS,
    STATUS_INDICATORS
  };
}
