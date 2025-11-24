const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
        console.error('Missing Stripe configuration');
        return res.status(500).json({ 
            error: 'Server configuration error. Please contact support.' 
        });
    }

    try {
        const domain = process.env.DOMAIN || 'http://localhost:3000';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/index.html`,
            metadata: {
                service: 'C&P Exam Coaching Session',
                timestamp: new Date().toISOString(),
            },
            customer_email: req.body?.email || undefined,
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        
        // Don't expose internal errors to users
        res.status(500).json({ 
            error: 'Unable to process payment. Please try again or contact support.' 
        });
    }
};
