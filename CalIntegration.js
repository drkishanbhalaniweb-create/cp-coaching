/**
 * CalIntegration - Handles Cal.com booking integration
 * 
 * This class provides methods to:
 * - Open Cal.com booking modals
 * - Handle booking events
 * - Track booking completions
 * - Integrate with diagnostic flow
 */

class CalIntegration {
  constructor(config = {}) {
    this.calLink = config.calLink || 'mdnexus-lkd3ut/claim-readiness-review';
    this.theme = config.theme || 'light';
    this.layout = config.layout || 'month_view';
    
    // Check if Cal.com is loaded
    if (typeof Cal === 'undefined') {
      console.warn('Cal.com embed script not loaded. Make sure to include the Cal.com embed script.');
    }
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up Cal.com event listeners
   */
  setupEventListeners() {
    if (typeof Cal === 'undefined') return;
    
    // Listen for successful bookings
    Cal("on", {
      action: "bookingSuccessful",
      callback: (e) => {
        this.handleBookingSuccess(e.detail);
      }
    });
    
    // Listen for booking cancellations
    Cal("on", {
      action: "bookingCancelled",
      callback: (e) => {
        this.handleBookingCancelled(e.detail);
      }
    });
  }

  /**
   * Open Cal.com booking modal
   * 
   * @param {Object} options - Booking options
   * @param {string} options.calLink - Cal.com event link (optional, uses default if not provided)
   * @param {Object} options.prefill - Prefill data for the booking form
   * @param {Function} options.onSuccess - Callback for successful booking
   * @param {Function} options.onCancel - Callback for cancelled booking
   */
  openBookingModal(options = {}) {
    if (typeof Cal === 'undefined') {
      console.error('Cal.com is not loaded. Cannot open booking modal.');
      return;
    }

    const calLink = options.calLink || this.calLink;
    const prefill = options.prefill || {};
    
    // Store callbacks for this booking session
    if (options.onSuccess) {
      this.onSuccessCallback = options.onSuccess;
    }
    if (options.onCancel) {
      this.onCancelCallback = options.onCancel;
    }

    // Open Cal.com modal
    Cal("modal", {
      calLink: calLink,
      config: {
        layout: this.layout,
        theme: this.theme,
        ...prefill
      }
    });

    console.log('Cal.com booking modal opened:', calLink);
  }

  /**
   * Create inline Cal.com embed
   * 
   * @param {string} elementId - ID of the element to embed Cal.com into
   * @param {Object} options - Embed options
   */
  createInlineEmbed(elementId, options = {}) {
    if (typeof Cal === 'undefined') {
      console.error('Cal.com is not loaded. Cannot create inline embed.');
      return;
    }

    const calLink = options.calLink || this.calLink;

    Cal("inline", {
      elementOrSelector: `#${elementId}`,
      calLink: calLink,
      layout: options.layout || this.layout,
      config: {
        theme: options.theme || this.theme,
        ...options.config
      }
    });

    console.log('Cal.com inline embed created:', elementId);
  }

  /**
   * Handle successful booking
   * 
   * @param {Object} bookingData - Booking details from Cal.com
   */
  handleBookingSuccess(bookingData) {
    console.log('Booking successful:', bookingData);
    
    // Store booking data in session storage
    sessionStorage.setItem('lastBooking', JSON.stringify({
      timestamp: new Date().toISOString(),
      bookingId: bookingData.bookingId || null,
      ...bookingData
    }));

    // Call custom success callback if provided
    if (this.onSuccessCallback && typeof this.onSuccessCallback === 'function') {
      this.onSuccessCallback(bookingData);
    }

    // Track booking completion (for analytics)
    this.trackBookingEvent('booking_completed', bookingData);
  }

  /**
   * Handle cancelled booking
   * 
   * @param {Object} cancelData - Cancellation details from Cal.com
   */
  handleBookingCancelled(cancelData) {
    console.log('Booking cancelled:', cancelData);

    // Call custom cancel callback if provided
    if (this.onCancelCallback && typeof this.onCancelCallback === 'function') {
      this.onCancelCallback(cancelData);
    }

    // Track booking cancellation (for analytics)
    this.trackBookingEvent('booking_cancelled', cancelData);
  }

  /**
   * Track booking events for analytics
   * 
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Event data
   */
  trackBookingEvent(eventName, eventData) {
    // Log to console for debugging
    console.log(`[Cal.com Event] ${eventName}:`, eventData);

    // You can integrate with analytics services here
    // Example: Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'booking',
        event_label: 'claim_readiness_review',
        ...eventData
      });
    }

    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Schedule', {
        content_name: 'Claim Readiness Review',
        ...eventData
      });
    }
  }

  /**
   * Get last booking data from session storage
   * 
   * @returns {Object|null} Last booking data or null if none exists
   */
  getLastBooking() {
    const bookingData = sessionStorage.getItem('lastBooking');
    return bookingData ? JSON.parse(bookingData) : null;
  }

  /**
   * Clear booking data from session storage
   */
  clearBookingData() {
    sessionStorage.removeItem('lastBooking');
  }

  /**
   * Update Cal.com configuration
   * 
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    if (config.calLink) this.calLink = config.calLink;
    if (config.theme) this.theme = config.theme;
    if (config.layout) this.layout = config.layout;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalIntegration;
}
