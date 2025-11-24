
const fs = require('fs');

// Manually reconstructed keys to ensure no hidden characters
const secretPart1 = 'sk_test_51SVaSlPZSF0DdZdsot1wVuhubYr7zLtyV5JK522shbflJf2vlEzVoqiLJbuiERzF5yXTRqV';
const secretPart2 = 'KnccTxyCi46f1msHA00RGpWkXvN';
const secretKey = secretPart1 + secretPart2;

const pubPart1 = 'pk_test_51SVaSlPZSF0DdZdshpYD2a9pkPDYjL0CvmkdnNaAl6GQDgPQS86z85t75Fq23rxQx1ywv2eKpYDYYxUD3mTWsO2I00B';
const pubPart2 = 'bEfPiXO';
const pubKey = pubPart1 + pubPart2;

const content = `STRIPE_SECRET_KEY=${secretKey}
STRIPE_PUBLISHABLE_KEY=${pubKey}
STRIPE_PRICE_ID=price_1SX7EjPZSF0DdZds7Xj6bP3w
CALENDLY_LINK=https://calendly.com/dr-kishanbhalani-web/c-p-examination-coaching
DOMAIN=http://localhost:3000`;

try {
    if (fs.existsSync('.env')) {
        fs.unlinkSync('.env');
    }
    fs.writeFileSync('.env', content, { encoding: 'utf8' });
    console.log('Successfully wrote CLEAN .env file');
    console.log('Secret Key Length:', secretKey.length);
    console.log('Publishable Key Length:', pubKey.length);
} catch (err) {
    console.error('Error:', err);
}
