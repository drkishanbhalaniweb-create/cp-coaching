/**
 * Verification script for Calendly integration
 * Checks that all required components are present in index.html
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Calendly Integration...\n');

// Read index.html
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Verification checks
const checks = [
  {
    name: 'Calendly CSS Link',
    test: () => indexContent.includes('assets.calendly.com/assets/external/widget.css'),
    required: true
  },
  {
    name: 'Calendly Script Tag',
    test: () => indexContent.includes('assets.calendly.com/assets/external/widget.js'),
    required: true
  },
  {
    name: 'Preconnect to Calendly',
    test: () => indexContent.includes('preconnect') && indexContent.includes('calendly.com'),
    required: true
  },
  {
    name: 'CalendlyHandler Class',
    test: () => indexContent.includes('class CalendlyHandler'),
    required: true
  },
  {
    name: 'CalendlyHandler.init() Method',
    test: () => indexContent.includes('init()') && indexContent.includes('CalendlyHandler'),
    required: true
  },
  {
    name: 'CalendlyHandler.openPopup() Method',
    test: () => indexContent.includes('openPopup('),
    required: true
  },
  {
    name: 'CalendlyHandler.embedInline() Method',
    test: () => indexContent.includes('embedInline('),
    required: true
  },
  {
    name: 'CalendlyHandler.onEventScheduled() Method',
    test: () => indexContent.includes('onEventScheduled('),
    required: true
  },
  {
    name: 'Event Listener Setup',
    test: () => indexContent.includes('setupEventListener()'),
    required: true
  },
  {
    name: 'PostMessage Event Handler',
    test: () => indexContent.includes('calendly.event_scheduled'),
    required: true
  },
  {
    name: 'Calendly Button (Hero)',
    test: () => indexContent.includes('id="calendly-button"'),
    required: true
  },
  {
    name: 'Calendly Button (CTA)',
    test: () => indexContent.includes('id="calendly-button-2"'),
    required: true
  },
  {
    name: 'Calendly Click Handler',
    test: () => indexContent.includes('handleCalendlyClick'),
    required: true
  },
  {
    name: 'Inline Container',
    test: () => indexContent.includes('calendly-inline-container'),
    required: true
  },
  {
    name: 'Success Message Handler',
    test: () => indexContent.includes('showSuccessMessage'),
    required: true
  },
  {
    name: 'Fallback Handler',
    test: () => indexContent.includes('showFallback'),
    required: true
  },
  {
    name: 'Calendly Initialization',
    test: () => indexContent.includes('initCalendly()'),
    required: true
  },
  {
    name: 'Script Loading Check',
    test: () => indexContent.includes('checkScriptLoaded'),
    required: true
  }
];

// Run checks
let passed = 0;
let failed = 0;

checks.forEach(check => {
  const result = check.test();
  const status = result ? '✓' : '✗';
  const color = result ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${status}${reset} ${check.name}`);
  
  if (result) {
    passed++;
  } else {
    failed++;
    if (check.required) {
      console.log(`  ⚠️  This is a required component!`);
    }
  }
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed === 0) {
  console.log('✅ All Calendly integration components are present!\n');
  console.log('Next steps:');
  console.log('1. Configure CALENDLY_LINK in .env file');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3001');
  console.log('4. Test the "📅 View Available Times" buttons\n');
  process.exit(0);
} else {
  console.log('❌ Some components are missing. Please review the implementation.\n');
  process.exit(1);
}
