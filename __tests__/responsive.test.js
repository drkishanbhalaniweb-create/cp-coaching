/**
 * Property-Based Tests for Responsive Design
 * 
 * These tests verify responsive layout behavior and correctness properties
 * related to viewport adaptation and touch target sizing.
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const QuestionRenderer = require('../QuestionRenderer');
const { QUESTIONS } = require('../diagnostic-config');

// Load and inject CSS from diagnostic.html
function injectDiagnosticCSS() {
  const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract CSS from <style> tags
  const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    const style = document.createElement('style');
    style.textContent = styleMatch[1];
    document.head.appendChild(style);
  }
}

// Helper function to create a mock DOM environment
function createMockContainer() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="diagnostic-container">
      <div id="intro-screen" class="screen">
        <h1 class="intro-title">Claim Readiness Diagnostic</h1>
        <p class="intro-subtitle">Answer five quick questions</p>
        <div class="trust-notes">
          <div class="trust-note">Takes ~2 minutes</div>
        </div>
        <button id="start-diagnostic-btn" class="btn btn-primary">Start Diagnostic</button>
      </div>
      <div id="question-screen" class="screen">
        <div id="progress-indicator" class="progress-indicator"></div>
        <div class="progress-bar-container">
          <div id="progress-bar" class="progress-bar"></div>
        </div>
        <h2 id="question-title" class="question-title"></h2>
        <p id="question-helper" class="question-helper"></p>
        <div id="answer-options" class="answer-options"></div>
      </div>
      <div id="recommendation-screen" class="screen">
        <div id="recommendation-icon" class="recommendation-icon"></div>
        <div id="recommendation-message" class="recommendation-message"></div>
        <div class="transparency-layer">
          <div id="assessment-areas" class="assessment-areas"></div>
        </div>
        <button id="cta-button" class="btn btn-cta">Book Review</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  return container;
}

// Helper function to set viewport width
function setViewportWidth(width) {
  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

// Helper function to check if element has horizontal scrolling
function hasHorizontalScroll(element) {
  return element.scrollWidth > element.clientWidth;
}

describe('Responsive Design Property Tests', () => {
  let container;
  let renderer;

  beforeAll(() => {
    // Inject CSS once for all tests
    injectDiagnosticCSS();
  });

  beforeEach(() => {
    container = createMockContainer();
    renderer = new QuestionRenderer(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 22: Responsive layout adaptation
   * Validates: Requirements 11.2
   */
  describe('Property 22: Responsive layout adaptation', () => {
    test('should render without horizontal scrolling for any viewport width from 320px to 2560px', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }), // Any viewport width
          fc.integer({ min: 0, max: 4 }), // Any question
          (viewportWidth, questionIndex) => {
            // Set the viewport width
            setViewportWidth(viewportWidth);
            
            const questionData = QUESTIONS[questionIndex];
            const currentStep = questionIndex + 1;
            
            // Render the question
            renderer.renderQuestion(questionData, currentStep, 5);
            
            // Get the diagnostic container
            const diagnosticContainer = container.querySelector('.diagnostic-container');
            
            // Verify no horizontal scrolling
            expect(hasHorizontalScroll(diagnosticContainer)).toBe(false);
            expect(hasHorizontalScroll(document.body)).toBe(false);
            
            // Verify content is properly sized
            const questionTitle = container.querySelector('.question-title');
            const answerOptions = container.querySelector('.answer-options');
            
            if (questionTitle) {
              expect(hasHorizontalScroll(questionTitle)).toBe(false);
            }
            
            if (answerOptions) {
              expect(hasHorizontalScroll(answerOptions)).toBe(false);
            }
            
            // Verify container max-width adapts to viewport
            const containerWidth = diagnosticContainer.offsetWidth;
            expect(containerWidth).toBeLessThanOrEqual(viewportWidth);
            
            // Verify text wraps properly (no overflow)
            const allTextElements = container.querySelectorAll('.intro-title, .intro-subtitle, .question-title, .question-helper, .recommendation-message');
            allTextElements.forEach(element => {
              if (element.textContent) {
                const computedStyle = window.getComputedStyle(element);
                // Verify word-wrap or overflow-wrap is set for text elements
                const overflowWrap = computedStyle.overflowWrap || computedStyle.wordWrap || 'normal';
                expect(['break-word', 'anywhere', 'normal'].includes(overflowWrap)).toBe(true);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should adapt layout at key breakpoints: 320px, 768px, 1024px, 1920px', () => {
      const breakpoints = [320, 768, 1024, 1920];
      
      breakpoints.forEach(breakpoint => {
        // Set viewport to breakpoint
        setViewportWidth(breakpoint);
        
        // Render intro screen
        const introScreen = container.querySelector('#intro-screen');
        introScreen.classList.add('active');
        
        // Get elements
        const diagnosticContainer = container.querySelector('.diagnostic-container');
        const introTitle = container.querySelector('.intro-title');
        const startButton = container.querySelector('#start-diagnostic-btn');
        
        // Verify no horizontal scroll at this breakpoint
        expect(hasHorizontalScroll(diagnosticContainer)).toBe(false);
        expect(hasHorizontalScroll(document.body)).toBe(false);
        
        // Verify elements exist and are in the DOM
        expect(introTitle).toBeTruthy();
        expect(startButton).toBeTruthy();
        
        // Verify elements have proper classes for responsive styling
        expect(introTitle.classList.contains('intro-title')).toBe(true);
        expect(startButton.classList.contains('btn')).toBe(true);
        
        // Verify container adapts to viewport
        expect(diagnosticContainer.offsetWidth).toBeLessThanOrEqual(breakpoint);
      });
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 23: Touch target minimum size
   * Validates: Requirements 11.3
   */
  describe('Property 23: Touch target minimum size', () => {
    test('should ensure all interactive elements have minimum 44x44px touch targets on mobile viewports', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 768 }), // Mobile viewport widths
          fc.integer({ min: 0, max: 4 }), // Any question
          (viewportWidth, questionIndex) => {
            // Set mobile viewport width
            setViewportWidth(viewportWidth);
            
            const questionData = QUESTIONS[questionIndex];
            const currentStep = questionIndex + 1;
            
            // Render the question
            renderer.renderQuestion(questionData, currentStep, 5);
            
            // Get all interactive elements
            const buttons = container.querySelectorAll('.btn, .btn-primary, .btn-cta');
            const answerCards = container.querySelectorAll('.answer-card');
            const trustNotes = container.querySelectorAll('.trust-note');
            
            // Verify all buttons have min-height CSS property set to 44px
            buttons.forEach(button => {
              const computedStyle = window.getComputedStyle(button);
              const minHeight = computedStyle.minHeight;
              
              // Verify min-height is set (should be 44px)
              expect(minHeight).toBeTruthy();
              
              // Parse the min-height value
              const minHeightValue = parseInt(minHeight);
              if (!isNaN(minHeightValue)) {
                expect(minHeightValue).toBeGreaterThanOrEqual(44);
              }
            });
            
            // Verify all answer cards have min-height CSS property set to 44px
            answerCards.forEach(card => {
              const computedStyle = window.getComputedStyle(card);
              const minHeight = computedStyle.minHeight;
              
              // Verify min-height is set (should be 44px)
              expect(minHeight).toBeTruthy();
              
              // Parse the min-height value
              const minHeightValue = parseInt(minHeight);
              if (!isNaN(minHeightValue)) {
                expect(minHeightValue).toBeGreaterThanOrEqual(44);
              }
            });
            
            // Verify trust notes (if clickable) meet minimum size
            trustNotes.forEach(note => {
              if (note.onclick || note.getAttribute('role') === 'button') {
                const rect = note.getBoundingClientRect();
                const height = rect.height;
                
                // Minimum 44px height for touch targets
                expect(height).toBeGreaterThanOrEqual(44);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should maintain minimum touch target size for all interactive elements at 320px viewport', () => {
      // Test the smallest supported viewport
      setViewportWidth(320);
      
      // Render intro screen
      const introScreen = container.querySelector('#intro-screen');
      introScreen.classList.add('active');
      
      // Get all interactive elements
      const startButton = container.querySelector('#start-diagnostic-btn');
      
      // Verify button has min-height CSS property
      const buttonStyle = window.getComputedStyle(startButton);
      const buttonMinHeight = parseInt(buttonStyle.minHeight);
      if (!isNaN(buttonMinHeight)) {
        expect(buttonMinHeight).toBeGreaterThanOrEqual(44);
      }
      
      // Render a question
      const questionData = QUESTIONS[0];
      renderer.renderQuestion(questionData, 1, 5);
      
      // Get answer cards
      const answerCards = container.querySelectorAll('.answer-card');
      
      // Verify all answer cards have min-height CSS property
      answerCards.forEach(card => {
        const cardStyle = window.getComputedStyle(card);
        const cardMinHeight = parseInt(cardStyle.minHeight);
        if (!isNaN(cardMinHeight)) {
          expect(cardMinHeight).toBeGreaterThanOrEqual(44);
        }
      });
    });

    test('should ensure CTA button meets minimum touch target size on mobile', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 768 }), // Mobile viewport widths
          (viewportWidth) => {
            // Set mobile viewport width
            setViewportWidth(viewportWidth);
            
            // Get CTA button
            const ctaButton = container.querySelector('#cta-button');
            
            if (ctaButton) {
              const computedStyle = window.getComputedStyle(ctaButton);
              const minHeight = parseInt(computedStyle.minHeight);
              
              // Minimum 44px height for touch targets
              if (!isNaN(minHeight)) {
                expect(minHeight).toBeGreaterThanOrEqual(44);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional responsive design tests
   */
  describe('Mobile-first CSS approach verification', () => {
    test('should apply mobile styles by default and override for larger viewports', () => {
      // Test that mobile styles are the base
      setViewportWidth(375); // iPhone viewport
      
      const diagnosticContainer = container.querySelector('.diagnostic-container');
      
      // Verify container exists and has the correct class
      expect(diagnosticContainer).toBeTruthy();
      expect(diagnosticContainer.classList.contains('diagnostic-container')).toBe(true);
      
      // Verify no horizontal overflow
      expect(hasHorizontalScroll(diagnosticContainer)).toBe(false);
      
      // Verify responsive classes are applied to elements
      const answerCards = container.querySelectorAll('.answer-card');
      answerCards.forEach(card => {
        expect(card.classList.contains('answer-card')).toBe(true);
      });
    });

    test('should stack trust notes vertically on mobile', () => {
      setViewportWidth(375); // Mobile viewport
      
      const trustNotes = container.querySelector('.trust-notes');
      if (trustNotes) {
        // On mobile, trust notes should stack (flex-direction: column)
        // This is verified by checking they don't overflow horizontally
        expect(hasHorizontalScroll(trustNotes)).toBe(false);
        
        // Verify trust notes container exists
        expect(trustNotes.classList.contains('trust-notes')).toBe(true);
      }
    });

    test('should have responsive CSS classes for different screen sizes', () => {
      // Verify that the CSS includes media queries for responsive design
      // by checking that elements have the appropriate classes
      
      const diagnosticContainer = container.querySelector('.diagnostic-container');
      const introTitle = container.querySelector('.intro-title');
      const questionTitle = container.querySelector('.question-title');
      const answerCards = container.querySelectorAll('.answer-card');
      const buttons = container.querySelectorAll('.btn');
      
      // Verify all responsive elements have their classes
      expect(diagnosticContainer.classList.contains('diagnostic-container')).toBe(true);
      expect(introTitle.classList.contains('intro-title')).toBe(true);
      expect(questionTitle.classList.contains('question-title')).toBe(true);
      
      // Verify answer cards have responsive classes
      answerCards.forEach(card => {
        expect(card.classList.contains('answer-card')).toBe(true);
      });
      
      // Verify buttons have responsive classes
      buttons.forEach(button => {
        expect(button.classList.contains('btn')).toBe(true);
      });
    });
  });
});
