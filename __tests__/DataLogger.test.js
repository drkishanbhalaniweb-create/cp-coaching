/**
 * Property-Based and Unit Tests for DataLogger
 * 
 * These tests verify:
 * - Property 19: Diagnostic payload structure
 * - Payload formatting correctness
 * - POST request behavior
 * - Error handling that doesn't block user experience
 */

const fc = require('fast-check');
const DataLogger = require('../DataLogger');

describe('DataLogger', () => {
  let logger;

  beforeEach(() => {
    logger = new DataLogger();
    
    // Mock fetch for testing
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 19: Diagnostic payload structure
   * Validates: Requirements 9.3
   */
  describe('Property 19: Diagnostic payload structure', () => {
    test('should include timestamp, answers, score, and recommendation for any valid diagnostic data', () => {
      fc.assert(
        fc.property(
          // Generate random answer data
          fc.record({
            service_connection: fc.integer({ min: 0, max: 2 }),
            denial_handling: fc.integer({ min: 0, max: 2 }),
            pathway: fc.integer({ min: 0, max: 2 }),
            severity: fc.integer({ min: 0, max: 2 }),
            secondaries: fc.integer({ min: 0, max: 2 })
          }),
          // Generate random score
          fc.integer({ min: 0, max: 10 }),
          // Generate random recommendation
          fc.constantFrom(
            'FULLY_READY',
            'OPTIONAL_CONFIRMATION',
            'REVIEW_BENEFICIAL',
            'REVIEW_STRONGLY_RECOMMENDED'
          ),
          (answers, score, recommendation) => {
            // Format the payload
            const payload = logger.formatPayload(answers, score, recommendation);

            // Verify payload structure
            expect(payload).toHaveProperty('timestamp');
            expect(payload).toHaveProperty('answers');
            expect(payload).toHaveProperty('score');
            expect(payload).toHaveProperty('recommendation');

            // Verify timestamp is ISO 8601 format
            expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Verify answers structure
            expect(payload.answers).toHaveProperty('service_connection');
            expect(payload.answers).toHaveProperty('denial_handling');
            expect(payload.answers).toHaveProperty('pathway');
            expect(payload.answers).toHaveProperty('severity');
            expect(payload.answers).toHaveProperty('secondaries');

            // Verify all answer values are numbers 0-2
            Object.values(payload.answers).forEach(points => {
              expect(typeof points).toBe('number');
              expect(points).toBeGreaterThanOrEqual(0);
              expect(points).toBeLessThanOrEqual(2);
            });

            // Verify score
            expect(payload.score).toBe(score);
            expect(typeof payload.score).toBe('number');
            expect(payload.score).toBeGreaterThanOrEqual(0);
            expect(payload.score).toBeLessThanOrEqual(10);

            // Verify recommendation
            expect(payload.recommendation).toBe(recommendation);
            expect(typeof payload.recommendation).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Unit Tests for DataLogger
   * Validates: Requirements 9.2, 9.3
   */
  describe('Unit Tests', () => {
    describe('formatPayload', () => {
      test('should format payload with answer objects containing points', () => {
        const answers = {
          service_connection: { answerText: 'Yes', points: 0, timestamp: '2025-12-18T10:00:00.000Z' },
          denial_handling: { answerText: 'No', points: 2, timestamp: '2025-12-18T10:01:00.000Z' },
          pathway: { answerText: 'Somewhat', points: 1, timestamp: '2025-12-18T10:02:00.000Z' },
          severity: { answerText: 'Yes', points: 0, timestamp: '2025-12-18T10:03:00.000Z' },
          secondaries: { answerText: 'No', points: 2, timestamp: '2025-12-18T10:04:00.000Z' }
        };
        const score = 5;
        const recommendation = 'REVIEW_BENEFICIAL';

        const payload = logger.formatPayload(answers, score, recommendation);

        expect(payload.answers).toEqual({
          service_connection: 0,
          denial_handling: 2,
          pathway: 1,
          severity: 0,
          secondaries: 2
        });
        expect(payload.score).toBe(5);
        expect(payload.recommendation).toBe('REVIEW_BENEFICIAL');
        expect(payload.timestamp).toBeDefined();
      });

      test('should format payload with simple numeric answer values', () => {
        const answers = {
          service_connection: 0,
          denial_handling: 2,
          pathway: 1,
          severity: 0,
          secondaries: 2
        };
        const score = 5;
        const recommendation = 'REVIEW_BENEFICIAL';

        const payload = logger.formatPayload(answers, score, recommendation);

        expect(payload.answers).toEqual(answers);
        expect(payload.score).toBe(5);
        expect(payload.recommendation).toBe('REVIEW_BENEFICIAL');
      });

      test('should include ISO 8601 timestamp', () => {
        const answers = {
          service_connection: 0,
          denial_handling: 0,
          pathway: 0,
          severity: 0,
          secondaries: 0
        };
        const score = 0;
        const recommendation = 'FULLY_READY';

        const payload = logger.formatPayload(answers, score, recommendation);

        expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    describe('logDiagnostic', () => {
      test('should POST diagnostic data to backend', async () => {
        // Mock successful response
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, id: 'diag_123' })
        });

        const diagnosticData = {
          answers: {
            service_connection: 0,
            denial_handling: 1,
            pathway: 0,
            severity: 1,
            secondaries: 2
          },
          score: 4,
          recommendation: 'REVIEW_BENEFICIAL'
        };

        const result = await logger.logDiagnostic(diagnosticData);

        // Verify fetch was called
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/log-diagnostic',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: expect.any(String)
          })
        );

        // Verify result
        expect(result.success).toBe(true);
        expect(result.id).toBe('diag_123');
      });

      test('should include CORS headers in request', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, id: 'diag_123' })
        });

        const diagnosticData = {
          answers: {
            service_connection: 0,
            denial_handling: 0,
            pathway: 0,
            severity: 0,
            secondaries: 0
          },
          score: 0,
          recommendation: 'FULLY_READY'
        };

        await logger.logDiagnostic(diagnosticData);

        const fetchCall = global.fetch.mock.calls[0];
        const headers = fetchCall[1].headers;

        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Accept']).toBe('application/json');
      });

      test('should handle network errors gracefully without blocking user', async () => {
        // Mock network error
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        const diagnosticData = {
          answers: {
            service_connection: 2,
            denial_handling: 2,
            pathway: 2,
            severity: 2,
            secondaries: 2
          },
          score: 10,
          recommendation: 'REVIEW_STRONGLY_RECOMMENDED'
        };

        // Should not throw - error is handled gracefully
        const result = await logger.logDiagnostic(diagnosticData);

        // Should return error response but not throw
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should handle backend errors gracefully without blocking user', async () => {
        // Mock backend error response
        global.fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Internal server error' })
        });

        const diagnosticData = {
          answers: {
            service_connection: 1,
            denial_handling: 1,
            pathway: 1,
            severity: 1,
            secondaries: 1
          },
          score: 5,
          recommendation: 'REVIEW_BENEFICIAL'
        };

        // Should not throw - error is handled gracefully
        const result = await logger.logDiagnostic(diagnosticData);

        // Should return error response but not throw
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('handleLoggingError', () => {
      test('should log error to console without throwing', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const error = new Error('Test error');
        logger.handleLoggingError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Diagnostic logging failed:', error);
        
        consoleErrorSpy.mockRestore();
      });
    });
  });
});
