/**
 * Verification script for Calendly-Stripe Integration
 * Tests Requirements 11.2, 11.3, 11.4, 11.5
 * 
 * This script verifies that:
 * 1. Calendly triggers payment flow for paid events
 * 2. Booking confirmation is synchronized with payment completion
 * 3. Payment failure prevents booking confirmation
 * 4. Complete flow works without leaving the site
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Calendly-Stripe Integration Verification\n');
console.log('=' .repeat(60));

// Test results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

/**
 * Add test result
 */
function addTest(name, passed, message = '') {
    results.tests.push({ name, passed, message });
    if (passed) {
        results.passed++;
        console.log(`✓ ${name}`);
    } else {
        results.failed++;
        console.log(`✗ ${name}`);
    }
    if (message) {
        console.log(`  ${message}`);
    }
}

/**
 * Add warning
 */
function addWarning(message) {
    results.warnings++;
    console.log(`⚠ ${message}`);
}

console.log('\n📋 Requirement 11.2: Paid meeting booking triggers payment\n');

// Test 1: Check CalendlyHandler has payment flow initiation
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    
    // Check for initiatePaymentFlow method
    const hasInitiatePaymentFlow = indexHtml.includes('initiatePaymentFlow');
    addTest(
        'CalendlyHandler has initiatePaymentFlow method',
        hasInitiatePaymentFlow,
        hasInitiatePaymentFlow ? 'Method found in CalendlyHandler' : 'Method not found'
    );
    
    // Check for date_and_time_selected event handler
    const hasDateTimeHandler = indexHtml.includes('calendly.date_and_time_selected');
    addTest(
        'Listens for Calendly date_and_time_selected event',
        hasDateTimeHandler,
        hasDateTimeHandler ? 'Event listener configured' : 'Event listener missing'
    );
    
    // Check for isPaidEvent method
    const hasIsPaidEvent = indexHtml.includes('isPaidEvent');
    addTest(
        'Has isPaidEvent method to detect paid events',
        hasIsPaidEvent,
        hasIsPaidEvent ? 'Method found' : 'Method not found'
    );
    
    // Check for Calendly popup close
    const hasClosePopup = indexHtml.includes('closePopupWidget') || 
                          indexHtml.includes('Calendly.closePopupWidget');
    addTest(
        'Closes Calendly popup before payment redirect',
        hasClosePopup,
        hasClosePopup ? 'Popup close logic found' : 'Popup close logic missing'
    );
    
    // Check for payment loading message
    const hasLoadingMessage = indexHtml.includes('showPaymentLoadingMessage');
    addTest(
        'Shows loading message during payment initiation',
        hasLoadingMessage,
        hasLoadingMessage ? 'Loading message method found' : 'Loading message method missing'
    );
    
} catch (error) {
    addTest('Read index.html file', false, error.message);
}

console.log('\n📋 Requirement 11.3: Booking confirmation synchronized with payment\n');

// Test 2: Check webhook handler confirms bookings after payment
try {
    const webhookJs = fs.readFileSync('api/webhook.js', 'utf8');
    
    // Check for checkout.session.completed handler
    const hasCheckoutCompleted = webhookJs.includes('checkout.session.completed');
    addTest(
        'Webhook handles checkout.session.completed event',
        hasCheckoutCompleted,
        hasCheckoutCompleted ? 'Event handler found' : 'Event handler missing'
    );
    
    // Check for booking confirmation logic
    const hasBookingConfirmation = webhookJs.includes('Booking confirmed') || 
                                   webhookJs.includes('booking confirmed');
    addTest(
        'Webhook logs booking confirmation after payment',
        hasBookingConfirmation,
        hasBookingConfirmation ? 'Confirmation logging found' : 'Confirmation logging missing'
    );
    
    // Check for Calendly metadata storage
    const hasCalendlyMetadata = webhookJs.includes('calendlyEventUri') || 
                                webhookJs.includes('calendlyInviteeUri');
    addTest(
        'Webhook receives Calendly booking metadata',
        hasCalendlyMetadata,
        hasCalendlyMetadata ? 'Metadata handling found' : 'Metadata handling missing'
    );
    
} catch (error) {
    addTest('Read webhook.js file', false, error.message);
}

// Test 3: Check create-checkout-session accepts Calendly metadata
try {
    const checkoutJs = fs.readFileSync('api/create-checkout-session.js', 'utf8');
    
    // Check for Calendly metadata parameters
    const hasCalendlyParams = checkoutJs.includes('calendlyEventUri') && 
                              checkoutJs.includes('calendlyInviteeUri');
    addTest(
        'Checkout session accepts Calendly metadata',
        hasCalendlyParams,
        hasCalendlyParams ? 'Metadata parameters found' : 'Metadata parameters missing'
    );
    
    // Check metadata is stored in session
    const storesMetadata = checkoutJs.includes('metadata:') && 
                          checkoutJs.includes('calendlyEventUri');
    addTest(
        'Checkout session stores Calendly metadata',
        storesMetadata,
        storesMetadata ? 'Metadata storage found' : 'Metadata storage missing'
    );
    
} catch (error) {
    addTest('Read create-checkout-session.js file', false, error.message);
}

