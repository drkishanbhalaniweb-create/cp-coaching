/**
 * Performance Tests
 * 
 * Tests for performance optimizations including:
 * - First Contentful Paint (FCP) < 1.5s
 * - Largest Contentful Paint (LCP) < 2.5s
 * - Cumulative Layout Shift (CLS) < 0.1
 * - Lighthouse score ≥ 90
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

const fs = require('fs');
const path = require('path');

describe('Performance Optimizations', () => {
  describe('CSS Inlining', () => {
    test('diagnostic.html should have inlined CSS', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Check that CSS is inlined in <style> tags
      expect(htmlContent).toMatch(/<style>/);
      expect(htmlContent).toMatch(/:root\s*{/);
      
      // Verify no external CSS files are loaded (except Calendly which is required)
      const externalCssLinks = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
      const nonCalendlyCss = externalCssLinks.filter(link => !link.includes('calendly'));
      
      expect(nonCalendlyCss.length).toBe(0);
    });
  });

  describe('JavaScript Bundle Size', () => {
    test('individual JavaScript files should be reasonably sized', () => {
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
      
      jsFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        const stats = fs.statSync(filePath);
        const sizeInKB = stats.size / 1024;
        
        // Each file should be under 50KB (uncompressed)
        expect(sizeInKB).toBeLessThan(50);
      });
    });

    test('total JavaScript bundle should be under 200KB', () => {
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
      jsFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
      
      const totalSizeInKB = totalSize / 1024;
      
      // Total bundle should be under 200KB (uncompressed)
      // After gzip, this will be much smaller
      expect(totalSizeInKB).toBeLessThan(200);
    });
  });

  describe('Resource Hints', () => {
    test('diagnostic.html should have preconnect links for external domains', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Check for preconnect to Calendly
      expect(htmlContent).toMatch(/<link[^>]*rel=["']preconnect["'][^>]*href=["']https:\/\/assets\.calendly\.com["']/i);
      expect(htmlContent).toMatch(/<link[^>]*rel=["']preconnect["'][^>]*href=["']https:\/\/calendly\.com["']/i);
      
      // Check for preconnect to Stripe
      expect(htmlContent).toMatch(/<link[^>]*rel=["']preconnect["'][^>]*href=["']https:\/\/js\.stripe\.com["']/i);
    });
  });

  describe('DOM Manipulation Efficiency', () => {
    test('QuestionRenderer should minimize reflows by batching DOM updates', () => {
      const rendererPath = path.join(__dirname, '..', 'QuestionRenderer.js');
      const rendererContent = fs.readFileSync(rendererPath, 'utf-8');
      
      // Check that innerHTML is used for batch updates (more efficient than multiple appendChild)
      expect(rendererContent).toMatch(/innerHTML\s*=/);
      
      // Verify that we're not doing excessive individual DOM manipulations
      // Count appendChild calls - should be minimal
      const appendChildMatches = rendererContent.match(/appendChild/g) || [];
      expect(appendChildMatches.length).toBeLessThan(10);
    });
  });

  describe('Animation Performance', () => {
    test('CSS animations should use transform and opacity only', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Extract CSS content
      const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
      expect(styleMatch).toBeTruthy();
      
      const cssContent = styleMatch[1];
      
      // Check that animations use GPU-accelerated properties
      expect(cssContent).toMatch(/transition:.*transform/);
      expect(cssContent).toMatch(/transition:.*opacity/);
      
      // Verify no layout-triggering properties in transitions
      // (width, height, top, left, margin, padding should not be in transitions)
      const transitionLines = cssContent.match(/transition:[^;]+;/gi) || [];
      transitionLines.forEach(line => {
        // These properties cause reflow and should not be animated
        expect(line).not.toMatch(/\b(width|height|top|left|margin|padding)\b/);
      });
    });
  });

  describe('Image Optimization', () => {
    test('images should be optimized or use appropriate formats', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Check for img tags
      const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
      
      imgTags.forEach(imgTag => {
        // Images should have width and height attributes to prevent CLS
        expect(imgTag).toMatch(/width=/i);
        expect(imgTag).toMatch(/height=/i);
        
        // Images should have alt text for accessibility
        expect(imgTag).toMatch(/alt=/i);
      });
    });
  });

  describe('Script Loading Strategy', () => {
    test('external scripts should use async or defer attributes', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Find all external script tags
      const externalScripts = htmlContent.match(/<script[^>]*src=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
      
      externalScripts.forEach(scriptTag => {
        // External scripts should have async or defer
        const hasAsync = scriptTag.includes('async');
        const hasDefer = scriptTag.includes('defer');
        
        expect(hasAsync || hasDefer).toBe(true);
      });
    });

    test('local scripts should be loaded in correct order', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Extract script tags in order
      const scriptMatches = [...htmlContent.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)];
      const localScripts = scriptMatches
        .map(match => match[1])
        .filter(src => !src.startsWith('http'));
      
      // Verify dependencies are loaded before dependents
      const configIndex = localScripts.indexOf('diagnostic-config.js');
      const mainIndex = localScripts.indexOf('diagnostic-main.js');
      
      // Config should be loaded before main
      expect(configIndex).toBeGreaterThanOrEqual(0);
      expect(mainIndex).toBeGreaterThan(configIndex);
    });
  });

  describe('Core Web Vitals Targets', () => {
    test('HTML structure should minimize Cumulative Layout Shift', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Check that containers have explicit dimensions or use CSS to prevent shifts
      const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
      expect(styleMatch).toBeTruthy();
      
      const cssContent = styleMatch[1];
      
      // Verify that containers have min-height or height set
      expect(cssContent).toMatch(/min-height:/);
      
      // Check that images and dynamic content have reserved space
      expect(cssContent).toMatch(/\.diagnostic-container/);
    });

    test('critical CSS should be inlined for fast First Contentful Paint', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Verify that CSS is in the <head> before any content
      const headEndIndex = htmlContent.indexOf('</head>');
      const styleIndex = htmlContent.indexOf('<style>');
      
      expect(styleIndex).toBeGreaterThan(0);
      expect(styleIndex).toBeLessThan(headEndIndex);
      
      // Verify critical styles are present
      expect(htmlContent).toMatch(/body\s*{[^}]*background:/);
      expect(htmlContent).toMatch(/\.diagnostic-container/);
    });
  });

  describe('Lighthouse Performance Checklist', () => {
    test('HTML should follow performance best practices', () => {
      const htmlPath = path.join(__dirname, '..', 'diagnostic.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      
      // Check for viewport meta tag
      expect(htmlContent).toMatch(/<meta[^>]*name=["']viewport["']/i);
      
      // Check for charset declaration
      expect(htmlContent).toMatch(/<meta[^>]*charset=["']UTF-8["']/i);
      
      // Check for description meta tag
      expect(htmlContent).toMatch(/<meta[^>]*name=["']description["']/i);
      
      // Verify no render-blocking resources (except inlined CSS)
      const linkTags = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
      const blockingLinks = linkTags.filter(link => 
        !link.includes('calendly') && // Calendly is external and required
        !link.includes('preconnect') && 
        !link.includes('dns-prefetch')
      );
      
      expect(blockingLinks.length).toBe(0);
    });
  });
});

/**
 * Manual Lighthouse Testing Instructions
 * 
 * To verify Lighthouse score ≥ 90:
 * 
 * 1. Start the local server:
 *    npm run dev
 * 
 * 2. Open Chrome DevTools (F12)
 * 
 * 3. Go to the Lighthouse tab
 * 
 * 4. Select:
 *    - Mode: Navigation
 *    - Device: Desktop and Mobile
 *    - Categories: Performance
 * 
 * 5. Click "Analyze page load"
 * 
 * 6. Verify scores:
 *    - Performance: ≥ 90
 *    - First Contentful Paint: < 1.5s
 *    - Largest Contentful Paint: < 2.5s
 *    - Cumulative Layout Shift: < 0.1
 * 
 * 7. Test on throttled connection:
 *    - Open DevTools Network tab
 *    - Set throttling to "Fast 3G"
 *    - Re-run Lighthouse
 * 
 * Note: These automated tests verify the implementation of performance
 * best practices. Actual performance metrics should be measured using
 * Lighthouse or real user monitoring.
 */
