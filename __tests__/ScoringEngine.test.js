/**
 * Property-Based Tests for ScoringEngine
 * 
 * These tests verify universal correctness properties using fast-check
 * to generate random test cases and ensure properties hold across all inputs.
 */

const fc = require('fast-check');
const ScoringEngine = require('../ScoringEngine');
const { QUESTIONS } = require('../diagnostic-config');

describe('ScoringEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 6: Yes answers score zero points
   * Validates: Requirements 5.1
   */
  describe('Property 6: Yes answers score zero points', () => {
    test('should assign 0 points for any "Yes" answer across all questions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...QUESTIONS.map(q => q.id)),
          (questionId) => {
            // Find the question
            const question = QUESTIONS.find(q => q.id === questionId);
            
            // Find the "Yes" option if it exists
            const yesOption = question.options.find(opt => opt.text === 'Yes');
            
            // If this question has a "Yes" option, verify it scores 0 points
            if (yesOption) {
              const points = engine.getPointsForAnswer(questionId, 'Yes');
              expect(points).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 7: Middle-ground answers score one point
   * Validates: Requirements 5.2
   */
  describe('Property 7: Middle-ground answers score one point', () => {
    test('should assign 1 point for any middle-ground answer (Somewhat, Partially) across all questions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...QUESTIONS.map(q => q.id)),
          (questionId) => {
            // Find the question
            const question = QUESTIONS.find(q => q.id === questionId);
            
            // Find middle-ground options (Somewhat, Partially)
            const middleOptions = question.options.filter(opt => 
              opt.text === 'Somewhat' || opt.text === 'Partially'
            );
            
            // Verify each middle-ground option scores 1 point
            middleOptions.forEach(option => {
              const points = engine.getPointsForAnswer(questionId, option.text);
              expect(points).toBe(1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 8: Negative answers score two points
   * Validates: Requirements 5.3
   */
  describe('Property 8: Negative answers score two points', () => {
    test('should assign 2 points for any negative answer (No, Not sure) across all questions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...QUESTIONS.map(q => q.id)),
          (questionId) => {
            // Find the question
            const question = QUESTIONS.find(q => q.id === questionId);
            
            // Find negative options (No, Not sure)
            const negativeOptions = question.options.filter(opt => 
              opt.text === 'No' || opt.text === 'Not sure'
            );
            
            // Verify each negative option scores 2 points
            negativeOptions.forEach(option => {
              const points = engine.getPointsForAnswer(questionId, option.text);
              expect(points).toBe(2);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 9: Total score is sum of answer points
   * Validates: Requirements 5.4
   */
  describe('Property 9: Total score is sum of answer points', () => {
    test('should equal sum of all answer points for any answer combination', () => {
      fc.assert(
        fc.property(
          fc.record({
            service_connection: fc.integer({ min: 0, max: 2 }),
            denial_handling: fc.integer({ min: 0, max: 2 }),
            pathway: fc.integer({ min: 0, max: 2 }),
            severity: fc.integer({ min: 0, max: 2 }),
            secondaries: fc.integer({ min: 0, max: 2 })
          }),
          (answers) => {
            const totalScore = engine.calculateTotalScore(answers);
            const expectedSum = Object.values(answers).reduce((a, b) => a + b, 0);
            
            expect(totalScore).toBe(expectedSum);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional unit tests for edge cases and validation
  describe('Edge cases and validation', () => {
    test('should throw error for invalid question ID', () => {
      expect(() => {
        engine.getPointsForAnswer('invalid_question', 'Yes');
      }).toThrow('Question not found: invalid_question');
    });

    test('should throw error for invalid answer text', () => {
      expect(() => {
        engine.getPointsForAnswer('service_connection', 'Invalid Answer');
      }).toThrow('Answer option not found: Invalid Answer for question service_connection');
    });

    test('should validate score of 0 as valid', () => {
      expect(engine.validateScore(0)).toBe(true);
    });

    test('should validate score of 10 as valid', () => {
      expect(engine.validateScore(10)).toBe(true);
    });

    test('should validate score of 5 as valid', () => {
      expect(engine.validateScore(5)).toBe(true);
    });

    test('should invalidate negative scores', () => {
      expect(engine.validateScore(-1)).toBe(false);
    });

    test('should invalidate scores above 10', () => {
      expect(engine.validateScore(11)).toBe(false);
    });

    test('should invalidate non-numeric scores', () => {
      expect(engine.validateScore('5')).toBe(false);
      expect(engine.validateScore(null)).toBe(false);
      expect(engine.validateScore(undefined)).toBe(false);
    });
  });
});
