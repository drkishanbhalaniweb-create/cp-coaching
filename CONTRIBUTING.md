# Contributing Guide

Thank you for your interest in contributing to the Claim Readiness Diagnostic project. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on what is best for the project
- Show empathy towards other contributors
- Accept constructive criticism gracefully
- Prioritize veteran experience and trust

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/claim-readiness-diagnostic.git
   cd claim-readiness-diagnostic
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/claim-readiness-diagnostic.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your test credentials
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the feature branch
2. Write or update tests
3. Run tests locally
4. Update documentation if needed
5. Commit your changes

### Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your branch
git checkout feature/your-feature-name
git merge upstream/main

# Resolve conflicts if any
# Then push to your fork
git push origin feature/your-feature-name
```

## Coding Standards

### JavaScript Style Guide

**General Principles**:
- Use vanilla JavaScript (ES6+)
- No frameworks or libraries unless necessary
- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic

**Naming Conventions**:
```javascript
// Classes: PascalCase
class DiagnosticController {}

// Functions: camelCase
function calculateScore() {}

// Constants: UPPER_SNAKE_CASE
const MAX_SCORE = 10;

// Variables: camelCase
let currentState = 'intro';
```

**Code Structure**:
```javascript
// Good: Clear, focused function
function getPointsForAnswer(questionId, answerText) {
  const question = QUESTIONS.find(q => q.id === questionId);
  const option = question.options.find(o => o.text === answerText);
  return option.points;
}

// Bad: Unclear, doing too much
function doStuff(q, a) {
  let x = QUESTIONS.find(y => y.id === q);
  return x.options.find(z => z.text === a).points;
}
```

**Error Handling**:
```javascript
// Always handle errors gracefully
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  // Don't block user experience
  return fallbackValue;
}
```

### CSS Style Guide

**Use CSS Custom Properties**:
```css
/* Good: Use custom properties */
.button {
  background-color: var(--blue-accent);
  border-radius: var(--radius-md);
}

/* Bad: Hardcoded values */
.button {
  background-color: #3b82f6;
  border-radius: 12px;
}
```

**Mobile-First Approach**:
```css
/* Good: Mobile first, then larger screens */
.container {
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

**Accessibility**:
```css
/* Always provide focus indicators */
.button:focus {
  outline: 2px solid var(--blue-accent);
  outline-offset: 2px;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### HTML Style Guide

**Semantic HTML**:
```html
<!-- Good: Semantic elements -->
<main>
  <section aria-labelledby="intro-heading">
    <h1 id="intro-heading">Claim Readiness Diagnostic</h1>
    <button type="button" aria-label="Start diagnostic">Start</button>
  </section>
</main>

<!-- Bad: Non-semantic divs -->
<div>
  <div>
    <div>Claim Readiness Diagnostic</div>
    <div onclick="start()">Start</div>
  </div>
</div>
```

**Accessibility Attributes**:
```html
<!-- Always include ARIA labels -->
<button 
  type="button"
  aria-label="Select answer: Yes"
  role="button"
  tabindex="0">
  Yes
</button>
```

## Testing Guidelines

### Unit Tests

**Location**: `__tests__/ComponentName.test.js`

**Structure**:
```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

**Best Practices**:
- Test one thing per test
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Don't use mocks unless necessary
- Test edge cases

### Property-Based Tests

**Location**: `__tests__/ComponentName.test.js`

**Structure**:
```javascript
/**
 * Feature: claim-readiness-diagnostic, Property 9: Total score is sum of answer points
 * Validates: Requirements 5.4
 */
describe('Property: Total score calculation', () => {
  test('should equal sum of all answer points for any answer combination', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          service_connection: fc.integer({ min: 0, max: 2 }),
          denial_handling: fc.integer({ min: 0, max: 2 }),
          pathway: fc.integer({ min: 0, max: 2 }),
          severity: fc.integer({ min: 0, max: 2 }),
          secondaries: fc.integer({ min: 0, max: 2 })
        }),
        (answers) => {
          const engine = new ScoringEngine();
          const totalScore = engine.calculateTotalScore(answers);
          const expectedSum = Object.values(answers).reduce((a, b) => a + b, 0);
          
          expect(totalScore).toBe(expectedSum);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Best Practices**:
- Run minimum 100 iterations
- Tag with property number and requirement
- Use smart generators that constrain input space
- Test universal properties, not specific examples

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ScoringEngine.test.js

# Run tests in watch mode
npm run test:watch

# Run property-based tests
npm run test:pbt

# Run with coverage
npm test -- --coverage
```

### Test Coverage

Aim for:
- 80%+ line coverage
- 80%+ branch coverage
- 100% coverage of critical paths

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(scoring): add validation for score range

Add validation to ensure calculated scores are between 0 and 10.
Throws error if score is outside valid range.

Closes #123

---

fix(calendly): handle script load failure gracefully

Add error handling for Calendly script load failures.
Display fallback contact information when script fails.

Fixes #456

---

docs(api): update log-diagnostic endpoint documentation

Add examples for error responses and update request schema.
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Capitalize first letter of subject
- Don't end subject with period

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Check code style**
   ```bash
   npm run lint
   ```

4. **Update documentation**
   - Update README if needed
   - Update API docs if endpoints changed
   - Update CHANGELOG.md

### Submitting Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create pull request on GitHub**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Add screenshots if UI changes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Property tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass
   
   ## Related Issues
   Closes #123
   ```

### Review Process

1. Maintainer reviews code
2. Automated tests run
3. Feedback provided if needed
4. You address feedback
5. Maintainer approves and merges

### After Merge

1. Delete your feature branch
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your local main
   ```bash
   git checkout main
   git pull upstream main
   ```

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Adding configuration options
- Changing API endpoints

### Documentation Files

- `README.md`: Project overview and quick start
- `docs/API.md`: API endpoint documentation
- `docs/CONFIGURATION.md`: Configuration options
- `docs/DATA_SCHEMA.md`: Data structure documentation
- `docs/DEPLOYMENT.md`: Deployment instructions
- `CHANGELOG.md`: Version history
- `CONTRIBUTING.md`: This file

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep formatting consistent
- Update table of contents if needed

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Open a new issue with "Question:" prefix
- Email: support@militarydisabilitynexus.com

## Thank You!

Your contributions help veterans assess their claim readiness and make informed decisions. Thank you for being part of this mission.
