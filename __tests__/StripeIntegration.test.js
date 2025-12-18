/**
 * Unit tests for StripeIntegration class
 */

const StripeIntegration = require('../StripeIntegration');

// Mock fetch
global.fetch = jest.fn();

// Mock window.location with proper setter
delete global.window;
global.window = {
  location: {
    _href: '',
    get href() {
      return this._href;
    },
    set href(value) {
      this._href = value;
    }
  }
};

// Mock document for DOM manipulation
global.document = {
  createElement: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

describe('StripeIntegration', () => {
  let stripeIntegration;

  beforeEach(() => {
    stripeIntegration = new StripeIntegration();
    jest.clearAllMocks();
    global.fetch.mockClear();
    global.window.location._href = '';
  });

  describe('Constructor', () => {
    test('should initialize with default API endpoint', () => {
      const integration = new StripeIntegration();
      expect(integration.apiEndpoint).toBe('/api/create-checkout-session');
    });

    test('should accept custom API endpoint', () => {
      const integration = new StripeIntegration({ apiEndpoint: '/custom/endpoint' });
      expect(integration.apiEndpoint).toBe('/custom/endpoint');
    });

    test('should initialize isProcessing as false', () => {
      const integration = new StripeIntegration();
      expect(integration.isProcessing).toBe(false);
    });
  });

  describe('createCheckoutSession', () => {
    test('should call fetch with correct parameters', async () => {
      const mockSessionId = 'cs_test_123';
      const mockUrl = 'https://checkout.stripe.com/pay/cs_test_123';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: mockSessionId, url: mockUrl })
      });

      try {
        await stripeIntegration.createCheckoutSession({
          email: 'test@example.com'
        });
      } catch (e) {
        // Ignore navigation errors in test environment
      }

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout-session',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com')
        })
      );
    });

    test('should include Calendly metadata in request', async () => {
      const mockUrl = 'https://checkout.stripe.com/pay/cs_test_123';
      const calendlyData = {
        email: 'veteran@example.com',
        calendlyEventUri: 'https://calendly.com/events/abc',
        calendlyInviteeUri: 'https://calendly.com/invitees/xyz'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123', url: mockUrl })
      });

      await stripeIntegration.createCheckoutSession(calendlyData);

      // Verify Calendly data was sent
      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.calendlyEventUri).toBe(calendlyData.calendlyEventUri);
      expect(requestBody.calendlyInviteeUri).toBe(calendlyData.calendlyInviteeUri);
    });

    test('should prevent duplicate submissions', async () => {
      const mockUrl = 'https://checkout.stripe.com/pay/cs_test_123';

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123', url: mockUrl })
      });

      // Start first request
      const promise1 = stripeIntegration.createCheckoutSession({ email: 'test@example.com' });
      
      // Try to start second request immediately
      const promise2 = stripeIntegration.createCheckoutSession({ email: 'test2@example.com' });

      await promise1;
      await promise2;

      // Should only call fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should handle missing checkout URL in response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123' }) // Missing url
      });

      await expect(
        stripeIntegration.createCheckoutSession({ email: 'test@example.com' })
      ).rejects.toThrow('Invalid response: missing checkout URL');
    });

    test('should handle HTTP error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid email format' })
      });

      await expect(
        stripeIntegration.createCheckoutSession({ email: 'invalid' })
      ).rejects.toThrow('Invalid email format');
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(
        stripeIntegration.createCheckoutSession({ email: 'test@example.com' })
      ).rejects.toThrow('Network request failed');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    test('should handle network errors', () => {
      const error = new Error('Network request failed');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('Network error');
      expect(message).toContain('check your connection');
    });

    test('should handle timeout errors', () => {
      const error = new Error('Request timed out');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('timed out');
      expect(message).toContain('try again');
    });

    test('should handle card declined errors', () => {
      const error = new Error('Card declined');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('Payment declined');
      expect(message).toContain('card details');
    });

    test('should handle invalid email errors', () => {
      const error = new Error('Invalid email format');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('Invalid email');
      expect(message).toContain('check your email');
    });

    test('should handle configuration errors', () => {
      const error = new Error('Server configuration error');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('not configured');
      expect(message).toContain('contact support');
    });

    test('should handle server errors', () => {
      const error = new Error('HTTP 500: Internal Server Error');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('Server error');
      expect(message).toContain('contact support');
    });

    test('should handle null/undefined errors', () => {
      const message1 = stripeIntegration.getUserFriendlyErrorMessage(null);
      const message2 = stripeIntegration.getUserFriendlyErrorMessage(undefined);
      const message3 = stripeIntegration.getUserFriendlyErrorMessage({});

      expect(message1).toContain('Unable to process payment');
      expect(message2).toContain('Unable to process payment');
      expect(message3).toContain('Unable to process payment');
    });

    test('should provide generic message for unknown errors', () => {
      const error = new Error('Some unknown error');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).toContain('Unable to process payment');
      expect(message).toContain('try again');
      expect(message).toContain('contact support');
    });

    test('should not expose technical details', () => {
      const error = new Error('STRIPE_SECRET_KEY is undefined');
      const message = stripeIntegration.getUserFriendlyErrorMessage(error);
      expect(message).not.toContain('STRIPE_SECRET_KEY');
      expect(message).not.toContain('undefined');
    });
  });

  describe('displayError', () => {
    test('should not throw errors when displaying error', () => {
      // Just verify it doesn't throw
      expect(() => {
        stripeIntegration.displayError('Test error message');
      }).not.toThrow();
    });
  });

  describe('isStripeLoaded', () => {
    test('should return false when Stripe is not loaded', () => {
      delete global.window.Stripe;
      expect(stripeIntegration.isStripeLoaded()).toBe(false);
    });

    test('should return true when Stripe is loaded', () => {
      global.window.Stripe = {};
      expect(stripeIntegration.isStripeLoaded()).toBe(true);
      delete global.window.Stripe;
    });
  });

  describe('waitForStripe', () => {
    test('should resolve immediately if Stripe is already loaded', async () => {
      global.window.Stripe = {};
      const result = await stripeIntegration.waitForStripe();
      expect(result).toBe(true);
      delete global.window.Stripe;
    });

    test('should wait for Stripe to load', async () => {
      // Simulate Stripe loading after 200ms
      setTimeout(() => {
        global.window.Stripe = {};
      }, 200);

      const result = await stripeIntegration.waitForStripe(1000);
      expect(result).toBe(true);
      delete global.window.Stripe;
    });

    test('should timeout if Stripe does not load', async () => {
      delete global.window.Stripe;
      const result = await stripeIntegration.waitForStripe(100);
      expect(result).toBe(false);
    });
  });
});
