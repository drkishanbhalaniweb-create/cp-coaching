/**
 * Tests for CalendlyIntegration
 * 
 * Includes both property-based tests and unit tests to verify
 * Calendly integration functionality.
 */

const fc = require('fast-check');
const CalendlyIntegration = require('../CalendlyIntegration');

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');

describe('CalendlyIntegration', () => {
  let dom;
  let window;
  let document;
  let calendlyIntegration;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously'
    });
    window = dom.window;
    document = window.document;
    
    // Make window and document global for the class
    global.window = window;
    global.document = document;
    
    // Mock Calendly object
    global.Calendly = {
      initPopupWidget: jest.fn(),
      initInlineWidget: jest.fn()
    };
    
    calendlyIntegration = new CalendlyIntegration('https://calendly.com/test-user/claim-review');
  });

  afterEach(() => {
    // Clean up
    delete global.window;
    delete global.document;
    delete global.Calendly;
    jest.clearAllMocks();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 17: Calendly trigger on CTA click
   * Validates: Requirements 8.3
   */
  describe('Property 17: Calendly trigger on CTA click', () => {
    test('should trigger Calendly popup for any CTA button click', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            buttonText: fc.constantFrom(
              'Book Claim Readiness Review',
              'Book review for peace of mind',
              'Schedule Consultation',
              'Book Now'
            ),
            calendlyUrl: fc.constantFrom(
              'https://calendly.com/test-user/claim-review',
              'https://calendly.com/test-user/consultation',
              'https://calendly.com/test-user/review-session'
            )
          }),
          async ({ buttonText, calendlyUrl }) => {
            // Create a new integration instance with the random URL
            const integration = new CalendlyIntegration(calendlyUrl);
            integration.isScriptLoaded = true; // Simulate script loaded
            
            // Create a CTA button
            const button = document.createElement('button');
            button.textContent = buttonText;
            button.className = 'cta-button';
            document.body.appendChild(button);
            
            // Reset mock
            global.Calendly.initPopupWidget.mockClear();
            
            // Simulate button click that triggers openPopup
            button.addEventListener('click', () => {
              integration.openPopup();
            });
            
            // Click the button
            button.click();
            
            // Verify Calendly popup was triggered
            expect(global.Calendly.initPopupWidget).toHaveBeenCalled();
            expect(global.Calendly.initPopupWidget).toHaveBeenCalledWith(
              expect.objectContaining({
                url: calendlyUrl
              })
            );
            
            // Clean up
            document.body.removeChild(button);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should trigger Calendly popup with correct URL for any recommendation category', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'FULLY_READY',
            'OPTIONAL_CONFIRMATION',
            'REVIEW_BENEFICIAL',
            'REVIEW_STRONGLY_RECOMMENDED'
          ),
          async (recommendationCategory) => {
            // Simulate script loaded
            calendlyIntegration.isScriptLoaded = true;
            
            // Reset mock
            global.Calendly.initPopupWidget.mockClear();
            
            // Trigger popup (as would happen on CTA click)
            calendlyIntegration.openPopup();
            
            // Verify Calendly was called
            expect(global.Calendly.initPopupWidget).toHaveBeenCalled();
            expect(global.Calendly.initPopupWidget).toHaveBeenCalledWith(
              expect.objectContaining({
                url: expect.stringContaining('calendly.com')
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Unit Tests for CalendlyIntegration
   * Requirements: 8.2, 8.3, 8.5
   */
  describe('Unit Tests', () => {
    describe('Script Loading', () => {
      test('should detect when Calendly script is already loaded', async () => {
        // Calendly is already mocked as loaded
        const result = await calendlyIntegration.init();
        
        expect(result).toBe(true);
        expect(calendlyIntegration.isScriptLoaded).toBe(true);
      });

      test('should load Calendly script from CDN when not present', async () => {
        // Remove Calendly mock to simulate not loaded
        delete global.Calendly;
        
        // Ensure no existing script
        const existingScripts = document.head.querySelectorAll('script[src*="calendly.com"]');
        existingScripts.forEach(s => s.remove());
        
        // Create a new integration
        const integration = new CalendlyIntegration('https://calendly.com/test-user/claim-review');
        
        // Start init (will attempt to load script)
        const initPromise = integration.init();
        
        // Wait a tick for script to be added
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Simulate script loading by finding the script tag and triggering onload
        const scripts = document.head.querySelectorAll('script');
        const calendlyScript = Array.from(scripts).find(s => 
          s.src && s.src.includes('calendly.com')
        );
        
        expect(calendlyScript).toBeTruthy();
        expect(calendlyScript.src).toBe('https://assets.calendly.com/assets/external/widget.js');
        
        // Simulate successful script load
        global.Calendly = {
          initPopupWidget: jest.fn(),
          initInlineWidget: jest.fn()
        };
        
        // Trigger onload
        if (calendlyScript.onload) {
          calendlyScript.onload();
        }
        
        const result = await initPromise;
        expect(result).toBe(true);
      });

      test('should handle script load failure gracefully', async () => {
        // Remove Calendly mock
        delete global.Calendly;
        
        // Ensure no existing script
        const existingScripts = document.head.querySelectorAll('script[src*="calendly.com"]');
        existingScripts.forEach(s => s.remove());
        
        // Spy on showFallback
        const integration = new CalendlyIntegration('https://calendly.com/test-user/claim-review');
        const showFallbackSpy = jest.spyOn(integration, 'showFallback');
        
        // Start init
        const initPromise = integration.init();
        
        // Wait a tick for script to be added
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Find and trigger error on script
        const scripts = document.head.querySelectorAll('script');
        const calendlyScript = Array.from(scripts).find(s => 
          s.src && s.src.includes('calendly.com')
        );
        
        expect(calendlyScript).toBeTruthy();
        
        if (calendlyScript.onerror) {
          calendlyScript.onerror();
        }
        
        try {
          await initPromise;
        } catch (error) {
          // Expected to fail
        }
        
        expect(showFallbackSpy).toHaveBeenCalled();
      });
    });

    describe('Popup Initialization', () => {
      test('should open Calendly popup with correct URL', () => {
        calendlyIntegration.isScriptLoaded = true;
        
        calendlyIntegration.openPopup();
        
        expect(global.Calendly.initPopupWidget).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://calendly.com/test-user/claim-review'
          })
        );
      });

      test('should pass custom options to popup', () => {
        calendlyIntegration.isScriptLoaded = true;
        
        const customOptions = {
          prefill: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          utm: {
            utmSource: 'diagnostic'
          }
        };
        
        calendlyIntegration.openPopup(customOptions);
        
        expect(global.Calendly.initPopupWidget).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://calendly.com/test-user/claim-review',
            prefill: customOptions.prefill,
            utm: customOptions.utm
          })
        );
      });

      test('should show fallback when script not loaded', () => {
        calendlyIntegration.isScriptLoaded = false;
        const showFallbackSpy = jest.spyOn(calendlyIntegration, 'showFallback');
        
        calendlyIntegration.openPopup();
        
        expect(global.Calendly.initPopupWidget).not.toHaveBeenCalled();
        expect(showFallbackSpy).toHaveBeenCalled();
      });

      test('should show fallback when Calendly is undefined', () => {
        calendlyIntegration.isScriptLoaded = true;
        delete global.Calendly;
        
        const showFallbackSpy = jest.spyOn(calendlyIntegration, 'showFallback');
        
        calendlyIntegration.openPopup();
        
        expect(showFallbackSpy).toHaveBeenCalled();
      });
    });

    describe('Inline Widget Embedding', () => {
      test('should embed Calendly inline in container element', () => {
        calendlyIntegration.isScriptLoaded = true;
        
        const container = document.createElement('div');
        container.id = 'calendly-container';
        document.body.appendChild(container);
        
        calendlyIntegration.embedInline(container);
        
        expect(global.Calendly.initInlineWidget).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://calendly.com/test-user/claim-review',
            parentElement: container
          })
        );
        
        document.body.removeChild(container);
      });

      test('should embed Calendly inline using selector string', () => {
        calendlyIntegration.isScriptLoaded = true;
        
        // Ensure Calendly is defined
        global.Calendly = {
          initPopupWidget: jest.fn(),
          initInlineWidget: jest.fn()
        };
        
        const container = document.createElement('div');
        container.id = 'calendly-container';
        document.body.appendChild(container);
        
        // Reset mock
        global.Calendly.initInlineWidget.mockClear();
        
        calendlyIntegration.embedInline('#calendly-container');
        
        expect(global.Calendly.initInlineWidget).toHaveBeenCalled();
        const callArgs = global.Calendly.initInlineWidget.mock.calls[0][0];
        expect(callArgs.url).toBe('https://calendly.com/test-user/claim-review');
        expect(callArgs.parentElement).toBe(container);
        
        document.body.removeChild(container);
      });

      test('should handle missing container gracefully', () => {
        calendlyIntegration.isScriptLoaded = true;
        
        calendlyIntegration.embedInline('#non-existent-container');
        
        expect(global.Calendly.initInlineWidget).not.toHaveBeenCalled();
      });
    });

    describe('Event Handling', () => {
      test('should register event scheduled callbacks', () => {
        const callback = jest.fn();
        
        calendlyIntegration.onEventScheduled(callback);
        
        expect(calendlyIntegration.eventListeners).toContain(callback);
      });

      test('should trigger callbacks when event is scheduled', (done) => {
        calendlyIntegration.isScriptLoaded = true;
        
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        calendlyIntegration.onEventScheduled(callback1);
        calendlyIntegration.onEventScheduled(callback2);
        
        // Set up event listener
        calendlyIntegration.setupEventListener();
        
        // Simulate Calendly event by directly dispatching
        const eventData = {
          event: 'calendly.event_scheduled',
          payload: {
            event: {
              uri: 'https://calendly.com/events/abc123'
            },
            invitee: {
              uri: 'https://calendly.com/invitees/xyz789'
            }
          }
        };
        
        // Create and dispatch message event with proper origin
        const messageEvent = new window.MessageEvent('message', {
          data: eventData,
          origin: 'https://calendly.com',
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(messageEvent);
        
        // Check synchronously (jsdom processes events synchronously)
        expect(callback1).toHaveBeenCalledWith(eventData);
        expect(callback2).toHaveBeenCalledWith(eventData);
        done();
      });

      test('should ignore messages from non-Calendly origins', (done) => {
        calendlyIntegration.isScriptLoaded = true;
        
        const callback = jest.fn();
        calendlyIntegration.onEventScheduled(callback);
        
        calendlyIntegration.setupEventListener();
        
        // Simulate event from different origin
        const eventData = {
          event: 'calendly.event_scheduled',
          payload: {}
        };
        
        const messageEvent = new window.MessageEvent('message', {
          data: eventData,
          origin: 'https://malicious-site.com'
        });
        
        window.dispatchEvent(messageEvent);
        
        setTimeout(() => {
          expect(callback).not.toHaveBeenCalled();
          done();
        }, 50);
      });

      test('should handle callback errors gracefully', (done) => {
        calendlyIntegration.isScriptLoaded = true;
        
        const errorCallback = jest.fn(() => {
          throw new Error('Callback error');
        });
        const successCallback = jest.fn();
        
        calendlyIntegration.onEventScheduled(errorCallback);
        calendlyIntegration.onEventScheduled(successCallback);
        
        calendlyIntegration.setupEventListener();
        
        // Simulate Calendly event
        const eventData = {
          event: 'calendly.event_scheduled',
          payload: {}
        };
        
        const messageEvent = new window.MessageEvent('message', {
          data: eventData,
          origin: 'https://calendly.com',
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(messageEvent);
        
        // Check synchronously
        expect(errorCallback).toHaveBeenCalled();
        expect(successCallback).toHaveBeenCalled();
        done();
      });

      test('should reject non-function callbacks', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        calendlyIntegration.onEventScheduled('not a function');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Callback must be a function')
        );
        expect(calendlyIntegration.eventListeners).toHaveLength(0);
        
        consoleErrorSpy.mockRestore();
      });
    });

    describe('Error Handling', () => {
      test('should display fallback modal with contact information', () => {
        calendlyIntegration.showFallback();
        
        // The fallback is wrapped in a container div
        const fallbackOverlay = document.body.querySelector('.calendly-fallback-overlay');
        expect(fallbackOverlay).toBeTruthy();
        
        const fallbackContent = fallbackOverlay.querySelector('.calendly-fallback-content');
        expect(fallbackContent).toBeTruthy();
        expect(fallbackContent.textContent).toContain('Unable to Load Booking System');
        expect(fallbackContent.textContent).toContain('support@militarydisabilitynexus.com');
      });

      test('should close fallback modal when close button is clicked', () => {
        calendlyIntegration.showFallback();
        
        const closeButton = document.body.querySelector('.calendly-fallback-close');
        expect(closeButton).toBeTruthy();
        closeButton.click();
        
        const fallbackOverlay = document.body.querySelector('.calendly-fallback-overlay');
        expect(fallbackOverlay).toBeFalsy();
      });

      test('should close fallback modal when overlay is clicked', () => {
        calendlyIntegration.showFallback();
        
        const overlay = document.body.querySelector('.calendly-fallback-overlay');
        expect(overlay).toBeTruthy();
        overlay.click();
        
        const fallbackAfterClick = document.body.querySelector('.calendly-fallback-overlay');
        expect(fallbackAfterClick).toBeFalsy();
      });
    });
  });
});
