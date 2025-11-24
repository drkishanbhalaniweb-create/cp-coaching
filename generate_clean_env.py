
import os

# Hardcoded CLEAN keys
secret_key = "sk_test_51SVaSlPZSF0DdZdsot1wVuhubYr7zLtyV5JK522shbflJf2vlEzVoqiLJbuiERzF5yXTRqVKnccTxyCi46f1msHA00RGpWkXvN"
publishable_key = "pk_test_51SVaSlPZSF0DdZdshpYD2a9pkPDYjL0CvmkdnNaAl6GQDgPQS86z85t75Fq23rxQx1ywv2eKpYDYYxUD3mTWsO2I00BbEfPiXO"
price_id = "price_1SX7EjPZSF0DdZds7Xj6bP3w"
calendly_link = "https://calendly.com/dr-kishanbhalani-web/c-p-examination-coaching"
domain = "http://localhost:3000"

content = f"""# Stripe Configuration
STRIPE_SECRET_KEY={secret_key}
STRIPE_PUBLISHABLE_KEY={publishable_key}
STRIPE_PRICE_ID={price_id}

# Calendly Configuration
CALENDLY_LINK={calendly_link}

# Domain Configuration (for Stripe redirect)
DOMAIN={domain}
"""

with open('.env', 'w') as f:
    f.write(content)

print("Successfully wrote CLEAN .env file")
