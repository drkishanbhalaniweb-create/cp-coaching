const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

module.exports = async (req, res) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    console.log(`[${requestId}] Incoming request: ${req.method} ${req.url}`);

    // Set CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        console.log(`[${requestId}] Handling OPTIONS preflight request`);
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.warn(`[${requestId}] Method not allowed: ${req.method}`);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables on function start
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error(`[${requestId}] Missing STRIPE_SECRET_KEY environment variable`);
        return res.status(500).json({ 
            error: 'Server configuration error. Please contact support.' 
        });
    }

    if (!process.env.STRIPE_PRICE_ID) {
        console.error(`[${requestId}] Missing STRIPE_PRICE_ID environment variable`);
        return res.status(500).json({ 
            error: 'Server configuration error. Please contact support.' 
        });
    }

    console.log(`[${requestId}] Environment variables validated successfully`);

    try {
        // Request validation for optional email field and Calendly metadata
        const requestBody = req.body || {};
        const { email, calendlyEventUri, calendlyInviteeUri } = requestBody;

        // Validate email if provided
        if (email !== undefined && email !== null && email !== '') {
            if (!isValidEmail(email)) {
                console.warn(`[${requestId}] Invalid email format provided: ${email}`);
                return res.status(400).json({ 
                    error: 'Invalid email format. Please provide a valid email address.' 
                });
            }
            console.log(`[${requestId}] Valid email provided: ${email}`);
        } else {
            console.log(`[${requestId}] No email provided in request`);
        }

        // Log Calendly metadata if provided
        if (calendlyEventUri || calendlyInviteeUri) {
            console.log(`[${requestId}] Calendly booking metadata:`, {
                eventUri: calendlyEventUri,
                inviteeUri: calendlyInviteeUri
            });
        }

        const domain = process.env.DOMAIN || 'http://localhost:3000';
        console.log(`[${requestId}] Using domain: ${domain}`);

        // Create Stripe Checkout Session
        console.log(`[${requestId}] Creating Stripe Checkout Session with price ID: ${process.env.STRIPE_PRICE_ID}`);
        
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${domain}/results.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/booking.html`,
            metadata: {
                service: 'Claim Readiness Review',
                timestamp: new Date().toISOString(),
                // Include Calendly booking information for webhook processing
                calendlyEventUri: calendlyEventUri || '',
                calendlyInviteeUri: calendlyInviteeUri || '',
            },
        };

        // Add customer_email only if valid email provided
        if (email && isValidEmail(email)) {
            sessionConfig.customer_email = email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log(`[${requestId}] Checkout Session created successfully: ${session.id}`);
        console.log(`[${requestId}] Checkout URL: ${session.url}`);

        // Return structured response with sessionId and url
        res.status(200).json({ 
            sessionId: session.id, 
            url: session.url 
        });
    } catch (error) {
        // Detailed logging for debugging
        console.error(`[${requestId}] Error creating checkout session:`, {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack
        });
        
        // Don't expose internal errors to users
        res.status(500).json({ 
            error: 'Unable to process payment. Please try again or contact support.' 
        });
    }
};