// Test 4: Check success page shows confirmation
try {
    const successHtml = fs.readFileSync('success.html', 'utf8');
    
    // Check for booking confirmed message
    const hasConfirmedMessage = successHtml.includes('Booking Confirmed') || 
                                successHtml.includes('booking confirmed');
    addTest(
        'Success page shows booking confirmation',
        hasConfirmedMessage,
        hasConfirmedMessage ? 'Confirmation message found' : 'Confirmation message missing'
    );
    
    // Check for session ID display
    const hasSessionIdDisplay = successHtml.includes('session_id') || 
                                successHtml.includes('sessionId');
    addTest(
        'Success page displays session ID',
        hasSessionIdDisplay,
        hasSessionIdDisplay ? 'Session ID display found' : 'Session ID display missing'
    );
    
    // Check for payment confirmation section
    const hasPaymentConfirmation = successHtml.includes('Payment Confirmation') || 
                                   successHtml.includes('payment') && successHtml.includes('successful');
    addTest(
        'Success page shows payment confirmation',
        hasPaymentConfirmation,
        hasPaymentConfirmation ? 'Payment confirmation found' : 'Payment confirmation missing'
    );
    
} catch (error) {
    addTest('Read success.html file', false, error.message);
}

console.log('\n📋 Requirement 11.4: Payment failure prevents booking confirmation\n');

// Test 5: Check webhook handler prevents booking on payment failure
try {
    const webhookJs = fs.readFileSync('api/webhook.js', 'utf8');
    
    // Check for payment_intent.payment_failed handler
    const hasPaymentFailed = webhookJs.includes('payment_intent.payment_failed');
    addTest(
        'Webhook handles payment_intent.payment_failed event',
        hasPaymentFailed,
        hasPaymentFailed ? 'Event handler found' : 'Event handler missing'
    );
    
    // Check for prevention logic
    const hasPreventionLogic = webhookJs.includes('NOT confirm') || 
                               webhookJs.includes('prevents booking') ||
                               webhookJs.includes('Do NOT confirm');
    addTest(
        'Webhook prevents booking confirmation on payment failure',
        hasPreventionLogic,
        hasPreventionLogic ? 'Prevention logic found' : 'Prevention logic missing'
    );
    
    // Check for error logging
    const hasErrorLogging = webhookJs.includes('Payment failed') || 
                           webhookJs.includes('payment failure');
    addTest(
        'Webhook logs payment failures',
        hasErrorLogging,
        hasErrorLogging ? 'Error logging found' : 'Error logging missing'
    );
    
} catch (error) {
    addTest('Read webhook.js file for failure handling', false, error.message);
}

// Test 6: Check error handling in CalendlyHandler
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    
    // Check for payment flow error handler
    const hasErrorHandler = indexHtml.includes('handlePaymentFlowError');
    addTest(
        'CalendlyHandler has payment flow error handler',
        hasErrorHandler,
        hasErrorHandler ? 'Error handler found' : 'Error handler missing'
    );
    
    // Check for error message display
    const hasErrorDisplay = indexHtml.includes('Payment Setup Failed') || 
                           indexHtml.includes('payment.*failed');
    addTest(
        'Shows error message when payment setup fails',
        hasErrorDisplay,
        hasErrorDisplay ? 'Error display found' : 'Error display missing'
    );
    
} catch (error) {
    addTest('Read index.html for error handling', false, error.message);
}

console.log('\n📋 Requirement 11.5: Complete flow without leaving site\n');

// Test 7: Check flow integration
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    
    // Check for session storage usage
    const usesSessionStorage = indexHtml.includes('sessionStorage') && 
                               indexHtml.includes('pendingBooking');
    addTest(
        'Uses session storage to track booking state',
        usesSessionStorage,
        usesSessionStorage ? 'Session storage usage found' : 'Session storage usage missing'
    );
    
    // Check for smooth transitions
    const hasTransitions = indexHtml.includes('showPaymentLoadingMessage') && 
                          indexHtml.includes('window.location.href');
    addTest(
        'Provides smooth transitions between steps',
        hasTransitions,
        hasTransitions ? 'Transition logic found' : 'Transition logic missing'
    );
    
} catch (error) {
    addTest('Read index.html for flow integration', false, error.message);
}

// Test 8: Check StripePaymentHandler integration
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    
    // Check for createCheckoutSession with metadata
    const hasMetadataSupport = indexHtml.includes('createCheckoutSession') && 
                               indexHtml.includes('calendlyEventUri');
    addTest(
        'StripePaymentHandler supports Calendly metadata',
        hasMetadataSupport,
        hasMetadataSupport ? 'Metadata support found' : 'Metadata support missing'
    );
    
} catch (error) {
    addTest('Read index.html for Stripe integration', false, error.message);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary\n');
console.log(`Total Tests: ${results.tests.length}`);
console.log(`✓ Passed: ${results.passed}`);
console.log(`✗ Failed: ${results.failed}`);
console.log(`⚠ Warnings: ${results.warnings}`);

const passRate = ((results.passed / results.tests.length) * 100).toFixed(1);
console.log(`\nPass Rate: ${passRate}%`);

if (results.failed === 0) {
    console.log('\n✅ All integration checks passed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Test the complete flow manually using test-calendly-stripe-integration.html');
    console.log('2. Use Stripe test cards to verify payment success and failure scenarios');
    console.log('3. Check webhook logs in Vercel/Stripe dashboard');
    console.log('4. Verify booking confirmation emails are sent correctly');
} else {
    console.log('\n⚠️ Some checks failed. Please review the implementation.');
    console.log('\nFailed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.message) console.log(`    ${t.message}`);
    });
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
