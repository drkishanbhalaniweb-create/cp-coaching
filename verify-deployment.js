/**
 * Deployment Verification Script
 * Tests all API endpoints and critical functionality in production/preview environment
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.VERCEL_URL || process.env.DOMAIN || 'http://localhost:3000';
const USE_HTTPS = BASE_URL.startsWith('https://');

console.log('🚀 Starting deployment verification...');
console.log(`📍 Testing against: ${BASE_URL}\n`);

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = USE_HTTPS ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (message) {
    console.log(`   ${message}`);
  }
  
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Test 1: Homepage loads (diagnostic.html)
async function testHomepage() {
  try {
    const response = await makeRequest('/');
    const passed = response.statusCode === 200 && response.body.includes('Claim Readiness Diagnostic');
    logTest('Homepage loads diagnostic interface', passed, 
      passed ? 'Diagnostic HTML loaded successfully' : `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Homepage loads diagnostic interface', false, error.message);
  }
}

// Test 2: Diagnostic HTML loads directly
async function testDiagnosticHTML() {
  try {
    const response = await makeRequest('/diagnostic.html');
    const passed = response.statusCode === 200 && 
                   response.body.includes('diagnostic-container') &&
                   response.body.includes('DiagnosticController');
    logTest('Diagnostic HTML loads with all components', passed,
      passed ? 'All diagnostic components present' : `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Diagnostic HTML loads with all components', false, error.message);
  }
}

// Test 3: JavaScript files are accessible
async function testJavaScriptFiles() {
  const files = [
    '/diagnostic-config.js',
    '/ScoringEngine.js',
    '/RecommendationEngine.js',
    '/DiagnosticController.js',
    '/QuestionRenderer.js',
    '/DataLogger.js',
    '/CalendlyIntegration.js',
    '/StripeIntegration.js',
    '/diagnostic-main.js'
  ];

  for (const file of files) {
    try {
      const response = await makeRequest(file);
      const passed = response.statusCode === 200;
      logTest(`JavaScript file: ${file}`, passed, 
        passed ? 'File accessible' : `Status: ${response.statusCode}`);
    } catch (error) {
      logTest(`JavaScript file: ${file}`, false, error.message);
    }
  }
}

// Test 4: Log diagnostic API endpoint
async function testLogDiagnosticAPI() {
  try {
    const testPayload = {
      timestamp: new Date().toISOString(),
      answers: {
        service_connection: 0,
        denial_handling: 1,
        pathway: 0,
        severity: 1,
        secondaries: 0
      },
      score: 2,
      recommendation: 'OPTIONAL_CONFIRMATION'
    };

    const response = await makeRequest('/api/log-diagnostic', {
      method: 'POST',
      body: testPayload
    });

    const passed = response.statusCode === 200;
    let parsedBody;
    try {
      parsedBody = JSON.parse(response.body);
    } catch (e) {
      parsedBody = null;
    }

    logTest('Log diagnostic API endpoint', passed,
      passed ? `Response: ${JSON.stringify(parsedBody)}` : `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Log diagnostic API endpoint', false, error.message);
  }
}

// Test 5: Create checkout session API endpoint
async function testCreateCheckoutAPI() {
  try {
    const response = await makeRequest('/api/create-checkout-session', {
      method: 'POST'
    });

    // Should return 200 or redirect (303)
    const passed = response.statusCode === 200 || response.statusCode === 303;
    logTest('Create checkout session API', passed,
      `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Create checkout session API', false, error.message);
  }
}

// Test 6: CORS headers on API endpoints
async function testCORSHeaders() {
  try {
    const response = await makeRequest('/api/log-diagnostic', {
      method: 'OPTIONS'
    });

    const hasCORS = response.headers['access-control-allow-origin'] !== undefined;
    logTest('CORS headers configured', hasCORS,
      hasCORS ? 'CORS headers present' : 'CORS headers missing');
  } catch (error) {
    logTest('CORS headers configured', false, error.message);
  }
}

// Test 7: Success page loads
async function testSuccessPage() {
  try {
    const response = await makeRequest('/success.html');
    const passed = response.statusCode === 200 && response.body.includes('success');
    logTest('Success page loads', passed,
      passed ? 'Success page accessible' : `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Success page loads', false, error.message);
  }
}

// Test 8: Environment variables check
function testEnvironmentVariables() {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID',
    'CALENDLY_LINK'
  ];

  console.log('\n📋 Environment Variables Check:');
  requiredVars.forEach(varName => {
    const exists = process.env[varName] !== undefined;
    const icon = exists ? '✅' : '⚠️';
    console.log(`${icon} ${varName}: ${exists ? 'Set' : 'Not set'}`);
  });
  console.log('');
}

// Test 9: Data directory writable (for serverless functions)
async function testDataDirectory() {
  try {
    const response = await makeRequest('/api/log-diagnostic', {
      method: 'POST',
      body: {
        timestamp: new Date().toISOString(),
        answers: {
          service_connection: 0,
          denial_handling: 0,
          pathway: 0,
          severity: 0,
          secondaries: 0
        },
        score: 0,
        recommendation: 'FULLY_READY'
      }
    });

    const passed = response.statusCode === 200;
    logTest('Data directory writable', passed,
      passed ? 'Diagnostic data can be logged' : 'Data logging may have issues');
  } catch (error) {
    logTest('Data directory writable', false, error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running deployment verification tests...\n');
  
  await testHomepage();
  await testDiagnosticHTML();
  await testJavaScriptFiles();
  await testLogDiagnosticAPI();
  await testCreateCheckoutAPI();
  await testCORSHeaders();
  await testSuccessPage();
  await testDataDirectory();
  
  testEnvironmentVariables();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.tests.length}`);
  console.log('='.repeat(50));
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
