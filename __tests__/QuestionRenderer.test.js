/**
 * Property-Based and Unit Tests for QuestionRenderer
 * 
 * These tests verify UI rendering correctness using both property-based testing
 * and traditional unit tests.
 */

const fc = require('fast-check');
const QuestionRenderer = require('../QuestionRenderer');
const { QUESTIONS, ASSESSMENT_AREAS, STATUS_INDICATORS } = require('../diagnostic-config');

// Helper function to create a mock DOM environment
function createMockContainer() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div id="intro-screen" class="screen">
      <button id="start-diagnostic-btn">Start Diagnostic</button>
    </div>
    <div id="question-screen" class="screen">
      <div id="progress-indicator"></div>
      <div class="progress-bar-container">
        <div id="progress-bar"></div>
      </div>
      <h2 id="question-title"></h2>
      <p id="question-helper"></p>
      <div id="answer-options"></div>
    </div>
    <div id="recommendation-screen" class="screen">
      <div id="recommendation-icon"></div>
      <div id="recommendation-message"></div>
      <div id="assessment-areas"></div>
      <button id="cta-button"></button>
    </div>
  `;
  return container;
}

describe('QuestionRenderer', () => {
  let container;
  let renderer;

  beforeEach(() => {
    container = createMockContainer();
    renderer = new QuestionRenderer(container);
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 1: One question per screen
   * Validates: Requirements 2.1
   */
  describe('Property 1: One question per screen', () => {
    test('should display exactly one question with its answer options, and no other questions visible', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...QUESTIONS),
          fc.integer({ min: 1, max: 5 }),
          (questionData, currentStep) => {
            // Render the question
            renderer.renderQuestion(questionData, currentStep, 5);

            // Verify only one question screen is active
            const activeScreens = container.querySelectorAll('.screen.active');
            expect(activeScreens.length).toBe(1);
            expect(activeScreens[0].id).toBe('question-screen');

            // Verify the question title is displayed
            const questionTitle = container.querySelector('#question-title');
            expect(questionTitle.textContent).toBe(questionData.title);

            // Verify exactly the options for THIS question are displayed
            const answerCards = container.querySelectorAll('.answer-card');
            expect(answerCards.length).toBe(questionData.options.length);

            // Verify each answer card corresponds to this question's options
            answerCards.forEach((card, index) => {
              expect(card.textContent).toBe(questionData.options[index].text);
              expect(card.dataset.questionId).toBe(questionData.id);
            });

            // Verify no other question content is visible
            const otherQuestions = QUESTIONS.filter(q => q.id !== questionData.id);
            otherQuestions.forEach(otherQ => {
              // The title should not contain other question titles
              expect(questionTitle.textContent).not.toBe(otherQ.title);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 2: Progress indicator accuracy
   * Validates: Requirements 2.3
   */
  describe('Property 2: Progress indicator accuracy', () => {
    test('should display "Step X of 5" where X matches the current question number', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (questionNumber) => {
            // Get the question for this number
            const questionData = QUESTIONS.find(q => q.number === questionNumber);

            // Render the question
            renderer.renderQuestion(questionData, questionNumber, 5);

            // Verify progress indicator shows correct step
            const progressIndicator = container.querySelector('#progress-indicator');
            expect(progressIndicator.textContent).toBe(`Step ${questionNumber} of 5`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 3: Progress bar percentage accuracy
   * Validates: Requirements 2.4
   */
  describe('Property 3: Progress bar percentage accuracy', () => {
    test('should display completion percentage equal to (question number / 5) * 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (questionNumber) => {
            // Get the question for this number
            const questionData = QUESTIONS.find(q => q.number === questionNumber);

            // Render the question
            renderer.renderQuestion(questionData, questionNumber, 5);

            // Calculate expected percentage and scale
            const expectedPercentage = (questionNumber / 5) * 100;
            const expectedScale = questionNumber / 5;

            // Verify progress bar uses transform: scaleX for better performance (no reflow)
            const progressBar = container.querySelector('#progress-bar');
            expect(progressBar.style.transform).toBe(`scaleX(${expectedScale})`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 5: Three answer options per question
   * Validates: Requirements 4.1
   */
  describe('Property 5: Three answer options per question', () => {
    test('should provide exactly three selectable answer cards for any question', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...QUESTIONS),
          fc.integer({ min: 1, max: 5 }),
          (questionData, currentStep) => {
            // Render the question
            renderer.renderQuestion(questionData, currentStep, 5);

            // Verify exactly three answer cards are rendered
            const answerCards = container.querySelectorAll('.answer-card');
            expect(answerCards.length).toBe(3);

            // Verify all cards are selectable (have proper attributes)
            answerCards.forEach(card => {
              expect(card.getAttribute('role')).toBe('button');
              expect(card.getAttribute('tabindex')).toBe('0');
              expect(card.hasAttribute('aria-label')).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 13: Transparency display for adequate answers
   * Validates: Requirements 7.3
   */
  describe('Property 13: Transparency display for adequate answers', () => {
    test('should display "✅ Adequate" for any answer that scored 0 points', () => {
      fc.assert(
        fc.property(
          fc.record({
            service_connection: fc.constantFrom(0, 1, 2),
            denial_handling: fc.constantFrom(0, 1, 2),
            pathway: fc.constantFrom(0, 1, 2),
            severity: fc.constantFrom(0, 1, 2),
            secondaries: fc.constantFrom(0, 1, 2)
          }),
          (answerPoints) => {
            // Create answers data with the generated points
            const answersData = {};
            Object.keys(answerPoints).forEach(questionId => {
              answersData[questionId] = {
                answerText: 'test',
                points: answerPoints[questionId]
              };
            });

            // Render transparency layer
            renderer.renderTransparency(answersData);

            // Get all assessment areas
            const assessmentAreas = container.querySelectorAll('.assessment-area');

            // For each answer with 0 points, verify it shows "✅ Adequate"
            Object.entries(answerPoints).forEach(([questionId, points], index) => {
              if (points === 0) {
                const area = assessmentAreas[index];
                const icon = area.querySelector('.assessment-icon');
                const status = area.querySelector('.assessment-status');

                expect(icon.textContent).toBe('✅');
                expect(status.textContent).toBe('Adequate');
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 14: Transparency display for needs attention
   * Validates: Requirements 7.4
   */
  describe('Property 14: Transparency display for needs attention', () => {
    test('should display "⚠️ Needs attention" for any answer that scored 1 point', () => {
      fc.assert(
        fc.property(
          fc.record({
            service_connection: fc.constantFrom(0, 1, 2),
            denial_handling: fc.constantFrom(0, 1, 2),
            pathway: fc.constantFrom(0, 1, 2),
            severity: fc.constantFrom(0, 1, 2),
            secondaries: fc.constantFrom(0, 1, 2)
          }),
          (answerPoints) => {
            // Create answers data with the generated points
            const answersData = {};
            Object.keys(answerPoints).forEach(questionId => {
              answersData[questionId] = {
                answerText: 'test',
                points: answerPoints[questionId]
              };
            });

            // Render transparency layer
            renderer.renderTransparency(answersData);

            // Get all assessment areas
            const assessmentAreas = container.querySelectorAll('.assessment-area');

            // For each answer with 1 point, verify it shows "⚠️ Needs attention"
            Object.entries(answerPoints).forEach(([questionId, points], index) => {
              if (points === 1) {
                const area = assessmentAreas[index];
                const icon = area.querySelector('.assessment-icon');
                const status = area.querySelector('.assessment-status');

                expect(icon.textContent).toBe('⚠️');
                expect(status.textContent).toBe('Needs attention');
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: claim-readiness-diagnostic, Property 15: Transparency display for missing
   * Validates: Requirements 7.5
   */
  describe('Property 15: Transparency display for missing', () => {
    test('should display "❌ Missing" for any answer that scored 2 points', () => {
      fc.assert(
        fc.property(
          fc.record({
            service_connection: fc.constantFrom(0, 1, 2),
            denial_handling: fc.constantFrom(0, 1, 2),
            pathway: fc.constantFrom(0, 1, 2),
            severity: fc.constantFrom(0, 1, 2),
            secondaries: fc.constantFrom(0, 1, 2)
          }),
          (answerPoints) => {
            // Create answers data with the generated points
            const answersData = {};
            Object.keys(answerPoints).forEach(questionId => {
              answersData[questionId] = {
                answerText: 'test',
                points: answerPoints[questionId]
              };
            });

            // Render transparency layer
            renderer.renderTransparency(answersData);

            // Get all assessment areas
            const assessmentAreas = container.querySelectorAll('.assessment-area');

            // For each answer with 2 points, verify it shows "❌ Missing"
            Object.entries(answerPoints).forEach(([questionId, points], index) => {
              if (points === 2) {
                const area = assessmentAreas[index];
                const icon = area.querySelector('.assessment-icon');
                const status = area.querySelector('.assessment-status');

                expect(icon.textContent).toBe('❌');
                expect(status.textContent).toBe('Missing');
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for specific functionality
  describe('Unit Tests', () => {
    describe('renderIntro', () => {
      test('should display intro screen with correct content', () => {
        renderer.renderIntro();

        const introScreen = container.querySelector('#intro-screen');
        expect(introScreen.classList.contains('active')).toBe(true);

        const startButton = container.querySelector('#start-diagnostic-btn');
        expect(startButton).toBeTruthy();
        expect(startButton.textContent).toBe('Start Diagnostic');
      });

      test('should hide other screens when showing intro', () => {
        // First show question screen
        const questionScreen = container.querySelector('#question-screen');
        questionScreen.classList.add('active');

        // Then render intro
        renderer.renderIntro();

        expect(questionScreen.classList.contains('active')).toBe(false);
        expect(container.querySelector('#intro-screen').classList.contains('active')).toBe(true);
      });
    });

    describe('renderQuestion', () => {
      test('should render Question 1 with correct text and options', () => {
        const q1 = QUESTIONS[0];
        renderer.renderQuestion(q1, 1, 5);

        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe('Service connection clearly documented?');

        const questionHelper = container.querySelector('#question-helper');
        expect(questionHelper.textContent).toContain('Medical records');

        const answerCards = container.querySelectorAll('.answer-card');
        expect(answerCards.length).toBe(3);
        expect(answerCards[0].textContent).toBe('No');
        expect(answerCards[1].textContent).toBe('Somewhat');
        expect(answerCards[2].textContent).toBe('Yes');
      });

      test('should render Question 2 with correct text and options', () => {
        const q2 = QUESTIONS[1];
        renderer.renderQuestion(q2, 2, 5);

        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe('Prior VA denial reasons addressed?');

        const answerCards = container.querySelectorAll('.answer-card');
        expect(answerCards.length).toBe(3);
        expect(answerCards[0].textContent).toBe('No');
        expect(answerCards[1].textContent).toBe('Partially');
        expect(answerCards[2].textContent).toBe('Yes');
      });

      test('should render Question 3 with correct text and options', () => {
        const q3 = QUESTIONS[2];
        renderer.renderQuestion(q3, 3, 5);

        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe('Correct claim pathway selected?');

        const answerCards = container.querySelectorAll('.answer-card');
        expect(answerCards.length).toBe(3);
        expect(answerCards[0].textContent).toBe('Not sure');
        expect(answerCards[1].textContent).toBe('Somewhat');
        expect(answerCards[2].textContent).toBe('Yes');
      });

      test('should render Question 4 with correct text and options', () => {
        const q4 = QUESTIONS[3];
        renderer.renderQuestion(q4, 4, 5);

        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe('Medical severity & impact documented?');

        const answerCards = container.querySelectorAll('.answer-card');
        expect(answerCards.length).toBe(3);
      });

      test('should render Question 5 with correct text and options', () => {
        const q5 = QUESTIONS[4];
        renderer.renderQuestion(q5, 5, 5);

        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe('All conditions & secondaries identified?');

        const answerCards = container.querySelectorAll('.answer-card');
        expect(answerCards.length).toBe(3);
      });

      test('should throw error for invalid step', () => {
        const q1 = QUESTIONS[0];
        expect(() => {
          renderer.renderQuestion(q1, 0, 5);
        }).toThrow('Invalid step');

        expect(() => {
          renderer.renderQuestion(q1, 6, 5);
        }).toThrow('Invalid step');
      });
    });

    describe('renderRecommendation', () => {
      test('should render FULLY_READY recommendation with correct styling', () => {
        const recommendationData = {
          category: 'FULLY_READY',
          score: 0,
          message: 'Your claim is FULLY READY. No Claim Readiness Review is needed',
          color: '#10b981',
          icon: '✅',
          ctaText: 'Book review for peace of mind',
          ctaOptional: true
        };

        renderer.renderRecommendation(recommendationData);

        const icon = container.querySelector('#recommendation-icon');
        expect(icon.textContent).toBe('✅');

        const message = container.querySelector('#recommendation-message');
        expect(message.textContent).toBe('Your claim is FULLY READY. No Claim Readiness Review is needed');
        expect(message.style.color).toBe('rgb(16, 185, 129)'); // #10b981 in RGB

        const ctaButton = container.querySelector('#cta-button');
        expect(ctaButton.textContent).toBe('Book review for peace of mind');
      });

      test('should render REVIEW_BENEFICIAL recommendation with correct styling', () => {
        const recommendationData = {
          category: 'REVIEW_BENEFICIAL',
          score: 5,
          message: 'Your claim would BENEFIT from a Claim Readiness Review before filing',
          color: '#f59e0b',
          icon: '⚠️',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const icon = container.querySelector('#recommendation-icon');
        expect(icon.textContent).toBe('⚠️');

        const message = container.querySelector('#recommendation-message');
        expect(message.textContent).toContain('BENEFIT');
      });

      test('should render REVIEW_STRONGLY_RECOMMENDED recommendation with correct styling', () => {
        const recommendationData = {
          category: 'REVIEW_STRONGLY_RECOMMENDED',
          score: 8,
          message: 'Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED',
          color: '#dc2626',
          icon: '❌',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const icon = container.querySelector('#recommendation-icon');
        expect(icon.textContent).toBe('❌');

        const message = container.querySelector('#recommendation-message');
        expect(message.textContent).toContain('NOT READY');
      });
    });

    describe('renderTransparency', () => {
      test('should render transparency layer with correct assessment breakdown', () => {
        const answersData = {
          service_connection: { answerText: 'Yes', points: 0 },
          denial_handling: { answerText: 'Partially', points: 1 },
          pathway: { answerText: 'No', points: 2 },
          severity: { answerText: 'Yes', points: 0 },
          secondaries: { answerText: 'Somewhat', points: 1 }
        };

        renderer.renderTransparency(answersData);

        const assessmentAreas = container.querySelectorAll('.assessment-area');
        expect(assessmentAreas.length).toBe(5);

        // Check first area (0 points = Adequate)
        const area1 = assessmentAreas[0];
        expect(area1.querySelector('.assessment-icon').textContent).toBe('✅');
        expect(area1.querySelector('.assessment-status').textContent).toBe('Adequate');

        // Check second area (1 point = Needs attention)
        const area2 = assessmentAreas[1];
        expect(area2.querySelector('.assessment-icon').textContent).toBe('⚠️');
        expect(area2.querySelector('.assessment-status').textContent).toBe('Needs attention');

        // Check third area (2 points = Missing)
        const area3 = assessmentAreas[2];
        expect(area3.querySelector('.assessment-icon').textContent).toBe('❌');
        expect(area3.querySelector('.assessment-status').textContent).toBe('Missing');
      });
    });

    describe('CTA button rendering', () => {
      test('should render correct CTA text for FULLY_READY recommendation', () => {
        const recommendationData = {
          category: 'FULLY_READY',
          score: 0,
          message: 'Your claim is FULLY READY. No Claim Readiness Review is needed',
          color: '#10b981',
          icon: '✅',
          ctaText: 'Book review for peace of mind',
          ctaOptional: true
        };

        renderer.renderRecommendation(recommendationData);

        const ctaButton = container.querySelector('#cta-button');
        expect(ctaButton.textContent).toBe('Book review for peace of mind');
      });

      test('should render correct CTA text for OPTIONAL_CONFIRMATION recommendation', () => {
        const recommendationData = {
          category: 'OPTIONAL_CONFIRMATION',
          score: 1,
          message: 'Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation',
          color: '#3b82f6',
          icon: '✓',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const ctaButton = container.querySelector('#cta-button');
        expect(ctaButton.textContent).toBe('Book Claim Readiness Review');
      });

      test('should render correct CTA text for REVIEW_BENEFICIAL recommendation', () => {
        const recommendationData = {
          category: 'REVIEW_BENEFICIAL',
          score: 5,
          message: 'Your claim would BENEFIT from a Claim Readiness Review before filing',
          color: '#f59e0b',
          icon: '⚠️',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const ctaButton = container.querySelector('#cta-button');
        expect(ctaButton.textContent).toBe('Book Claim Readiness Review');
      });

      test('should render correct CTA text for REVIEW_STRONGLY_RECOMMENDED recommendation', () => {
        const recommendationData = {
          category: 'REVIEW_STRONGLY_RECOMMENDED',
          score: 8,
          message: 'Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED',
          color: '#dc2626',
          icon: '❌',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const ctaButton = container.querySelector('#cta-button');
        expect(ctaButton.textContent).toBe('Book Claim Readiness Review');
      });

      test('should call onBookingClicked callback when CTA button is clicked', () => {
        const callback = jest.fn();
        renderer.onBookingClicked(callback);

        const recommendationData = {
          category: 'REVIEW_BENEFICIAL',
          score: 5,
          message: 'Your claim would BENEFIT from a Claim Readiness Review before filing',
          color: '#f59e0b',
          icon: '⚠️',
          ctaText: 'Book Claim Readiness Review',
          ctaOptional: false
        };

        renderer.renderRecommendation(recommendationData);

        const ctaButton = container.querySelector('#cta-button');
        ctaButton.click();

        expect(callback).toHaveBeenCalled();
      });
    });

    describe('Event handlers', () => {
      test('should call onAnswerSelected callback when answer is clicked', () => {
        const callback = jest.fn();
        renderer.onAnswerSelected(callback);

        const q1 = QUESTIONS[0];
        renderer.renderQuestion(q1, 1, 5);

        const answerCard = container.querySelector('.answer-card');
        answerCard.click();

        expect(callback).toHaveBeenCalledWith('service_connection', 'No', 2);
      });

      test('should call onStartClicked callback when start button is clicked', () => {
        const callback = jest.fn();
        renderer.onStartClicked(callback);

        renderer.renderIntro();

        const startButton = container.querySelector('#start-diagnostic-btn');
        startButton.click();

        expect(callback).toHaveBeenCalled();
      });

      test('should throw error if callback is not a function', () => {
        expect(() => {
          renderer.onAnswerSelected('not a function');
        }).toThrow('Callback must be a function');

        expect(() => {
          renderer.onStartClicked(null);
        }).toThrow('Callback must be a function');
      });
    });

    describe('Constructor validation', () => {
      test('should throw error if container element is not provided', () => {
        expect(() => {
          new QuestionRenderer(null);
        }).toThrow('Container element is required');
      });
    });
  });
});
