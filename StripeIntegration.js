/**
 * StripeIntegration - Handles Stripe payment integration for the diagnostic
 * 
 * This class is responsible for:
 * - Creating Stripe Checkout sessions
 * - Redirecting to Stripe Checkout
 * - Handling payment errors gracefully
 * - Providing user-friendly error messages
 */

class StripeIntegration {
  /**
   * Initialize the Stripe integration
   * @param {Object} options - Configuration options
   * @param {string} options.apiEndpoint - The checkout session API endpoint (default: '/api/create-checkout-session')
   */
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/create-checkout-session';
    this.isProcessing = false;
  }

  /**
   * Create a checkout session and redirect to Stripe
   * @param {Object} bookingData - Booking information
   * @param {string} bookingData.email - Customer email (optional)
   * @param {string} bookingData.calendlyEventUri - Calendly event URI (optional)
   * @param {string} bookingData.calendlyInviteeUri - Calendly invitee URI (optional)
   * @returns {Promise<void>}
   */
  async createCheckoutSession(bookingData = {}) {
    // Prevent duplicate submissions
    if (this.isProcessing) {
      console.warn('StripeIntegration: Payment already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      console.log('StripeIntegration: Creating checkout session', bookingData);

      // Call the API to create checkout session
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();

      // Validate response data
      if (!data.url) {
        throw new Error('Invalid response: missing checkout URL');
      }

      console.log('StripeIntegration: Checkout session created', data.sessionId);

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('StripeIntegration: Error creating checkout session:', error);
      
      // Convert to user-friendly error message
      const userMessage = this.getUserFriendlyErrorMessage(error);
      
      // Display error to user
      this.displayError(userMessage);
      
      // Re-throw for caller to handle if needed
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Convert technical errors to user-friendly messages
   * @param {Error} error - The error object
   * @returns {string} User-friendly error message
   */
  getUserFriendlyErrorMessage(error) {
    if (!error || !error.message) {
      return 'Unable to process payment. Please try again or contact support.';
    }

    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }

    // Card/payment errors
    if (message.includes('card') || message.includes('declined')) {
      return 'Payment declined. Please check your card details and try again.';
    }

    // Validation errors
    if (message.includes('invalid email')) {
      return 'Invalid email address. Please check your email and try again.';
    }

    if (message.includes('invalid')) {
      return 'Invalid payment information. Please check your details and try again.';
    }

    // Configuration errors
    if (message.includes('configuration') || message.includes('not configured')) {
      return 'Payment system is not configured. Please contact support.';
    }

    // Server errors
    if (message.includes('server') || message.includes('500') || message.includes('503')) {
      return 'Server error. Please try again in a few moments or contact support.';
    }

    // Generic error
    return 'Unable to process payment. Please try again or contact support.';
  }

  /**
   * Display error message to user
   * @param {string} message - Error message to display
   */
  displayError(message) {
    // Create error modal
    const errorHtml = `
      <div class="stripe-error-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      ">
        <div class="stripe-error-content" style="
          background: white;
          padding: 32px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
          ">⚠️</div>
          
          <h2 style="
            margin: 0 0 16px 0;
            font-size: 24px;
            color: #dc2626;
            text-align: center;
          ">Payment Error</h2>
          
          <p style="
            margin: 0 0 24px 0;
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            text-align: center;
          ">${message}</p>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="stripe-error-retry" style="
              padding: 12px 24px;
              background: #163b63;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">Try Again</button>
            
            <button class="stripe-error-close" style="
              padding: 12px 24px;
              background: #f3f4f6;
              color: #4b5563;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            ">Close</button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .stripe-error-retry:hover {
          background: #0f243d;
          transform: translateY(-2px);
        }
        
        .stripe-error-close:hover {
          background: #e5e7eb;
        }
      </style>
    `;

    // Insert error modal into DOM
    const errorContainer = document.createElement('div');
    errorContainer.innerHTML = errorHtml;
    document.body.appendChild(errorContainer);

    // Add event listeners
    const retryButton = errorContainer.querySelector('.stripe-error-retry');
    const closeButton = errorContainer.querySelector('.stripe-error-close');
    const overlay = errorContainer.querySelector('.stripe-error-overlay');

    const closeError = () => {
      document.body.removeChild(errorContainer);
    };

    retryButton.addEventListener('click', () => {
      closeError();
      // Caller can handle retry logic
    });

    closeButton.addEventListener('click', closeError);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeError();
      }
    });

    console.log('StripeIntegration: Error displayed to user');
  }

  /**
   * Check if Stripe.js is loaded
   * @returns {boolean} True if Stripe.js is loaded
   */
  isStripeLoaded() {
    return typeof window !== 'undefined' && typeof window.Stripe !== 'undefined';
  }

  /**
   * Wait for Stripe.js to load
   * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
   * @returns {Promise<boolean>} True if loaded, false if timeout
   */
  async waitForStripe(timeout = 5000) {
    const startTime = Date.now();
    const checkInterval = 100;

    return new Promise((resolve) => {
      const checkStripe = () => {
        if (this.isStripeLoaded()) {
          console.log('StripeIntegration: Stripe.js loaded');
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          console.error('StripeIntegration: Stripe.js load timeout');
          resolve(false);
        } else {
          setTimeout(checkStripe, checkInterval);
        }
      };

      checkStripe();
    });
  }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StripeIntegration;
}
