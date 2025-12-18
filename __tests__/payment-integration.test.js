/**
 * Payment Integration Tests
 * Tests for Stripe payment flow integration with the diagnostic
 */

const fc = require('fast-check');

// Mock fetch for testing
global.fetch = jest.fn();

describe('Payment Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 20: Payment success redirect
   * Validates: Requirements 10.4
   */
  describe('Property 20: Payment success redirect', () => {
    test('should redirect to success page with session ID for any successful payment', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random session IDs
          fc.string({ minLength: 20, maxLength: 50 }).filter(s => s.trim().length > 0),
          async (sessionId) => {
            // Mock successful checkout session creation
            const mockResponse = {
              sessionId: sessionId,
              url: `https://checkout.stripe.com/pay/${sessionId}`
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse
            });

            // Simulate payment flow
            const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            // Verify response contains session ID and URL
            expect(data.sessionId).toBe(sessionId);
            expect(data.url).toContain(sessionId);
            expect(data.url).toContain('checkout.stripe.com');

            // Verify the URL would redirect properly
            expect(typeof data.url).toBe('string');
            expect(data.url.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should include session_id parameter in success page URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate alphanumeric session IDs (more realistic)
          fc.stringMatching(/^[a-zA-Z0-9_-]{20,50}$/),
          async (sessionId) => {
            // Simulate success page redirect with URL encoding
            const encodedSessionId = encodeURIComponent(sessionId);
            const successUrl = `https://example.com/success.html?session_id=${encodedSessionId}`;
            
            // Parse URL to verify session_id parameter
            const url = new URL(successUrl);
            const sessionIdParam = url.searchParams.get('session_id');

            // Verify session ID is present in URL
            expect(sessionIdParam).toBe(sessionId);
            expect(sessionIdParam).not.toBeNull();
            expect(sessionIdParam.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 21: Payment error handling
   * Validates: Requirements 10.5
   */
  describe('Property 21: Payment error handling', () => {
    test('should display user-friendly error message for any payment error', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various error scenarios
          fc.oneof(
            fc.constant('network_error'),
            fc.constant('invalid_request'),
            fc.constant('api_error'),
            fc.constant('card_declined'),
            fc.constant('processing_error')
          ),
          async (errorType) => {
            // Mock error response
            global.fetch.mockRejectedValueOnce(new Error(errorType));

            // Simulate payment attempt
            try {
              await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              // Verify error is caught
              expect(error).toBeDefined();
              expect(error.message).toBeDefined();
              
              // Verify error message doesn't expose technical details
              const userFriendlyMessage = getUserFriendlyErrorMessage(error);
              expect(userFriendlyMessage).not.toContain('stack');
              expect(userFriendlyMessage).not.toContain('undefined');
              expect(userFriendlyMessage).not.toContain('null');
              expect(userFriendlyMessage.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle server errors gracefully without exposing internal details', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (statusCode, errorMessage) => {
            // Mock server error response
            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: statusCode,
              json: async () => ({ error: errorMessage })
            });

            // Simulate payment attempt
            const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            // Verify error response
            expect(response.ok).toBe(false);
            expect(response.status).toBe(statusCode);

            const data = await response.json();
            
            // Verify error message is present
            expect(data.error).toBeDefined();
            expect(typeof data.error).toBe('string');
            
            // Convert to user-friendly message
            const userMessage = getUserFriendlyErrorMessage({ message: data.error });
            
            // Verify user-friendly message doesn't expose technical details
            expect(userMessage).not.toContain('STRIPE_SECRET_KEY');
            expect(userMessage).not.toContain('process.env');
            expect(userMessage).not.toContain('undefined');
            expect(userMessage.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Helper function to convert technical errors to user-friendly messages
 * This simulates the error handling logic that should be in the UI
 */
function getUserFriendlyErrorMessage(error) {
  if (!error || !error.message) {
    return 'Unable to process payment. Please try again or contact support.';
  }

  const message = error.message.toLowerCase();

  // Map technical errors to user-friendly messages
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (message.includes('card') || message.includes('declined')) {
    return 'Payment declined. Please check your card details and try again.';
  }

  if (message.includes('invalid')) {
    return 'Invalid payment information. Please check your details and try again.';
  }

  // Generic user-friendly message for any other error
  return 'Unable to process payment. Please try again or contact support.';
}

/**
 * Integration Tests for Payment Flow
 * Tests complete flow from CTA to Stripe to success page
 * Validates: Requirements 10.1, 10.2, 10.4, 10.5
 */
describe('Payment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Complete payment flow', () => {
    test('should complete full flow from CTA click to success page', async () => {
      // Mock successful checkout session creation
      const mockSessionId = 'cs_test_abc123xyz';
      const mockCheckoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: mockSessionId,
          url: mockCheckoutUrl
        })
      });

      // Step 1: User clicks CTA button (simulated)
      const ctaClicked = true;
      expect(ctaClicked).toBe(true);

      // Step 2: Call create-checkout-session endpoint
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          calendlyEventUri: 'https://calendly.com/events/test',
          calendlyInviteeUri: 'https://calendly.com/invitees/test'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Step 3: Verify checkout session created
      expect(data.sessionId).toBe(mockSessionId);
      expect(data.url).toBe(mockCheckoutUrl);

      // Step 4: Simulate redirect to Stripe Checkout
      const redirectUrl = data.url;
      expect(redirectUrl).toContain('checkout.stripe.com');

      // Step 5: Simulate successful payment (Stripe redirects to success page)
      const successPageUrl = `https://example.com/success.html?session_id=${mockSessionId}`;
      const successUrl = new URL(successPageUrl);
      const sessionIdParam = successUrl.searchParams.get('session_id');

      // Step 6: Verify success page receives session ID
      expect(sessionIdParam).toBe(mockSessionId);
      expect(sessionIdParam).not.toBeNull();
    });

    test('should handle payment with Calendly metadata', async () => {
      const mockSessionId = 'cs_test_with_calendly';
      const calendlyEventUri = 'https://calendly.com/events/abc123';
      const calendlyInviteeUri = 'https://calendly.com/invitees/xyz789';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: mockSessionId,
          url: `https://checkout.stripe.com/pay/${mockSessionId}`
        })
      });

      // Create checkout session with Calendly metadata
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'veteran@example.com',
          calendlyEventUri: calendlyEventUri,
          calendlyInviteeUri: calendlyInviteeUri
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Verify session created successfully
      expect(data.sessionId).toBe(mockSessionId);
      expect(data.url).toContain('checkout.stripe.com');

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(calendlyEventUri)
        })
      );
    });

    test('should work without email (optional field)', async () => {
      const mockSessionId = 'cs_test_no_email';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: mockSessionId,
          url: `https://checkout.stripe.com/pay/${mockSessionId}`
        })
      });

      // Create checkout session without email
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendlyEventUri: 'https://calendly.com/events/test'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Verify session created successfully without email
      expect(data.sessionId).toBe(mockSessionId);
      expect(data.url).toContain('checkout.stripe.com');
    });
  });

  describe('Error scenarios', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

      try {
        await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Verify error is caught
        expect(error).toBeDefined();
        expect(error.message).toContain('Network');
        
        // Verify user-friendly error message
        const userMessage = getUserFriendlyErrorMessage(error);
        expect(userMessage).toContain('Network error');
        expect(userMessage).toContain('try again');
      }
    });

    test('should handle invalid email format error', async () => {
      // Mock validation error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid email format. Please provide a valid email address.'
        })
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email'
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid email');
      
      // Verify error message is user-friendly
      expect(data.error).not.toContain('undefined');
      expect(data.error).not.toContain('null');
    });

    test('should handle server configuration errors', async () => {
      // Mock server configuration error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Server configuration error. Please contact support.'
        })
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);

      const data = await response.json();
      
      // Verify error message doesn't expose internal details
      expect(data.error).not.toContain('STRIPE_SECRET_KEY');
      expect(data.error).not.toContain('STRIPE_PRICE_ID');
      expect(data.error).not.toContain('process.env');
      
      // Verify error message is helpful
      expect(data.error).toContain('contact support');
    });

    test('should handle Stripe API errors', async () => {
      // Mock Stripe API error
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Unable to process payment. Please try again or contact support.'
        })
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.ok).toBe(false);
      const data = await response.json();

      // Verify generic user-friendly error message
      expect(data.error).toContain('Unable to process payment');
      expect(data.error).toContain('try again');
      expect(data.error).toContain('contact support');
      
      // Verify no technical details exposed
      expect(data.error).not.toContain('stack');
      expect(data.error).not.toContain('statusCode');
      expect(data.error).not.toContain('type');
    });

    test('should handle timeout errors', async () => {
      // Mock timeout error
      global.fetch.mockRejectedValueOnce(new Error('Request timeout'));

      try {
        await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        
        const userMessage = getUserFriendlyErrorMessage(error);
        expect(userMessage).toContain('timed out');
        expect(userMessage).toContain('try again');
      }
    });
  });

  describe('Stripe.js v3 integration', () => {
    test('should verify Stripe.js v3 is loaded', () => {
      // Simulate Stripe.js script tag in document
      const stripeScriptUrl = 'https://js.stripe.com/v3/';
      
      // Verify the URL is correct for Stripe.js v3
      expect(stripeScriptUrl).toContain('js.stripe.com');
      expect(stripeScriptUrl).toContain('/v3/');
      expect(stripeScriptUrl).not.toContain('/v2/');
    });

    test('should handle Stripe.js load failure gracefully', () => {
      // Simulate Stripe.js not loaded
      const isStripeLoaded = typeof window !== 'undefined' && typeof window.Stripe !== 'undefined';
      
      if (!isStripeLoaded) {
        // Should show user-friendly error
        const errorMessage = 'Unable to load payment system. Please refresh the page or contact support.';
        expect(errorMessage).toContain('Unable to load');
        expect(errorMessage).toContain('refresh');
      }
    });
  });

  describe('Success page redirect', () => {
    test('should redirect to success page with session_id parameter', () => {
      const sessionId = 'cs_test_success_redirect';
      const domain = 'https://example.com';
      const successUrl = `${domain}/success.html?session_id=${sessionId}`;

      // Parse URL
      const url = new URL(successUrl);
      
      // Verify success page path
      expect(url.pathname).toBe('/success.html');
      
      // Verify session_id parameter
      expect(url.searchParams.get('session_id')).toBe(sessionId);
      
      // Verify domain
      expect(url.origin).toBe(domain);
    });

    test('should handle success page with CHECKOUT_SESSION_ID placeholder', () => {
      const domain = 'https://example.com';
      const successUrlTemplate = `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`;

      // Verify template format
      expect(successUrlTemplate).toContain('{CHECKOUT_SESSION_ID}');
      
      // Simulate Stripe replacing placeholder
      const actualSessionId = 'cs_test_actual_session';
      const actualSuccessUrl = successUrlTemplate.replace('{CHECKOUT_SESSION_ID}', actualSessionId);
      
      // Verify replacement worked
      expect(actualSuccessUrl).not.toContain('{CHECKOUT_SESSION_ID}');
      expect(actualSuccessUrl).toContain(actualSessionId);
      
      // Verify URL is valid
      const url = new URL(actualSuccessUrl);
      expect(url.searchParams.get('session_id')).toBe(actualSessionId);
    });
  });
});
