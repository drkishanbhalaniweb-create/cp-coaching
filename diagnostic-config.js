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
    title: 'Are you confident the VA can clearly see how your condition is connected to service?',
    helper: 'A diagnosis alone isn\'t enough — the VA looks for specific medical or service evidence linking the condition to your time in service.',
    category: 'Service Connection',
    options: [
      { text: 'No — the connection is not clearly shown', points: 2 },
      { text: 'Somewhat — parts are there, but I\'m not fully sure', points: 1 },
      { text: 'Yes — the connection is clearly documented', points: 0 }
    ]
  },
  {
    id: 'denial_handling',
    number: 2,
    title: 'If you were denied before, do you fully understand — and have you fixed — the actual reason for denial?',
    helper: 'Many veterans later realize they were fixing the wrong issue because denial letters are easy to misunderstand.',
    category: 'Denial Handling',
    options: [
      { text: 'No — I\'m not sure what the reason was', points: 2 },
      { text: 'Somewhat — I think I understand but I\'m not certain', points: 1 },
      { text: 'Yes — I understand and have addressed it', points: 0 }
    ]
  },
  {
    id: 'pathway',
    number: 3,
    title: 'Are you certain you\'re filing under the correct claim type for your situation?',
    helper: 'Filing a new, supplemental, or increase claim under the wrong path can delay or derail a claim.',
    category: 'Claim Pathway',
    options: [
      { text: 'No — I\'m not sure which type applies', points: 2 },
      { text: 'Somewhat — I think I know but I\'m not certain', points: 1 },
      { text: 'Yes — I\'m certain of the correct pathway', points: 0 }
    ]
  },
  {
    id: 'severity',
    number: 4,
    title: 'Is your medical evidence detailed enough to support the rating level you\'re seeking?',
    helper: 'The VA rates based on documented severity, frequency, and functional impact — not just a diagnosis.',
    category: 'Medical Evidence',
    options: [
      { text: 'No — my evidence is minimal or vague', points: 2 },
      { text: 'Somewhat — I have some details but could be more thorough', points: 1 },
      { text: 'Yes — my evidence is detailed and comprehensive', points: 0 }
    ]
  },
  {
    id: 'secondaries',
    number: 5,
    title: 'Have you identified all conditions caused or worsened by your service-connected issues?',
    helper: 'Secondary conditions are often missed and discovered only after a denial or low rating.',
    category: 'Secondary Conditions',
    options: [
      { text: 'No — I haven\'t considered secondary conditions', points: 2 },
      { text: 'Somewhat — I\'ve identified some but may have missed others', points: 1 },
      { text: 'Yes — I\'ve identified all related conditions', points: 0 }
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
    icon: 'check-circle',
    ctaText: 'Book review for peace of mind',
    ctaOptional: true,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION]: {
    category: RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION,
    scoreRange: { min: 1, max: 2 },
    message: 'Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation',
    color: '#3b82f6', // Blue
    icon: 'check',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL]: {
    category: RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL,
    scoreRange: { min: 3, max: 6 },
    message: 'Your claim would BENEFIT from a Claim Readiness Review before filing',
    color: '#f59e0b', // Yellow
    icon: 'alert-triangle',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false,
    tone: 'objective'
  },
  [RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED]: {
    category: RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED,
    scoreRange: { min: 7, max: 10 },
    message: 'Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED',
    color: '#dc2626', // Red
    icon: 'x-circle',
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
  ADEQUATE: { icon: 'check-circle', label: 'Adequate', points: 0 },
  NEEDS_ATTENTION: { icon: 'alert-circle', label: 'Needs attention', points: 1 },
  MISSING: { icon: 'x-circle', label: 'Missing', points: 2 }
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
