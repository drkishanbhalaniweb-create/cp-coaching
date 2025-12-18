/**
 * Property-Based Tests for RecommendationEngine
 * 
 * These tests verify universal correctness properties using fast-check
 * to generate random test cases and ensure properties hold across all inputs.
 */

const fc = require('fast-check');
const RecommendationEngine = require('../RecommendationEngine');
const { RECOMMENDATION_CATEGORIES } = require('../diagnostic-config');

describe('RecommendationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new RecommendationEngine();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 10: Recommendation matches score range (beneficial)
   * Validates: Requirements 6.3
   */
  describe('Property 10: Recommendation matches score range (beneficial)', () => {
    test('should display REVIEW_BENEFICIAL for any score between 3 and 6', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 6 }),
          (score) => {
            const category = engine.getRecommendation(score);
            const message = engine.getRecommendationMessage(category);
            
            expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
            expect(message).toContain('would BENEFIT');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 11: Recommendation matches score range (strongly recommended)
   * Validates: Requirements 6.4
   */
  describe('Property 11: Recommendation matches score range (strongly recommended)', () => {
    test('should display REVIEW_STRONGLY_RECOMMENDED for any score of 7 or greater', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 7, max: 10 }),
          (score) => {
            const category = engine.getRecommendation(score);
            const message = engine.getRecommendationMessage(category);
            
            expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
            expect(message).toContain('STRONGLY RECOMMENDED');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 12: Recommendation color matches category
   * Validates: Requirements 6.5
   */
  describe('Property 12: Recommendation color matches category', () => {
    test('should return appropriate color for any recommendation category', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          (score) => {
            const category = engine.getRecommendation(score);
            const color = engine.getRecommendationColor(category);
            
            // Verify color matches expected values based on category
            if (category === RECOMMENDATION_CATEGORIES.FULLY_READY) {
              expect(color).toBe('#10b981'); // Green
            } else if (category === RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION) {
              expect(color).toBe('#3b82f6'); // Blue
            } else if (category === RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL) {
              expect(color).toBe('#f59e0b'); // Yellow
            } else if (category === RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED) {
              expect(color).toBe('#dc2626'); // Red
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for edge case recommendations
  describe('Edge case recommendations', () => {
    test('should return FULLY_READY for score = 0', () => {
      const category = engine.getRecommendation(0);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.FULLY_READY);
    });

    test('should return OPTIONAL_CONFIRMATION for score = 1', () => {
      const category = engine.getRecommendation(1);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
    });

    test('should return OPTIONAL_CONFIRMATION for score = 2', () => {
      const category = engine.getRecommendation(2);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
    });

    test('should return REVIEW_BENEFICIAL for score = 3 (boundary)', () => {
      const category = engine.getRecommendation(3);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
    });

    test('should return REVIEW_BENEFICIAL for score = 6 (boundary)', () => {
      const category = engine.getRecommendation(6);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
    });

    test('should return REVIEW_STRONGLY_RECOMMENDED for score = 7 (boundary)', () => {
      const category = engine.getRecommendation(7);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
    });

    test('should return REVIEW_STRONGLY_RECOMMENDED for score = 10', () => {
      const category = engine.getRecommendation(10);
      expect(category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
    });
  });

  // Additional unit tests for validation and error handling
  describe('Validation and error handling', () => {
    test('should throw error for invalid score (negative)', () => {
      expect(() => {
        engine.getRecommendation(-1);
      }).toThrow('Invalid score: -1. Score must be between 0 and 10.');
    });

    test('should throw error for invalid score (above 10)', () => {
      expect(() => {
        engine.getRecommendation(11);
      }).toThrow('Invalid score: 11. Score must be between 0 and 10.');
    });

    test('should throw error for invalid score (non-numeric)', () => {
      expect(() => {
        engine.getRecommendation('5');
      }).toThrow('Invalid score: 5. Score must be between 0 and 10.');
    });

    test('should throw error for invalid category in getRecommendationMessage', () => {
      expect(() => {
        engine.getRecommendationMessage('INVALID_CATEGORY');
      }).toThrow('Invalid recommendation category: INVALID_CATEGORY');
    });

    test('should throw error for invalid category in getRecommendationColor', () => {
      expect(() => {
        engine.getRecommendationColor('INVALID_CATEGORY');
      }).toThrow('Invalid recommendation category: INVALID_CATEGORY');
    });

    test('should throw error for invalid category in getCTAText', () => {
      expect(() => {
        engine.getCTAText('INVALID_CATEGORY');
      }).toThrow('Invalid recommendation category: INVALID_CATEGORY');
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 16: CTA display for non-ready recommendations
   * Validates: Requirements 8.1
   */
  describe('Property 16: CTA display for non-ready recommendations', () => {
    test('should display "Book Claim Readiness Review" for any non-FULLY_READY recommendation', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Scores 1-10 are non-FULLY_READY
          (score) => {
            const category = engine.getRecommendation(score);
            const ctaText = engine.getCTAText(category);
            
            // For OPTIONAL, BENEFICIAL, and STRONGLY_RECOMMENDED, CTA should be "Book Claim Readiness Review"
            expect(ctaText).toBe('Book Claim Readiness Review');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should display "Book review for peace of mind" for FULLY_READY recommendation', () => {
      const category = engine.getRecommendation(0);
      const ctaText = engine.getCTAText(category);
      
      expect(ctaText).toBe('Book review for peace of mind');
    });
  });

  // Unit tests for CTA logic
  describe('CTA logic', () => {
    test('should return correct CTA text for FULLY_READY', () => {
      const ctaText = engine.getCTAText(RECOMMENDATION_CATEGORIES.FULLY_READY);
      expect(ctaText).toBe('Book review for peace of mind');
    });

    test('should return correct CTA text for OPTIONAL_CONFIRMATION', () => {
      const ctaText = engine.getCTAText(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
      expect(ctaText).toBe('Book Claim Readiness Review');
    });

    test('should return correct CTA text for REVIEW_BENEFICIAL', () => {
      const ctaText = engine.getCTAText(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
      expect(ctaText).toBe('Book Claim Readiness Review');
    });

    test('should return correct CTA text for REVIEW_STRONGLY_RECOMMENDED', () => {
      const ctaText = engine.getCTAText(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
      expect(ctaText).toBe('Book Claim Readiness Review');
    });

    test('should indicate CTA is optional for FULLY_READY', () => {
      const isOptional = engine.isCTAOptional(RECOMMENDATION_CATEGORIES.FULLY_READY);
      expect(isOptional).toBe(true);
    });

    test('should indicate CTA is not optional for OPTIONAL_CONFIRMATION', () => {
      const isOptional = engine.isCTAOptional(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
      expect(isOptional).toBe(false);
    });

    test('should indicate CTA is not optional for REVIEW_BENEFICIAL', () => {
      const isOptional = engine.isCTAOptional(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
      expect(isOptional).toBe(false);
    });

    test('should indicate CTA is not optional for REVIEW_STRONGLY_RECOMMENDED', () => {
      const isOptional = engine.isCTAOptional(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
      expect(isOptional).toBe(false);
    });

    test('should always show CTA for all categories', () => {
      Object.values(RECOMMENDATION_CATEGORIES).forEach(category => {
        expect(engine.shouldShowCTA(category)).toBe(true);
      });
    });
  });

  // Unit tests for getRecommendationData
  describe('getRecommendationData', () => {
    test('should return complete recommendation data for score 0', () => {
      const data = engine.getRecommendationData(0);
      
      expect(data.category).toBe(RECOMMENDATION_CATEGORIES.FULLY_READY);
      expect(data.score).toBe(0);
      expect(data.message).toContain('FULLY READY');
      expect(data.color).toBe('#10b981');
      expect(data.icon).toBe('✅');
      expect(data.ctaText).toBe('Book review for peace of mind');
      expect(data.ctaOptional).toBe(true);
      expect(data.tone).toBe('objective');
    });

    test('should return complete recommendation data for score 5', () => {
      const data = engine.getRecommendationData(5);
      
      expect(data.category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
      expect(data.score).toBe(5);
      expect(data.message).toContain('would BENEFIT');
      expect(data.color).toBe('#f59e0b');
      expect(data.icon).toBe('⚠️');
      expect(data.ctaText).toBe('Book Claim Readiness Review');
      expect(data.ctaOptional).toBe(false);
      expect(data.tone).toBe('objective');
    });

    test('should return complete recommendation data for score 10', () => {
      const data = engine.getRecommendationData(10);
      
      expect(data.category).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
      expect(data.score).toBe(10);
      expect(data.message).toContain('STRONGLY RECOMMENDED');
      expect(data.color).toBe('#dc2626');
      expect(data.icon).toBe('❌');
      expect(data.ctaText).toBe('Book Claim Readiness Review');
      expect(data.ctaOptional).toBe(false);
      expect(data.tone).toBe('serious');
    });
  });
});
