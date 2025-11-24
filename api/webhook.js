const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Stripe webhooks require raw body
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // If webhook secret is not configured, log warning but don't fail
    if (!webhookSecret) {
        console.warn('STRIPE_WEBHOOK_SECRET not configured. Webhook verification disabled.');
        return res.status(500).json({ 
            error: 'Webhook not configured' 
        });
    }

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('✅ Payment successful:', {
                    sessionId: session.id,
                    customerEmail: session.customer_email,
                    amountTotal: session.amount_total / 100,
                    currency: session.currency,
                });
                
                // TODO: Add your business logic here:
                // - Send confirmation email
                // - Log to database
                // - Trigger notifications
                // - Update CRM
                
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                console.log('⏰ Checkout session expired:', expiredSession.id);
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('💰 Payment intent succeeded:', paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.error('❌ Payment failed:', {
                    id: failedPayment.id,
                    error: failedPayment.last_payment_error?.message,
                });
                
                // TODO: Handle failed payment
                // - Send notification to admin
                // - Log for follow-up
                
                break;

            case 'charge.refunded':
                const refund = event.data.object;
                console.log('💸 Refund processed:', {
                    chargeId: refund.id,
                    amount: refund.amount_refunded / 100,
                });
                
                // TODO: Handle refund
                // - Cancel Calendly booking
                // - Send refund confirmation email
                // - Update records
                
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true });
        
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(500).json({ 
            error: 'Webhook processing failed' 
        });
    }
};
