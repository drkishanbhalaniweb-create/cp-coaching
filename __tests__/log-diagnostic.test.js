/**
 * Unit tests for /api/log-diagnostic.js serverless function
 * Tests validate payload acceptance, rejection, ID generation, and CORS headers
 * Requirements: 9.2, 9.3
 */

const fs = require('fs').promises;
const path = require('path');

// Mock the serverless function
let logDiagnostic;

describe('log-diagnostic endpoint', () => {
  let mockReq;
  let mockRes;
  let dataDir;
  let diagnosticsFile;

  beforeEach(async () => {
    // Setup test data directory
    dataDir = path.join(process.cwd(), 'data');
    diagnosticsFile = path.join(dataDir, 'diagnostics.json');

    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Clear diagnostics file before each test
    try {
      await fs.writeFile(diagnosticsFile, JSON.stringify([], null, 2));
    } catch (error) {
      // File might not exist yet
    }

    // Reset module cache to get fresh instance
    jest.resetModules();
    logDiagnostic = require('../api/log-diagnostic.js');

    // Setup mock request and response objects
    mockReq = {
      method: 'POST',
      headers: {},
      body: {
        timestamp: '2025-12-18T10:30:00.000Z',
        answers: {
          service_connection: 2,
          denial_handling: 1,
          pathway: 2,
          severity: 1,
          secondaries: 2
        },
        score: 8,
        recommendation: 'REVIEW_STRONGLY_RECOMMENDED'
      }
    };

    mockRes = {
      statusCode: 200,
      headers: {},
      setHeader: jest.fn(function(key, value) {
        this.headers[key] = value;
        return this;
      }),
      status: jest.fn(function(code) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn(function(data) {
        this.body = data;
        return this;
      }),
      end: jest.fn(function() {
        return this;
      })
    };
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      await fs.unlink(diagnosticsFile);
    } catch (error) {
      // File might not exist
    }
  });

  describe('Valid payload acceptance', () => {
    test('should accept valid payload with all required fields', async () => {
      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.success).toBe(true);
      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
      expect(response.id).toMatch(/^diag_/);
    });

    test('should store diagnostic data in JSON file', async () => {
      await logDiagnostic(mockReq, mockRes);

      const fileContent = await fs.readFile(diagnosticsFile, 'utf8');
      const diagnostics = JSON.parse(fileContent);

      expect(Array.isArray(diagnostics)).toBe(true);
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].timestamp).toBe(mockReq.body.timestamp);
      expect(diagnostics[0].score).toBe(mockReq.body.score);
      expect(diagnostics[0].recommendation).toBe(mockReq.body.recommendation);
      expect(diagnostics[0].answers).toEqual(mockReq.body.answers);
    });

    test('should append to existing diagnostics', async () => {
      // First request
      await logDiagnostic(mockReq, mockRes);
      
      // Second request with different data
      mockReq.body.score = 5;
      mockReq.body.recommendation = 'REVIEW_BENEFICIAL';
      await logDiagnostic(mockReq, mockRes);

      const fileContent = await fs.readFile(diagnosticsFile, 'utf8');
      const diagnostics = JSON.parse(fileContent);

      expect(diagnostics.length).toBe(2);
      expect(diagnostics[0].score).toBe(8);
      expect(diagnostics[1].score).toBe(5);
    });
  });

  describe('Invalid payload rejection', () => {
    test('should reject payload missing timestamp', async () => {
      delete mockReq.body.timestamp;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
      expect(response.error).toContain('Invalid payload');
    });

    test('should reject payload missing answers', async () => {
      delete mockReq.body.answers;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });

    test('should reject payload missing score', async () => {
      delete mockReq.body.score;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });

    test('should reject payload missing recommendation', async () => {
      delete mockReq.body.recommendation;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });

    test('should reject payload with invalid score type', async () => {
      mockReq.body.score = 'invalid';

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });

    test('should reject payload with score out of range', async () => {
      mockReq.body.score = 15;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });

    test('should reject payload with incomplete answers', async () => {
      delete mockReq.body.answers.service_connection;

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();
    });
  });

  describe('Unique ID generation', () => {
    test('should generate unique IDs for each request', async () => {
      await logDiagnostic(mockReq, mockRes);
      const firstId = mockRes.body.id;

      // Reset mock
      mockRes.body = null;
      mockRes.json.mockClear();

      await logDiagnostic(mockReq, mockRes);
      const secondId = mockRes.body.id;

      expect(firstId).not.toBe(secondId);
    });

    test('should generate IDs with correct format', async () => {
      await logDiagnostic(mockReq, mockRes);

      const id = mockRes.body.id;
      expect(id).toMatch(/^diag_[0-9a-z]+_[0-9a-z]+$/);
    });

    test('should include generated ID in stored data', async () => {
      await logDiagnostic(mockReq, mockRes);
      const responseId = mockRes.body.id;

      const fileContent = await fs.readFile(diagnosticsFile, 'utf8');
      const diagnostics = JSON.parse(fileContent);

      expect(diagnostics[0].id).toBe(responseId);
    });
  });

  describe('CORS headers', () => {
    test('should set CORS headers for POST requests', async () => {
      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
    });

    test('should handle OPTIONS preflight request', async () => {
      mockReq.method = 'OPTIONS';

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('should reject non-POST methods', async () => {
      mockReq.method = 'GET';

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toContain('Method not allowed');
    });
  });

  describe('Error handling', () => {
    test('should handle file system errors gracefully', async () => {
      // Mock fs.writeFile to throw an error
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn().mockRejectedValue(new Error('Disk full'));

      await logDiagnostic(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
      
      const response = mockRes.body;
      expect(response.error).toBeDefined();

      // Restore original function
      fs.writeFile = originalWriteFile;
    });

    test('should log errors without exposing internal details', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fs.writeFile to throw an error
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn().mockRejectedValue(new Error('Internal error'));

      await logDiagnostic(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockRes.body.error).not.toContain('Internal error');

      // Restore
      fs.writeFile = originalWriteFile;
      consoleSpy.mockRestore();
    });
  });
});
