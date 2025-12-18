/**
 * Verification script for /api/log-diagnostic endpoint
 * Tests the endpoint with sample diagnostic data
 */

const logDiagnostic = require('./api/log-diagnostic.js');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  url: '/api/log-diagnostic',
  headers: {
    'content-type': 'application/json'
  },
  body: {
    timestamp: new Date().toISOString(),
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

const mockRes = {
  statusCode: 200,
  headers: {},
  setHeader: function(key, value) {
    this.headers[key] = value;
    return this;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.body = data;
    console.log('\n✅ Response Status:', this.statusCode);
    console.log('✅ Response Body:', JSON.stringify(data, null, 2));
    return this;
  },
  end: function() {
    return this;
  }
};

console.log('🧪 Testing /api/log-diagnostic endpoint...\n');
console.log('📤 Request Body:', JSON.stringify(mockReq.body, null, 2));

logDiagnostic(mockReq, mockRes)
  .then(() => {
    console.log('\n✅ Endpoint verification complete!');
    console.log('📊 CORS Headers:', mockRes.headers);
  })
  .catch((error) => {
    console.error('\n❌ Endpoint verification failed:', error);
    process.exit(1);
  });
