/**
 * Unit Tests for DiagnosticController
 * 
 * These tests verify state management, answer recording, and score calculation
 * integration for the diagnostic controller.
 */

const DiagnosticController = require('../DiagnosticController');
const { STATES } = require('../DiagnosticController');
const fc = require('fast-check');

describe('DiagnosticController', () => {
  let controller;

  beforeEach(() => {
    controller = new DiagnosticController();
  });

  // ============================================
  // STATE TRANSITION TESTS
  // ============================================

  describe('State transitions', () => {
    test('should initialize in INTRO state', () => {
      expect(controller.getCurrentState()).toBe(STATES.INTRO);
    });

    test('should transition from INTRO to QUESTION_1 when start() is called', () => {
      controller.start();
      expect(controller.getCurrentState()).toBe(STATES.QUESTION_1);
    });

    test('should throw error when start() is called from non-INTRO state', () => {
      controller.setState(STATES.QUESTION_1);
      expect(() => controller.start()).toThrow('Can only start from INTRO state');
    });

    test('should transition from QUESTION_1 to QUESTION_2 when nextQuestion() is called', () => {
      controller.setState(STATES.QUESTION_1);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe(STATES.QUESTION_2);
    });

    test('should transition from QUESTION_2 to QUESTION_3 when nextQuestion() is called', () => {
      controller.setState(STATES.QUESTION_2);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe(STATES.QUESTION_3);
    });

    test('should transition from QUESTION_3 to QUESTION_4 when nextQuestion() is called', () => {
      controller.setState(STATES.QUESTION_3);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe(STATES.QUESTION_4);
    });

    test('should transition from QUESTION_4 to QUESTION_5 when nextQuestion() is called', () => {
      controller.setState(STATES.QUESTION_4);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe(STATES.QUESTION_5);
    });

    test('should transition from QUESTION_5 to RECOMMENDATION when nextQuestion() is called', () => {
      controller.setState(STATES.QUESTION_5);
      
      // Need to have answers recorded to calculate score
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Yes', 0);
      controller.recordAnswer('secondaries', 'Yes', 0);
      
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe(STATES.RECOMMENDATION);
    });

    test('should throw error when nextQuestion() is called from non-question state', () => {
      controller.setState(STATES.INTRO);
      expect(() => controller.nextQuestion()).toThrow('Not in a question state');
    });

    test('should throw error when setState() is called with invalid state', () => {
      expect(() => controller.setState('invalid_state')).toThrow('Invalid state: invalid_state');
    });

    test('should allow setting any valid state', () => {
      const validStates = Object.values(STATES);
      
      validStates.forEach(state => {
        controller.setState(state);
        expect(controller.getCurrentState()).toBe(state);
      });
    });
  });

  // ============================================
  // ANSWER RECORDING TESTS
  // ============================================

  describe('Answer recording', () => {
    test('should record answer with question ID, answer text, and points', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      
      const answers = controller.getAnswers();
      expect(answers.service_connection).toBeDefined();
      expect(answers.service_connection.answerText).toBe('Yes');
      expect(answers.service_connection.points).toBe(0);
      expect(answers.service_connection.timestamp).toBeDefined();
    });

    test('should record multiple answers', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Partially', 1);
      controller.recordAnswer('pathway', 'Not sure', 2);
      
      const answers = controller.getAnswers();
      expect(Object.keys(answers).length).toBe(3);
      expect(answers.service_connection.points).toBe(0);
      expect(answers.denial_handling.points).toBe(1);
      expect(answers.pathway.points).toBe(2);
    });

    test('should overwrite previous answer for same question', () => {
      controller.recordAnswer('service_connection', 'No', 2);
      controller.recordAnswer('service_connection', 'Yes', 0);
      
      const answers = controller.getAnswers();
      expect(answers.service_connection.answerText).toBe('Yes');
      expect(answers.service_connection.points).toBe(0);
    });

    test('should throw error for invalid question ID', () => {
      expect(() => controller.recordAnswer('', 'Yes', 0)).toThrow('Invalid question ID');
      expect(() => controller.recordAnswer(null, 'Yes', 0)).toThrow('Invalid question ID');
    });

    test('should throw error for invalid answer value', () => {
      expect(() => controller.recordAnswer('service_connection', '', 0)).toThrow('Invalid answer value');
      expect(() => controller.recordAnswer('service_connection', null, 0)).toThrow('Invalid answer value');
    });

    test('should throw error for invalid points value', () => {
      expect(() => controller.recordAnswer('service_connection', 'Yes', -1)).toThrow('Invalid points value');
      expect(() => controller.recordAnswer('service_connection', 'Yes', 3)).toThrow('Invalid points value');
      expect(() => controller.recordAnswer('service_connection', 'Yes', 'invalid')).toThrow('Invalid points value');
    });

    test('should include timestamp for each answer', () => {
      const beforeTime = new Date().toISOString();
      controller.recordAnswer('service_connection', 'Yes', 0);
      const afterTime = new Date().toISOString();
      
      const answers = controller.getAnswers();
      const timestamp = answers.service_connection.timestamp;
      
      expect(timestamp).toBeDefined();
      expect(timestamp >= beforeTime).toBe(true);
      expect(timestamp <= afterTime).toBe(true);
    });
  });

  // ============================================
  // SCORE CALCULATION INTEGRATION TESTS
  // ============================================

  describe('Score calculation integration', () => {
    test('should calculate score of 0 for all "Yes" answers', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Yes', 0);
      controller.recordAnswer('secondaries', 'Yes', 0);
      
      const score = controller.calculateScore();
      expect(score).toBe(0);
      expect(controller.getScore()).toBe(0);
    });

    test('should calculate score of 10 for all "No" answers', () => {
      controller.recordAnswer('service_connection', 'No', 2);
      controller.recordAnswer('denial_handling', 'No', 2);
      controller.recordAnswer('pathway', 'Not sure', 2);
      controller.recordAnswer('severity', 'No', 2);
      controller.recordAnswer('secondaries', 'No', 2);
      
      const score = controller.calculateScore();
      expect(score).toBe(10);
      expect(controller.getScore()).toBe(10);
    });

    test('should calculate score of 5 for mixed answers', () => {
      controller.recordAnswer('service_connection', 'Somewhat', 1);
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.recordAnswer('pathway', 'Not sure', 2);
      controller.recordAnswer('severity', 'Somewhat', 1);
      controller.recordAnswer('secondaries', 'Somewhat', 1);
      
      const score = controller.calculateScore();
      expect(score).toBe(5);
    });

    test('should return null for score before calculation', () => {
      expect(controller.getScore()).toBeNull();
    });

    test('should persist score after calculation', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Yes', 0);
      controller.recordAnswer('secondaries', 'Yes', 0);
      
      controller.calculateScore();
      expect(controller.getScore()).toBe(0);
      
      // Score should persist even after multiple getScore() calls
      expect(controller.getScore()).toBe(0);
      expect(controller.getScore()).toBe(0);
    });

    test('should integrate with ScoringEngine correctly', () => {
      // Test that controller uses ScoringEngine for calculation
      controller.recordAnswer('service_connection', 'No', 2);
      controller.recordAnswer('denial_handling', 'Partially', 1);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Somewhat', 1);
      controller.recordAnswer('secondaries', 'No', 2);
      
      const score = controller.calculateScore();
      // 2 + 1 + 0 + 1 + 2 = 6
      expect(score).toBe(6);
    });
  });

  // ============================================
  // RECOMMENDATION TESTS
  // ============================================

  describe('Recommendation display', () => {
    test('should calculate score and generate recommendation when showRecommendation() is called', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Yes', 0);
      controller.recordAnswer('secondaries', 'Yes', 0);
      
      controller.showRecommendation();
      
      expect(controller.getScore()).toBe(0);
      expect(controller.getRecommendation()).toBeDefined();
      expect(controller.getRecommendation().category).toBe('FULLY_READY');
      expect(controller.getCurrentState()).toBe(STATES.RECOMMENDATION);
    });

    test('should use existing score if already calculated', () => {
      controller.recordAnswer('service_connection', 'No', 2);
      controller.recordAnswer('denial_handling', 'No', 2);
      controller.recordAnswer('pathway', 'Not sure', 2);
      controller.recordAnswer('severity', 'No', 2);
      controller.recordAnswer('secondaries', 'No', 2);
      
      controller.calculateScore();
      const initialScore = controller.getScore();
      
      controller.showRecommendation();
      
      expect(controller.getScore()).toBe(initialScore);
      expect(controller.getScore()).toBe(10);
    });

    test('should return null for recommendation before showRecommendation() is called', () => {
      expect(controller.getRecommendation()).toBeNull();
    });

    test('should integrate with RecommendationEngine correctly', () => {
      controller.recordAnswer('service_connection', 'Somewhat', 1);
      controller.recordAnswer('denial_handling', 'Somewhat', 1);
      controller.recordAnswer('pathway', 'Somewhat', 1);
      controller.recordAnswer('severity', 'Somewhat', 1);
      controller.recordAnswer('secondaries', 'Somewhat', 1);
      
      controller.showRecommendation();
      
      const recommendation = controller.getRecommendation();
      expect(recommendation.score).toBe(5);
      expect(recommendation.category).toBe('REVIEW_BENEFICIAL');
      expect(recommendation.message).toBeDefined();
      expect(recommendation.color).toBeDefined();
    });
  });

  // ============================================
  // SESSION MANAGEMENT TESTS
  // ============================================

  describe('Session management', () => {
    test('should generate unique session ID on initialization', () => {
      const controller1 = new DiagnosticController();
      const controller2 = new DiagnosticController();
      
      expect(controller1.sessionId).toBeDefined();
      expect(controller2.sessionId).toBeDefined();
      expect(controller1.sessionId).not.toBe(controller2.sessionId);
    });

    test('should record start time on initialization', () => {
      const beforeTime = new Date().toISOString();
      const newController = new DiagnosticController();
      const afterTime = new Date().toISOString();
      
      expect(newController.startTime).toBeDefined();
      expect(newController.startTime >= beforeTime).toBe(true);
      expect(newController.startTime <= afterTime).toBe(true);
    });
  });

  // ============================================
  // LOCALSTORAGE PERSISTENCE TESTS
  // ============================================

  describe('localStorage persistence', () => {
    let localStorageMock;
    let originalLocalStorage;

    beforeEach(() => {
      // Save original localStorage (from jsdom's window object)
      originalLocalStorage = typeof window !== 'undefined' ? window.localStorage : global.localStorage;
      
      // Create a simple mock localStorage
      localStorageMock = {};
      localStorageMock._data = {};
      localStorageMock.setItem = function(key, value) {
        this._data[key] = String(value);
      };
      localStorageMock.getItem = function(key) {
        return this._data[key] || null;
      };
      localStorageMock.clear = function() {
        this._data = {};
      };
      
      // Set localStorage in the appropriate place (window for jsdom, global for Node)
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
          writable: true,
          configurable: true
        });
      }
      global.localStorage = localStorageMock;
      
      // Create a fresh controller for each test
      controller = new DiagnosticController();
    });

    afterEach(() => {
      if (localStorageMock && localStorageMock.clear) {
        localStorageMock.clear();
      }
      // Restore original localStorage
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'localStorage', {
          value: originalLocalStorage,
          writable: true,
          configurable: true
        });
      }
      global.localStorage = originalLocalStorage;
    });

    // ============================================
    // UNIT TESTS FOR LOCALSTORAGE OPERATIONS
    // ============================================

    test('should save data to localStorage correctly', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.recordAnswer('denial_handling', 'Partially', 1);
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.recordAnswer('severity', 'Somewhat', 1);
      controller.recordAnswer('secondaries', 'Yes', 0);
      
      controller.calculateScore();
      controller.showRecommendation();
      
      controller.saveToLocalStorage();
      
      const savedDataString = localStorageMock.getItem('diagnostic_session');
      expect(savedDataString).not.toBeNull();
      
      const savedData = JSON.parse(savedDataString);
      
      expect(savedData).toBeDefined();
      expect(savedData.sessionId).toBe(controller.sessionId);
      expect(savedData.startTime).toBe(controller.startTime);
      expect(savedData.endTime).toBeDefined();
      expect(savedData.answers).toEqual(controller.getAnswers());
      expect(savedData.score).toBe(2);
      expect(savedData.recommendation).toEqual(controller.getRecommendation());
    });

    test('should load data from localStorage correctly', () => {
      // Clear any existing data first
      localStorageMock.clear();
      
      const testData = {
        sessionId: 'test_session_123',
        startTime: '2025-12-18T10:00:00.000Z',
        endTime: '2025-12-18T10:05:00.000Z',
        answers: {
          service_connection: { answerText: 'Yes', points: 0, timestamp: '2025-12-18T10:01:00.000Z' },
          denial_handling: { answerText: 'No', points: 2, timestamp: '2025-12-18T10:02:00.000Z' }
        },
        score: 2,
        recommendation: { category: 'OPTIONAL_CONFIRMATION', score: 2 }
      };
      
      localStorageMock.setItem('diagnostic_session', JSON.stringify(testData));
      
      const loadedData = controller.loadFromLocalStorage();
      
      expect(loadedData).toBeDefined();
      expect(loadedData.sessionId).toBe(testData.sessionId);
      expect(loadedData.startTime).toBe(testData.startTime);
      expect(loadedData.endTime).toBe(testData.endTime);
      expect(loadedData.score).toBe(testData.score);
      expect(loadedData.answers.service_connection.answerText).toBe('Yes');
      expect(loadedData.answers.denial_handling.answerText).toBe('No');
    });

    test('should return null when loading from empty localStorage', () => {
      // Clear localStorage to ensure it's empty
      localStorageMock.clear();
      
      const loadedData = controller.loadFromLocalStorage();
      expect(loadedData).toBeNull();
    });

    test('should handle localStorage quota exceeded error', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.calculateScore();
      
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = function(key, value) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      expect(() => controller.saveToLocalStorage()).toThrow('Failed to save to localStorage');
      
      // Restore original setItem
      localStorageMock.setItem = originalSetItem;
    });

    test('should handle localStorage disabled error', () => {
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.calculateScore();
      
      // Simulate localStorage being undefined by deleting it
      const tempLS = global.localStorage;
      delete global.localStorage;
      
      expect(() => controller.saveToLocalStorage()).toThrow('localStorage is not available');
      
      // Restore
      global.localStorage = tempLS;
    });

    test('should return null when localStorage is disabled during load', () => {
      // Delete localStorage to simulate it being disabled
      const tempLocalStorage = global.localStorage;
      delete global.localStorage;
      
      const tempController = new DiagnosticController();
      const loadedData = tempController.loadFromLocalStorage();
      
      expect(loadedData).toBeNull();
      
      // Restore localStorage
      global.localStorage = tempLocalStorage;
    });

    test('should handle corrupted localStorage data gracefully', () => {
      // Clear localStorage first
      localStorageMock.clear();
      
      // Set corrupted data directly
      localStorageMock._data['diagnostic_session'] = 'invalid json data {{{';
      
      const loadedData = controller.loadFromLocalStorage();
      expect(loadedData).toBeNull();
    });

    // ============================================
    // PROPERTY-BASED TEST FOR LOCALSTORAGE PERSISTENCE
    // ============================================

    /**
     * Feature: claim-readiness-diagnostic, Property 18: localStorage persistence on completion
     * Validates: Requirements 9.1
     */
    test('should persist any completed diagnostic session to localStorage', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            service_connection: fc.integer({ min: 0, max: 2 }),
            denial_handling: fc.integer({ min: 0, max: 2 }),
            pathway: fc.integer({ min: 0, max: 2 }),
            severity: fc.integer({ min: 0, max: 2 }),
            secondaries: fc.integer({ min: 0, max: 2 })
          }),
          (answerPoints) => {
            // Clear localStorage before each test
            localStorageMock.clear();
            
            // Create a new controller for each test
            const testController = new DiagnosticController();
            
            // Record answers with generated points
            const questionIds = ['service_connection', 'denial_handling', 'pathway', 'severity', 'secondaries'];
            const answerTexts = ['Yes', 'Somewhat', 'No']; // Map points to text
            
            questionIds.forEach((questionId) => {
              const points = answerPoints[questionId];
              const answerText = answerTexts[points];
              testController.recordAnswer(questionId, answerText, points);
            });
            
            // Calculate score and show recommendation
            testController.calculateScore();
            testController.showRecommendation();
            
            // Save to localStorage
            testController.saveToLocalStorage();
            
            // Verify data was saved
            const savedData = JSON.parse(localStorageMock.getItem('diagnostic_session'));
            
            // Verify all required fields are present
            expect(savedData).toBeDefined();
            expect(savedData.sessionId).toBe(testController.sessionId);
            expect(savedData.startTime).toBe(testController.startTime);
            expect(savedData.endTime).toBeDefined();
            expect(savedData.score).toBe(testController.getScore());
            expect(savedData.recommendation).toEqual(testController.getRecommendation());
            
            // Verify all answers are saved
            questionIds.forEach((questionId) => {
              expect(savedData.answers[questionId]).toBeDefined();
              expect(savedData.answers[questionId].points).toBe(answerPoints[questionId]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
