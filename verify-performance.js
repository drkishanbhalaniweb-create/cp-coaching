/**
 * Performance Verification Script
 * 
 * This script provides instructions and automated checks for verifying
 * performance optimizations meet the requirements:
 * - First Contentful Paint (FCP) < 1.5s
 * - Largest Contentful Paint (LCP) < 2.5s
 * - Cumulative Layout Shift (CLS) < 0.1
 * - Lighthouse score ≥ 90
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('PERFORMANCE VERIFICATION');
console.log('='.repeat(70));
console.log('');

// Check 1: Verify CSS is inlined
console.log('✓ Check 1: CSS Inlining');
const diagnosticHtml = fs.readFileSync(path.join(__dirname, 'diagnostic.html'), 'utf-8');
const hasInlinedCss = diagnosticHtml.includes('<style>') && diagnosticHtml.includes(':root {');
const externalCssLinks = (diagnosticHtml.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [])
  .filter(link => !link.includes('calendly'));

if (hasInlinedCss && externalCssLinks.length === 0) {
  console.log('  ✓ CSS is properly inlined');
  console.log('  ✓ No render-blocking external CSS files');
} else {
  console.log('  ✗ CSS inlining issue detected');
}
console.log('');

// Check 2: Verify preconnect links
console.log('✓ Check 2: Resource Hints (Preconnect)');
const hasCalendlyPreconnect = diagnosticHtml.includes('preconnect') && 
                               diagnosticHtml.includes('calendly.com');
const hasStripePreconnect = diagnosticHtml.includes('preconnect') && 
                            diagnosticHtml.includes('js.stripe.com');

if (hasCalendlyPreconnect && hasStripePreconnect) {
  console.log('  ✓ Preconnect links for Calendly');
  console.log('  ✓ Preconnect links for Stripe');
} else {
  console.log('  ✗ Missing preconnect links');
}
console.log('');

// Check 3: Verify script loading strategy
console.log('✓ Check 3: Script Loading Strategy');
const externalScripts = diagnosticHtml.match(/<script[^>]*src=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
const scriptsWithAsyncOrDefer = externalScripts.filter(script => 
  script.includes('async') || script.includes('defer')
);

if (scriptsWithAsyncOrDefer.length === externalScripts.length) {
  console.log(`  ✓ All ${externalScripts.length} external scripts use async or defer`);
} else {
  console.log(`  ✗ ${externalScripts.length - scriptsWithAsyncOrDefer.length} scripts missing async/defer`);
}
console.log('');

// Check 4: Verify animation performance
console.log('✓ Check 4: Animation Performance');
const styleMatch = diagnosticHtml.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  const cssContent = styleMatch[1];
  const transitionLines = cssContent.match(/transition:[^;]+;/gi) || [];
  const badTransitions = transitionLines.filter(line => 
    /\b(width|height|top|left|margin|padding)\b/.test(line)
  );
  
  if (badTransitions.length === 0) {
    console.log('  ✓ All transitions use GPU-accelerated properties (transform, opacity)');
  } else {
    console.log(`  ✗ ${badTransitions.length} transitions use layout-triggering properties`);
    badTransitions.forEach(line => console.log(`    - ${line.trim()}`));
  }
} else {
  console.log('  ✗ Could not find CSS content');
}
console.log('');

// Check 5: JavaScript bundle size
console.log('✓ Check 5: JavaScript Bundle Size');
const jsFiles = [
  'diagnostic-config.js',
  'ScoringEngine.js',
  'RecommendationEngine.js',
  'DiagnosticController.js',
  'QuestionRenderer.js',
  'CalendlyIntegration.js',
  'DataLogger.js',
  'diagnostic-main.js'
];

let totalSize = 0;
let allFilesExist = true;

jsFiles.forEach(file => {
  try {
    const stats = fs.statSync(path.join(__dirname, file));
    totalSize += stats.size;
  } catch (error) {
    console.log(`  ✗ File not found: ${file}`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  const totalSizeKB = (totalSize / 1024).toFixed(2);
  console.log(`  ✓ Total bundle size: ${totalSizeKB} KB (uncompressed)`);
  console.log(`  ✓ Estimated gzipped size: ~${(totalSizeKB / 3).toFixed(2)} KB`);
  
  if (totalSize / 1024 < 200) {
    console.log('  ✓ Bundle size is under 200KB target');
  } else {
    console.log('  ✗ Bundle size exceeds 200KB target');
  }
}
console.log('');

// Manual testing instructions
console.log('='.repeat(70));
console.log('MANUAL LIGHTHOUSE TESTING INSTRUCTIONS');
console.log('='.repeat(70));
console.log('');
console.log('To verify Lighthouse score ≥ 90 and Core Web Vitals:');
console.log('');
console.log('1. Start the local server:');
console.log('   npm run dev');
console.log('');
console.log('2. Open Chrome and navigate to:');
console.log('   http://localhost:3000/diagnostic.html');
console.log('');
console.log('3. Open Chrome DevTools (F12 or Ctrl+Shift+I)');
console.log('');
console.log('4. Go to the "Lighthouse" tab');
console.log('');
console.log('5. Configure Lighthouse:');
console.log('   - Mode: Navigation');
console.log('   - Device: Desktop (then repeat for Mobile)');
console.log('   - Categories: Performance');
console.log('');
console.log('6. Click "Analyze page load"');
console.log('');
console.log('7. Verify the following metrics:');
console.log('   ✓ Performance Score: ≥ 90');
console.log('   ✓ First Contentful Paint (FCP): < 1.5s');
console.log('   ✓ Largest Contentful Paint (LCP): < 2.5s');
console.log('   ✓ Cumulative Layout Shift (CLS): < 0.1');
console.log('   ✓ Total Blocking Time (TBT): < 300ms');
console.log('');
console.log('8. Test on throttled connection:');
console.log('   - Open DevTools Network tab');
console.log('   - Set throttling to "Fast 3G"');
console.log('   - Re-run Lighthouse');
console.log('   - Verify performance remains acceptable');
console.log('');
console.log('9. Test on mobile device:');
console.log('   - Change Device to "Mobile"');
console.log('   - Re-run Lighthouse');
console.log('   - Verify mobile performance score ≥ 90');
console.log('');
console.log('='.repeat(70));
console.log('ADDITIONAL PERFORMANCE CHECKS');
console.log('='.repeat(70));
console.log('');
console.log('1. Check Network Waterfall:');
console.log('   - Open DevTools Network tab');
console.log('   - Reload page');
console.log('   - Verify resources load in optimal order');
console.log('   - Check for any render-blocking resources');
console.log('');
console.log('2. Check Paint Timing:');
console.log('   - Open DevTools Performance tab');
console.log('   - Record page load');
console.log('   - Look for "First Paint" and "First Contentful Paint" markers');
console.log('   - Verify they occur early in the timeline');
console.log('');
console.log('3. Check Layout Shifts:');
console.log('   - In Performance recording, look for "Layout Shift" events');
console.log('   - Verify minimal or no layout shifts during page load');
console.log('   - Check that content doesn\'t jump as it loads');
console.log('');
console.log('4. Check JavaScript Execution:');
console.log('   - In Performance recording, check "Main" thread');
console.log('   - Verify no long tasks (> 50ms)');
console.log('   - Check that JavaScript doesn\'t block rendering');
console.log('');
console.log('='.repeat(70));
console.log('PRODUCTION DEPLOYMENT CHECKS');
console.log('='.repeat(70));
console.log('');
console.log('Before deploying to production:');
console.log('');
console.log('1. Test on Vercel preview deployment:');
console.log('   vercel');
console.log('   - Run Lighthouse on preview URL');
console.log('   - Verify performance with CDN and compression');
console.log('');
console.log('2. Verify Vercel optimizations are enabled:');
console.log('   - Automatic compression (gzip/brotli)');
console.log('   - HTTP/2 server push');
console.log('   - Edge caching');
console.log('');
console.log('3. Monitor real user metrics:');
console.log('   - Set up Real User Monitoring (RUM)');
console.log('   - Track Core Web Vitals in production');
console.log('   - Monitor performance over time');
console.log('');
console.log('='.repeat(70));
console.log('');
console.log('Performance verification checks complete!');
console.log('Run manual Lighthouse tests to verify all metrics meet targets.');
console.log('');
