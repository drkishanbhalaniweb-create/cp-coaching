/**
 * Integration Tests for Complete Diagnostic Flow
 * 
 * Tests the complete flow from intro through all questions to recommendation,
 * including transparency layer display and data logging.
 * 
 * Requirements: 1.1, 2.1, 2.5, 6.1, 6.2, 6.3, 6.4, 7.1, 9.1
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Load the HTML template
const html = fs.readFileSync(path.resolve(__dirname, '../diagnostic.html'), 'utf8');

// Load components
const DiagnosticController = require('../DiagnosticController.js');
const QuestionRenderer = require('../QuestionRenderer.js');
const CalendlyIntegration = require('../CalendlyIntegration.js');
const DataLogger = require('../DataLogger.js');
const { QUESTIONS, RECOMMENDATIONS } = require('../diagnostic-config.js');
const { DiagnosticApp } = require('../diagnostic-main.js');

describe('Diagnostic Integration Tests', () => {
  let dom;
  let document;
  let window;
  let container;
  let controller;
  let renderer;
  let calendly;
  let logger;

  beforeEach(() => {
    // Create a new JSDOM instance for each test
    dom = new JSDOM(html, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Make global objects available
    global.document = document;
    global.window = window;
    global.localStorage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      },
      removeItem(key) {
        delete this.data[key];
      },
      clear() {
        this.data = {};
      }
    };
    
    // Get container
    container = document.querySelector('.diagnostic-container');
    
    // Initialize components
    controller = new DiagnosticController();
    renderer = new QuestionRenderer(container);
    calendly = new CalendlyIntegration('https://calendly.com/test/appointment');
    logger = new DataLogger();
  });

  afterEach(() => {
    // Clean up
    global.document = undefined;
    global.window = undefined;
    global.localStorage = undefined;
    dom.window.close();
  });

  describe('Complete Diagnostic Flow', () => {
    test('should complete full flow from intro to recommendation', () => {
      // Verify intro screen is displayed initially
      const introScreen = container.querySelector('#intro-screen');
      expect(introScreen.classList.contains('active')).toBe(true);
      
      // Start the diagnostic
      controller.start();
      expect(controller.getCurrentState()).toBe('question_1');
      
      // Answer all 5 questions
      const testAnswers = [
        { questionId: 'service_connection', answerText: 'No', points: 2 },
        { questionId: 'denial_handling', answerText: 'Partially', points: 1 },
        { questionId: 'pathway', answerText: 'Not sure', points: 2 },
        { questionId: 'severity', answerText: 'Somewhat', points: 1 },
        { questionId: 'secondaries', answerText: 'No', points: 2 }
      ];
      
      testAnswers.forEach((answer, index) => {
        // Record answer
        controller.recordAnswer(answer.questionId, answer.answerText, answer.points);
        
        // Verify answer was recorded
        const answers = controller.getAnswers();
        expect(answers[answer.questionId]).toBeDefined();
        expect(answers[answer.questionId].points).toBe(answer.points);
        
        // Advance to next question (or recommendation if last question)
        if (index < testAnswers.length - 1) {
          controller.nextQuestion();
          expect(controller.getCurrentState()).toBe(`question_${index + 2}`);
        }
      });
      
      // Show recommendation
      controller.showRecommendation();
      expect(controller.getCurrentState()).toBe('recommendation');
      
      // Verify score calculation
      const score = controller.getScore();
      expect(score).toBe(8); // 2 + 1 + 2 + 1 + 2 = 8
      
      // Verify recommendation
      const recommendation = controller.getRecommendation();
      expect(recommendation).toBeDefined();
      expect(recommendation.category).toBe('REVIEW_STRONGLY_RECOMMENDED');
      expect(recommendation.score).toBe(8);
    });

    test('should render all question screens correctly', () => {
      // Start diagnostic
      controller.start();
      
      // Render each question
      QUESTIONS.forEach((question, index) => {
        const questionNumber = index + 1;
        
        // Render question
        renderer.renderQuestion(question, questionNumber, 5);
        
        // Verify question screen is active
        const questionScreen = container.querySelector('#question-screen');
        expect(questionScreen.classList.contains('active')).toBe(true);
        
        // Verify progress indicator
        const progressIndicator = container.querySelector('#progress-indicator');
        expect(progressIndicator.textContent).toBe(`Step ${questionNumber} of 5`);
        
        // Verify progress bar (uses transform: scaleX for performance)
        const progressBar = container.querySelector('#progress-bar');
        const expectedPercentage = (questionNumber / 5) * 100;
        const expectedScale = expectedPercentage / 100;
        expect(progressBar.style.transform).toBe(`scaleX(${expectedScale})`);
        
        // Verify question title
        const questionTitle = container.querySelector('#question-title');
        expect(questionTitle.textContent).toBe(question.title);
        
        // Verify question helper
        const questionHelper = container.querySelector('#question-helper');
        expect(questionHelper.textContent).toBe(question.helper);
        
        // Verify answer options
        const answerOptions = container.querySelectorAll('.answer-card');
        expect(answerOptions.length).toBe(3);
        
        // Verify each answer option
        question.options.forEach((option, optionIndex) => {
          expect(answerOptions[optionIndex].textContent).toBe(option.text);
          expect(answerOptions[optionIndex].dataset.points).toBe(option.points.toString());
        });
      });
    });

    test('should display correct recommendation based on score', () => {
      // Test different score scenarios
      const scenarios = [
        { score: 0, expectedCategory: 'FULLY_READY' },
        { score: 1, expectedCategory: 'OPTIONAL_CONFIRMATION' },
        { score: 2, expectedCategory: 'OPTIONAL_CONFIRMATION' },
        { score: 3, expectedCategory: 'REVIEW_BENEFICIAL' },
        { score: 6, expectedCategory: 'REVIEW_BENEFICIAL' },
        { score: 7, expectedCategory: 'REVIEW_STRONGLY_RECOMMENDED' },
        { score: 10, expectedCategory: 'REVIEW_STRONGLY_RECOMMENDED' }
      ];
      
      scenarios.forEach(scenario => {
        // Create a new controller for each scenario
        const testController = new DiagnosticController();
        
        // Manually set answers to achieve desired score
        const pointsPerQuestion = Math.floor(scenario.score / 5);
        const remainder = scenario.score % 5;
        
        QUESTIONS.forEach((question, index) => {
          const points = index < remainder ? pointsPerQuestion + 1 : pointsPerQuestion;
          testController.recordAnswer(question.id, 'Test', points);
        });
        
        // Calculate score and get recommendation
        testController.showRecommendation();
        const recommendation = testController.getRecommendation();
        
        // Verify recommendation category
        expect(recommendation.category).toBe(scenario.expectedCategory);
        expect(recommendation.score).toBe(scenario.score);
      });
    });
  });

  describe('Transparency Layer', () => {
    test('should display transparency layer with correct status indicators', () => {
      // Create test answers with different point values
      const testAnswers = {
        service_connection: { answerText: 'Yes', points: 0 },
        denial_handling: { answerText: 'Partially', points: 1 },
        pathway: { answerText: 'Not sure', points: 2 },
        severity: { answerText: 'Yes', points: 0 },
        secondaries: { answerText: 'Somewhat', points: 1 }
      };
      
      // Record answers in controller
      Object.entries(testAnswers).forEach(([questionId, answerData]) => {
        controller.recordAnswer(questionId, answerData.answerText, answerData.points);
      });
      
      // Render transparency layer
      renderer.renderTransparency(controller.getAnswers());
      
      // Verify transparency layer is rendered
      const assessmentAreas = container.querySelectorAll('.assessment-area');
      expect(assessmentAreas.length).toBe(5);
      
      // Verify status indicators
      const expectedStatuses = [
        { icon: '✅', label: 'Adequate' },      // 0 points
        { icon: '⚠️', label: 'Needs attention' }, // 1 point
        { icon: '❌', label: 'Missing' },        // 2 points
        { icon: '✅', label: 'Adequate' },      // 0 points
        { icon: '⚠️', label: 'Needs attention' }  // 1 point
      ];
      
      assessmentAreas.forEach((area, index) => {
        const icon = area.querySelector('.assessment-icon');
        const status = area.querySelector('.assessment-status');
        
        expect(icon.textContent).toBe(expectedStatuses[index].icon);
        expect(status.textContent).toBe(expectedStatuses[index].label);
      });
    });

    test('should display all assessment areas in transparency layer', () => {
      // Create answers for all questions
      QUESTIONS.forEach(question => {
        controller.recordAnswer(question.id, 'Test', 1);
      });
      
      // Render transparency layer
      renderer.renderTransparency(controller.getAnswers());
      
      // Verify all assessment areas are displayed
      const assessmentAreas = container.querySelectorAll('.assessment-area');
      expect(assessmentAreas.length).toBe(5);
      
      // Verify assessment area labels
      const expectedLabels = [
        'Service connection clarity',
        'Denial handling',
        'Pathway selection',
        'Severity documentation',
        'Missing secondaries'
      ];
      
      assessmentAreas.forEach((area, index) => {
        const label = area.querySelector('.assessment-label');
        expect(label.textContent).toBe(expectedLabels[index]);
      });
    });
  });

  describe('Data Logging', () => {
    test('should save diagnostic data to localStorage', () => {
      // Answer all questions
      QUESTIONS.forEach((question, index) => {
        controller.recordAnswer(question.id, 'Test', index % 3);
      });
      
      // Calculate score and recommendation
      controller.showRecommendation();
      
      // Save to localStorage
      controller.saveToLocalStorage();
      
      // Verify data was saved
      const savedData = JSON.parse(global.localStorage.getItem('diagnostic_session'));
      expect(savedData).toBeDefined();
      expect(savedData.sessionId).toBeDefined();
      expect(savedData.score).toBeDefined();
      expect(savedData.recommendation).toBeDefined();
      expect(Object.keys(savedData.answers).length).toBe(5);
    });

    test('should format diagnostic payload correctly', () => {
      // Create test data
      const testAnswers = {
        service_connection: { answerText: 'No', points: 2 },
        denial_handling: { answerText: 'Yes', points: 0 },
        pathway: { answerText: 'Somewhat', points: 1 },
        severity: { answerText: 'No', points: 2 },
        secondaries: { answerText: 'Yes', points: 0 }
      };
      
      const testScore = 5;
      const testRecommendation = 'REVIEW_BENEFICIAL';
      
      // Format payload
      const payload = logger.formatPayload(testAnswers, testScore, testRecommendation);
      
      // Verify payload structure
      expect(payload).toBeDefined();
      expect(payload.timestamp).toBeDefined();
      expect(payload.answers).toBeDefined();
      expect(payload.score).toBe(testScore);
      expect(payload.recommendation).toBe(testRecommendation);
      
      // Verify answers are formatted correctly (just points, not full objects)
      expect(payload.answers.service_connection).toBe(2);
      expect(payload.answers.denial_handling).toBe(0);
      expect(payload.answers.pathway).toBe(1);
      expect(payload.answers.severity).toBe(2);
      expect(payload.answers.secondaries).toBe(0);
    });

    test('should load diagnostic data from localStorage', () => {
      // Create and save a diagnostic session
      const testController = new DiagnosticController();
      
      // Answer questions
      QUESTIONS.forEach((question, index) => {
        testController.recordAnswer(question.id, 'Test', index % 3);
      });
      
      // Calculate score and recommendation
      testController.showRecommendation();
      
      // Save to localStorage
      testController.saveToLocalStorage();
      
      // Create a new controller and load the data
      const newController = new DiagnosticController();
      const loadedData = newController.loadFromLocalStorage();
      
      // Verify loaded data
      expect(loadedData).toBeDefined();
      expect(loadedData.sessionId).toBeDefined();
      expect(loadedData.score).toBeDefined();
      expect(loadedData.recommendation).toBeDefined();
      expect(Object.keys(loadedData.answers).length).toBe(5);
    });
  });

  describe('Event Handlers', () => {
    test('should trigger answer selection callback', () => {
      const mockCallback = jest.fn();
      renderer.onAnswerSelected(mockCallback);
      
      // Render a question
      renderer.renderQuestion(QUESTIONS[0], 1, 5);
      
      // Get first answer card
      const answerCard = container.querySelector('.answer-card');
      
      // Simulate click
      answerCard.click();
      
      // Verify callback was called
      expect(mockCallback).toHaveBeenCalledWith(
        'service_connection',
        'No',
        2
      );
    });

    test('should trigger start button callback', () => {
      const mockCallback = jest.fn();
      renderer.onStartClicked(mockCallback);
      
      // Render intro
      renderer.renderIntro();
      
      // Get start button
      const startButton = container.querySelector('#start-diagnostic-btn');
      
      // Simulate click
      startButton.click();
      
      // Verify callback was called
      expect(mockCallback).toHaveBeenCalled();
    });

    test('should trigger booking button callback', () => {
      const mockCallback = jest.fn();
      renderer.onBookingClicked(mockCallback);
      
      // Create a recommendation
      const recommendation = {
        category: 'REVIEW_BENEFICIAL',
        score: 5,
        message: 'Test message',
        color: '#f59e0b',
        icon: '⚠️',
        ctaText: 'Book Claim Readiness Review',
        ctaOptional: false
      };
      
      // Render recommendation
      renderer.renderRecommendation(recommendation);
      
      // Get CTA button
      const ctaButton = container.querySelector('#cta-button');
      
      // Simulate click
      ctaButton.click();
      
      // Verify callback was called
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    test('should transition through all states correctly', () => {
      // Start at intro
      expect(controller.getCurrentState()).toBe('intro');
      
      // Start diagnostic
      controller.start();
      expect(controller.getCurrentState()).toBe('question_1');
      
      // Answer Q1 and advance
      controller.recordAnswer('service_connection', 'Yes', 0);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe('question_2');
      
      // Answer Q2 and advance
      controller.recordAnswer('denial_handling', 'Yes', 0);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe('question_3');
      
      // Answer Q3 and advance
      controller.recordAnswer('pathway', 'Yes', 0);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe('question_4');
      
      // Answer Q4 and advance
      controller.recordAnswer('severity', 'Yes', 0);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe('question_5');
      
      // Answer Q5 and show recommendation
      controller.recordAnswer('secondaries', 'Yes', 0);
      controller.nextQuestion();
      expect(controller.getCurrentState()).toBe('recommendation');
    });

    test('should not allow invalid state transitions', () => {
      // Try to advance from intro without starting
      expect(() => {
        controller.nextQuestion();
      }).toThrow();
      
      // Try to set invalid state
      expect(() => {
        controller.setState('invalid_state');
      }).toThrow();
    });
  });

  describe('Auto-advance on Answer Selection', () => {
    test('should auto-advance after answer selection', (done) => {
      // Start diagnostic
      controller.start();
      expect(controller.getCurrentState()).toBe('question_1');
      
      // Record answer
      controller.recordAnswer('service_connection', 'Yes', 0);
      
      // Simulate auto-advance with delay
      setTimeout(() => {
        controller.nextQuestion();
        expect(controller.getCurrentState()).toBe('question_2');
        done();
      }, 400);
    });
  });
});
