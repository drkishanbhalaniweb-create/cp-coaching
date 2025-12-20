# Updated File Structure

## New Project Structure

```
project-root/
├── diagnostic.html              ⭐ NEW MAIN LANDING PAGE
├── booking.html                 Payment & appointment booking
├── success.html                 Payment success page
├── test-booking.html            Test suite for booking page
├── copy/                        Hidden backup folder
│   └── index.html               Backup of original landing page
├── api/
│   ├── create-checkout-session.js
│   ├── log-diagnostic.js
│   └── webhook.js
├── __tests__/                   Test files
├── docs/                        Documentation
├── data/                        Data files
├── .kiro/                       Kiro specs
├── local-server.js              Local dev server
├── vercel.json                  Vercel configuration
├── package.json                 Dependencies
├── jest.config.js               Test configuration
├── .gitignore                   Git ignore rules
├── README.md                    Project overview
├── SETUP_GUIDE.md               Setup instructions
└── [other config files]
```

## What Changed

### 1. Main Landing Page
- **Before**: `index.html` was the main landing page
- **After**: `diagnostic.html` is now the main landing page
- **URL**: `http://localhost:3001/` → serves `diagnostic.html`

### 2. Backup Copy
- **Created**: `copy/` folder
- **Contains**: `copy/index.html` (backup of original landing page)
- **Hidden**: Added to `.gitignore` so it won't be deployed
- **Access**: Still accessible at `http://localhost:3001/copy/index.html` if needed

### 3. Server Configuration
- **Local**: `local-server.js` updated to serve `diagnostic.html` as default
- **Production**: `vercel.json` already configured with rewrite rule

## User Flow

```
Landing Page (diagnostic.html)
    ↓
Answer 5 Questions
    ↓
View Recommendation
    ↓
Click "Book Claim Readiness Review"
    ↓
Redirected to booking.html
    ↓
Pay $225 via Stripe
    ↓
Schedule via Cal.com
    ↓
Success Page (success.html)
```

## Pages Available

### Main Pages (3)
1. **diagnostic.html** - Main landing page (5-question diagnostic)
2. **booking.html** - Payment & appointment booking
3. **success.html** - Payment success confirmation

### Test Pages (1)
4. **test-booking.html** - Booking page test suite

### Hidden Pages (1)
5. **copy/index.html** - Backup (not deployed)

## Configuration Files Updated

### local-server.js
```javascript
// Changed from:
if (filePath === './') {
  filePath = './index.html';
}

// To:
if (filePath === './') {
  filePath = './diagnostic.html';
}
```

### vercel.json
```json
"rewrites": [
  {
    "source": "/",
    "destination": "/diagnostic.html"
  }
]
```

### .gitignore
```
copy/
```

## Testing

### Local Development
```bash
node local-server.js
# Visit: http://localhost:3001/
# Should load: diagnostic.html
```

### Production (Vercel)
- Vercel automatically rewrites `/` to `/diagnostic.html`
- No additional configuration needed

## Backup Access

If you need to access the original landing page:
- **Local**: `http://localhost:3001/copy/index.html`
- **Production**: Not deployed (hidden in .gitignore)

## Summary

✅ `diagnostic.html` is now the main landing page  
✅ Original `index.html` backed up in `copy/` folder  
✅ `copy/` folder hidden from Git and production  
✅ Both local and production servers configured  
✅ User flow optimized for diagnostic-first experience  

**Your website now starts with the diagnostic assessment!** 🎉
