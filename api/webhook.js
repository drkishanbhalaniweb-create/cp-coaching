const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// In-memory store for processed event IDs (for idempotency)
// In production, use a database or cache like Redis
const processedEvents = new Set();

// Maximum number of event IDs to keep in memory
const MAX_PROCESSED_EVENTS = 1000;

/**
 * Log error with comprehensive context
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
function logError(message, error, context = {}) {
    console.error({
        timestamp: new Date().toISOString(),
        message,
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        context,
        environment: process.env.NODE_ENV || 'development'
    });
}

/**
 * Check if event has already been processed (idempotency)
 * @param {string} eventId - Stripe event ID
 * @returns {boolean} - True if already processed
 */
function isEventProcessed(eventId) {
    return processedEvents.has(eventId);
}

/**
 * Mark event as processed (idempotency)
 * @param {string} eventId - Stripe event ID
 */
function markEventProcessed(eventId) {
    // Prevent memory leak by limiting stored event IDs
    if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
        // Remove oldest entries (first 100)
        const iterator = processedEvents.values();
        for (let i = 0; i < 100; i++) {
            const value = iterator.next().value;
            if (value) processedEvents.delete(value);
        }
    }
    processedEvents.add(eventId);
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Validate webhook secret configuration
    if (!webhookSecret) {
        const error = new Error('STRIPE_WEBHOOK_SECRET not configured');
        logError('Webhook configuration error', error, {
            headers: req.headers,
            hasSignature: !!sig
        });
        return res.status(500).json({ 
            error: 'Webhook not configured' 
        });
    }

    // Validate signature header
    if (!sig) {
        const error = new Error('Missing stripe-signature header');
        logError('Webhook signature missing', error, {
            headers: Object.keys(req.headers)
        });
        return res.status(400).json({ 
            error: 'Missing signature' 
        });
    }

    let event;

    try {
        // Verify webhook signature before processing
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        logError('Webhook signature verification failed', err, {
            signatureHeader: sig?.substring(0, 20) + '...',
            bodyLength: req.body?.length
        });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Check for idempotency - prevent duplicate processing
    if (isEventProcessed(event.id)) {
        console.log({
            timestamp: new Date().toISOString(),
            message: 'Duplicate event received (already processed)',
            eventId: event.id,
            eventType: event.type
        });
        // Return success to acknowledge receipt
        return res.json({ received: true, duplicate: true });
    }

    // Process the event
    try {
        console.log({
            timestamp: new Date().toISOString(),
            message: 'Processing webhook event',
            eventId: event.id,
            eventType: event.type
        });

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Payment successful - Booking confirmed',
                    eventId: event.id,
                    sessionId: session.id,
                    customerEmail: session.customer_email,
                    amountTotal: session.amount_total / 100,
                    currency: session.currency,
                    paymentStatus: session.payment_status,
                    metadata: session.metadata
                });
                
                // Payment successful - booking is now confirmed
                // The booking was already created in Calendly when the user selected a time slot
                // This webhook confirms that payment was received, so the booking is valid
                
                // Log booking confirmation
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Booking confirmed after successful payment',
                    sessionId: session.id,
                    customerEmail: session.customer_email,
                    calendlyEventUri: session.metadata?.calendlyEventUri,
                    calendlyInviteeUri: session.metadata?.calendlyInviteeUri
                });
                
                // TODO: Add your business logic here:
                // - Send confirmation email with booking details
                // - Log booking to database with payment confirmation
                // - Trigger notifications to admin/customer
                // - Update CRM with confirmed booking
                // - Send calendar invite if not already sent by Calendly
                
                // Note: Calendly automatically sends confirmation emails
                // This webhook ensures we have a record that payment was completed
                
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Checkout session expired',
                    eventId: event.id,
                    sessionId: expiredSession.id,
                    customerEmail: expiredSession.customer_email
                });
                
                // TODO: Handle expired session
                // - Release reserved time slot
                // - Send follow-up email
                
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Payment intent succeeded',
                    eventId: event.id,
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    metadata: paymentIntent.metadata
                });
                
                // TODO: Handle successful payment intent
                // - Update payment status
                // - Trigger fulfillment
                
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                logError('Payment failed - Booking NOT confirmed', new Error('Payment intent failed'), {
                    eventId: event.id,
                    paymentIntentId: failedPayment.id,
                    amount: failedPayment.amount / 100,
                    currency: failedPayment.currency,
                    errorMessage: failedPayment.last_payment_error?.message,
                    errorCode: failedPayment.last_payment_error?.code,
                    customerEmail: failedPayment.receipt_email
                });
                
                // Payment failed - booking should NOT be confirmed
                // The Calendly booking may have been created, but without payment it's invalid
                
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Payment failure prevents booking confirmation',
                    paymentIntentId: failedPayment.id,
                    customerEmail: failedPayment.receipt_email,
                    errorReason: failedPayment.last_payment_error?.message
                });
                
                // TODO: Handle failed payment
                // - Send notification to admin about failed payment
                // - Cancel/invalidate the Calendly booking if it was created
                // - Log failed payment attempt for follow-up
                // - Send customer notification about payment failure
                // - Provide instructions for retrying payment
                
                // IMPORTANT: Do NOT confirm booking without successful payment
                // This ensures payment and booking are synchronized
                
                break;

            case 'charge.refunded':
                const refund = event.data.object;
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Refund processed',
                    eventId: event.id,
                    chargeId: refund.id,
                    amountRefunded: refund.amount_refunded / 100,
                    currency: refund.currency,
                    refundReason: refund.refunds?.data[0]?.reason,
                    metadata: refund.metadata
                });
                
                // TODO: Handle refund
                // - Cancel Calendly booking
                // - Send refund confirmation email
                // - Update records
                // - Notify admin
                
                break;

            default:
                console.log({
                    timestamp: new Date().toISOString(),
                    message: 'Unhandled event type',
                    eventId: event.id,
                    eventType: event.type
                });
        }

        // Mark event as processed for idempotency
        markEventProcessed(event.id);

        const processingTime = Date.now() - startTime;
        console.log({
            timestamp: new Date().toISOString(),
            message: 'Webhook processed successfully',
            eventId: event.id,
            eventType: event.type,
            processingTimeMs: processingTime
        });

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
        
    } catch (err) {
        logError('Error processing webhook event', err, {
            eventId: event.id,
            eventType: event.type,
            processingTimeMs: Date.now() - startTime
        });
        
        // Return 200 to prevent Stripe from retrying
        // The event is logged for manual review
        res.status(200).json({ 
            received: true,
            error: 'Processing failed but acknowledged'
        });
    }
};
