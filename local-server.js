const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const stripe = require('stripe')((process.env.STRIPE_SECRET_KEY || '').trim());

const PORT = 3001;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API endpoint
  if (req.url === '/api/create-checkout-session' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const domain = process.env.DOMAIN || `http://localhost:${PORT}`;

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
          },
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sessionId: session.id, url: session.url }));
      } catch (error) {
        console.error('Stripe error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Serve static files
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath = '.' + parsedUrl.pathname;
  if (filePath === './') {
    filePath = './diagnostic.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n🚀 Local Development Server Started!\n');
  console.log(`   ✓ Server running at: http://localhost:${PORT}`);

  const secret = process.env.STRIPE_SECRET_KEY || '';
  const pub = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const price = process.env.STRIPE_PRICE_ID || '';

  console.log(`   ✓ Stripe Secret: ${secret.substring(0, 10)}...${secret.substring(secret.length - 5)} (Length: ${secret.length})`);
  console.log(`   ✓ Stripe Pub Key: ${pub.substring(0, 10)}...${pub.substring(pub.length - 5)} (Length: ${pub.length})`);
  console.log(`   ✓ Stripe Price ID: ${price} (Length: ${price.length})`);
  console.log(`   ✓ Calendly configured: ${process.env.CALENDLY_LINK ? 'Yes' : 'No'}`);
  console.log('\n   Press Ctrl+C to stop\n');
});
