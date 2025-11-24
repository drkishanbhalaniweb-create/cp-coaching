#!/usr/bin/env node

/**
 * Configuration Setup Script
 * This script helps you set up your Stripe and Calendly credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('\n🎯 C&P Exam Coaching - Setup Configuration\n');
    console.log('This script will help you configure your Stripe and Calendly integration.\n');

    // Stripe Configuration
    console.log('📦 STRIPE CONFIGURATION');
    console.log('Get your keys from: https://dashboard.stripe.com/test/apikeys\n');

    const stripeSecretKey = await question('Enter your Stripe Secret Key (sk_test_...): ');
    const stripePublishableKey = await question('Enter your Stripe Publishable Key (pk_test_...): ');
    const stripePriceId = await question('Enter your Stripe Price ID (price_...): ');

    // Calendly Configuration
    console.log('\n📅 CALENDLY CONFIGURATION');
    console.log('Get your link from: https://calendly.com/event_types/user/me\n');

    const calendlyLink = await question('Enter your Calendly scheduling link: ');

    // Domain Configuration
    console.log('\n🌐 DOMAIN CONFIGURATION\n');
    const domain = await question('Enter your domain (or press Enter for http://localhost:3000): ') || 'http://localhost:3000';

    // Create .env file
    const envContent = `# Stripe Configuration
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_PRICE_ID=${stripePriceId}

# Calendly Configuration
CALENDLY_LINK=${calendlyLink}

# Domain Configuration (for Stripe redirect)
DOMAIN=${domain}
`;

    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!\n');

    // Update index.html with Stripe publishable key
    const indexPath = path.join(__dirname, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    indexContent = indexContent.replace(
        'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
        stripePublishableKey
    );
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ index.html updated with Stripe publishable key!\n');

    // Update success.html with Calendly link
    const successPath = path.join(__dirname, 'success.html');
    let successContent = fs.readFileSync(successPath, 'utf8');
    successContent = successContent.replace(
        'CALENDLY_LINK_PLACEHOLDER',
        calendlyLink
    );
    fs.writeFileSync(successPath, successContent);
    console.log('✅ success.html updated with Calendly link!\n');

    console.log('🎉 Setup complete! Next steps:\n');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npm run dev" to start the development server');
    console.log('3. Test the payment flow locally');
    console.log('4. When ready, run "npm run deploy" to deploy to Vercel\n');

    rl.close();
}

setup().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});
