/**
 * CalendlyIntegration - Handles Calendly booking widget integration
 * 
 * This class is responsible for:
 * - Loading Calendly embed script from CDN
 * - Initializing popup or inline widget
 * - Handling booking events
 * - Providing fallback contact information on errors
 */

class CalendlyIntegration {
  /**
   * Initialize the Calendly integration
   * @param {string} calendlyUrl - The Calendly scheduling URL
   */
  constructor(calendlyUrl) {
    this.calendlyUrl = calendlyUrl;
    this.isScriptLoaded = false;
    this.eventListeners = [];
    this.scriptLoadAttempts = 0;
    this.maxScriptLoadAttempts = 50; // 5 seconds with 100ms intervals
  }

  /**
   * Initialize Calendly integration
   * Loads the Calendly script and sets up event listeners
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    try {
      // Check if Calendly script is already loaded
      if (typeof Calendly !== 'undefined') {
        this.isScriptLoaded = true;
        this.setupEventListener();
        console.log('CalendlyIntegration: Script already loaded');
        return true;
      }

      // Load Calendly script from CDN
      await this.loadScript();
      
      // Set up event listener for successful bookings
      this.setupEventListener();
      
      console.log('CalendlyIntegration: Initialized successfully');
      return true;
    } catch (error) {
      console.error('CalendlyIntegration: Initialization failed:', error);
      this.showFallback();
      return false;
    }
  }

  /**
   * Load Calendly script from CDN
   * @returns {Promise<void>}
   */
  loadScript() {
    return new Promise((resolve, reject) => {
      // Check if script is already in the document
      const existingScript = document.querySelector('script[src*="calendly.com"]');
      if (existingScript) {
        // Wait for it to load
        this.waitForScriptLoad().then(resolve).catch(reject);
        return;
      }

      // Create and append script tag
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        console.log('CalendlyIntegration: Script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('CalendlyIntegration: Script failed to load');
        reject(new Error('Failed to load Calendly script'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Calendly script to load (for existing script tags)
   * @returns {Promise<void>}
   */
  waitForScriptLoad() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        this.scriptLoadAttempts++;
        
        if (typeof Calendly !== 'undefined') {
          this.isScriptLoaded = true;
          clearInterval(checkInterval);
          console.log('CalendlyIntegration: Script loaded successfully');
          resolve();
        } else if (this.scriptLoadAttempts >= this.maxScriptLoadAttempts) {
          clearInterval(checkInterval);
          console.error('CalendlyIntegration: Script load timeout');
          reject(new Error('Calendly script load timeout'));
        }
      }, 100);
    });
  }

  /**
   * Open Calendly in popup mode
   * @param {Object} options - Optional configuration for the popup
   */
  openPopup(options = {}) {
    try {
      if (!this.isScriptLoaded || typeof Calendly === 'undefined') {
        console.error('CalendlyIntegration: Script not loaded, showing fallback');
        this.showFallback();
        return;
      }
      
      const popupOptions = {
        url: this.calendlyUrl,
        ...options
      };
      
      Calendly.initPopupWidget(popupOptions);
      console.log('CalendlyIntegration: Popup opened');
    } catch (error) {
      console.error('CalendlyIntegration: Failed to open popup:', error);
      this.showFallback();
    }
  }

  /**
   * Embed Calendly inline in a specified container
   * @param {HTMLElement|string} containerElement - Container element or selector
   * @param {Object} options - Optional configuration for the inline widget
   */
  embedInline(containerElement, options = {}) {
    try {
      if (!this.isScriptLoaded || typeof Calendly === 'undefined') {
        console.error('CalendlyIntegration: Script not loaded, showing fallback');
        this.showFallback();
        return;
      }
      
      // Get container element
      let container = containerElement;
      if (typeof containerElement === 'string') {
        container = document.querySelector(containerElement);
      }
      
      if (!container) {
        console.error('CalendlyIntegration: Container element not found');
        return;
      }
      
      const inlineOptions = {
        url: this.calendlyUrl,
        parentElement: container,
        ...options
      };
      
      Calendly.initInlineWidget(inlineOptions);
      console.log('CalendlyIntegration: Inline widget embedded');
    } catch (error) {
      console.error('CalendlyIntegration: Failed to embed inline:', error);
      this.showFallback();
    }
  }

  /**
   * Register callback for successful booking events
   * @param {Function} callback - Callback function to execute on successful booking
   */
  onEventScheduled(callback) {
    if (typeof callback !== 'function') {
      console.error('CalendlyIntegration: Callback must be a function');
      return;
    }
    
    this.eventListeners.push(callback);
  }

  /**
   * Set up event listener for Calendly events
   * Listens for successful booking events and triggers registered callbacks
   */
  setupEventListener() {
    const messageHandler = (e) => {
      // Check if message is from Calendly
      if (!e.origin || !e.origin.includes('calendly.com')) {
        return;
      }
      
      // Parse event data
      if (e.data && e.data.event) {
        const eventName = e.data.event;
        
        // Handle successful booking
        if (eventName === 'calendly.event_scheduled') {
          console.log('CalendlyIntegration: Event scheduled:', e.data);
          
          // Trigger all registered callbacks
          this.eventListeners.forEach(callback => {
            try {
              callback(e.data);
            } catch (error) {
              console.error('CalendlyIntegration: Error in event callback:', error);
            }
          });
        }
      }
    };
    
    // Add event listener
    window.addEventListener('message', messageHandler);
    console.log('CalendlyIntegration: Event listener set up');
  }

  /**
   * Display fallback contact information when Calendly fails
   * Shows alternative booking methods to ensure users can still contact the business
   */
  showFallback() {
    // Create fallback modal
    const fallbackHtml = `
      <div class="calendly-fallback-overlay" style="
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
      ">
        <div class="calendly-fallback-content" style="
          background: white;
          padding: 32px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="
            margin: 0 0 16px 0;
            font-size: 24px;
            color: #163b63;
          ">Unable to Load Booking System</h2>
          
          <p style="
            margin: 0 0 24px 0;
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
          ">
            We're having trouble loading our booking system. 
            Please contact us directly to schedule your Claim Readiness Review:
          </p>
          
          <div style="
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
          ">
            <p style="
              margin: 0 0 12px 0;
              font-size: 16px;
              color: #163b63;
              font-weight: 600;
            ">Contact Information:</p>
            
            <p style="
              margin: 0 0 8px 0;
              font-size: 15px;
              color: #4b5563;
            ">
              📧 Email: <a href="mailto:support@militarydisabilitynexus.com" style="color: #3b82f6;">support@militarydisabilitynexus.com</a>
            </p>
            
            <p style="
              margin: 0;
              font-size: 15px;
              color: #4b5563;
            ">
              📞 Phone: <a href="tel:+1-555-0123" style="color: #3b82f6;">1-555-0123</a>
            </p>
          </div>
          
          <button class="calendly-fallback-close" style="
            width: 100%;
            padding: 12px 24px;
            background: #163b63;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    
    // Insert fallback into DOM
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = fallbackHtml;
    const overlay = tempContainer.firstElementChild;
    document.body.appendChild(overlay);
    
    // Add close button handler
    const closeButton = overlay.querySelector('.calendly-fallback-close');
    
    const closeFallback = () => {
      document.body.removeChild(overlay);
    };
    
    closeButton.addEventListener('click', closeFallback);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeFallback();
      }
    });
    
    console.log('CalendlyIntegration: Fallback displayed');
  }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendlyIntegration;
}
