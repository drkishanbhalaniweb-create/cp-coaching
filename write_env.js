
const fs = require('fs');

const content = `STRIPE_SECRET_KEY=sk_test_51SVaSlPZSF0DdZdsot1wVuhubYr7zLtyV5JK522shbflJf2vlEzVoqiLJbuiERzF5yXTRqVKnccTxyCi46f1msHA00RGpWkXvN
STRIPE_PUBLISHABLE_KEY=pk_test_51SVaSlPZSF0DdZdshpYD2a9pkPDYjL0CvmkdnNaAl6GQDgPQS86z85t75Fq23rxQx1ywv2eKpYDYYxUD3mTWsO2I00BbEfPiXO
STRIPE_PRICE_ID=price_1SX7EjPZSF0DdZds7Xj6bP3w
CALENDLY_LINK=https://calendly.com/dr-kishanbhalani-web/c-p-examination-coaching
DOMAIN=http://localhost:3000`;

try {
    if (fs.existsSync('.env')) {
        fs.unlinkSync('.env');
        console.log('Deleted existing .env file');
    }
    fs.writeFileSync('.env', content, { encoding: 'utf8' });
    console.log('Successfully wrote new .env file');

    const readBack = fs.readFileSync('.env', 'utf8');
    console.log('--- File Content Read Back ---');
    console.log(readBack);
    console.log('-----------------------------');
} catch (err) {
    console.error('Error:', err);
}
