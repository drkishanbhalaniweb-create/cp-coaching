# Cal.com Setup Guide

## Overview
Successfully migrated from Calendly to Cal.com for booking appointments. This guide explains what you need to do to complete the setup.

## What Was Changed

### Files Updated
- ✅ `booking.html` - Replaced Calendly with Cal.com embed
- ✅ `diagnostic.html` - Removed Calendly references
- ✅ `test-booking.html` - Updated for Cal.com testing
- ✅ Created `CalIntegration.js` - New Cal.com integration class

### Files Removed (Safe to Delete)
- ❌ `CalendlyIntegration.js` - No longer needed
- ❌ `test-calendly.html` - No longer needed
- ❌ `test-calendly-stripe-integration.html` - No longer needed
- ❌ `verify-calendly-integration.js` - No longer needed
- ❌ `verify-calendly-stripe-integration.js` - No longer needed
- ❌ `CALENDLY_INTEGRATION_SUMMARY.md` - No longer needed
- ❌ `CALENDLY_STRIPE_INTEGRATION.md` - No longer needed
- ❌ `QUICK_START_CALENDLY_STRIPE.md` - No longer needed
- ❌ `TASK_12_IMPLEMENTATION_SUMMARY.md` - No longer needed
- ❌ `__tests__/CalendlyIntegration.test.js` - No longer needed

## What You Need to Do

### Step 1: Create Cal.com Account (If You Don't Have One)

1. Go to https://cal.com
2. Sign up for a free account
3. Complete your profile setup

### Step 2: Create Your Event Type

1. Log into Cal.com
2. Go to "Event Types"
3. Click "New Event Type"
4. Configure your event:
   - **Event Name**: "Claim Readiness Review"
   - **Duration**: 60 minutes
   - **Location**: Zoom, Google Meet, or Phone
   - **Description**: Add details about what veterans should expect
   - **Availability**: Set your available hours

5. Save the event

### Step 3: Get Your Cal.com Event Link

After creating your event, you'll get a link like:
```
https://cal.com/YOUR-USERNAME/claim-readiness-review
```

The part you need is: `YOUR-USERNAME/claim-readiness-review`

### Step 4: Update booking.html

Open `booking.html` and find this line (around line 180):

```javascript
calLink: "YOUR-USERNAME/claim-readiness-review",
```

Replace it with your actual Cal.com event link:

```javascript
calLink: "john-smith/claim-readiness-review",
```

**Example**: If your Cal.com link is `https://cal.com/john-smith/claim-readiness-review`, use:
```javascript
calLink: "john-smith/claim-readiness-review",
```

### Step 5: Test Locally

1. Open `test-booking.html` in your browser
2. Click "Open Booking Page"
3. Verify the Cal.com widget loads
4. Try booking a test appointment
5. Check that the booking flow works

### Step 6: Deploy to Vercel

Once tested locally:
```bash
git add .
git commit -m "Migrate from Calendly to Cal.com"
git push
```

Vercel will automatically deploy your changes.

## Cal.com Configuration Options

### Customization in booking.html

You can customize the Cal.com embed by modifying the config:

```javascript
Cal("inline", {
  elementOrSelector: "#cal-embed",
  calLink: "YOUR-USERNAME/claim-readiness-review",
  layout: "month_view", // Options: month_view, week_view, column_view
  config: {
    theme: "light" // Options: light, dark, auto
  }
});
```

### Available Layouts
- `month_view` - Calendar month view (default)
- `week_view` - Weekly view
- `column_view` - Column/list view

### Available Themes
- `light` - Light theme (default)
- `dark` - Dark theme
- `auto` - Matches system preference

## Advanced Features

### Pre-fill Booking Data

You can pre-fill the booking form with diagnostic data:

```javascript
Cal("inline", {
  elementOrSelector: "#cal-embed",
  calLink: "YOUR-USERNAME/claim-readiness-review",
  config: {
    theme: "light",
    name: "John Doe",
    email: "john@example.com",
    notes: "Diagnostic Score: 7/10 - Review Strongly Recommended"
  }
});
```

### Track Booking Events

The `CalIntegration.js` class automatically tracks:
- Successful bookings
- Cancelled bookings
- Stores booking data in session storage

### Integration with Analytics

Add Google Analytics tracking by including in your HTML:

```javascript
Cal("on", {
  action: "bookingSuccessful",
  callback: (e) => {
    // Google Analytics
    gtag('event', 'booking_completed', {
      event_category: 'booking',
      event_label: 'claim_readiness_review'
    });
  }
});
```

## Cal.com vs Calendly Comparison

| Feature | Calendly | Cal.com |
|---------|----------|---------|
| **Pricing** | $8-12/mo | Free (open source) |
| **Self-hosted** | No | Yes (optional) |
| **Customization** | Limited | Extensive |
| **API Access** | Paid plans | Free |
| **Embed Options** | Good | Excellent |
| **Open Source** | No | Yes |

## Troubleshooting

### Cal.com Widget Not Loading?

1. **Check the console** for errors
2. **Verify your event link** is correct
3. **Ensure Cal.com script** is loaded:
   ```javascript
   console.log(typeof Cal); // Should output "function"
   ```
4. **Check your Cal.com event** is published and active

### Widget Shows "Event Not Found"?

- Double-check your username and event slug
- Ensure the event is published (not draft)
- Verify the event is set to "Public"

### Styling Issues?

The Cal.com embed inherits your page styles. Adjust the container:

```css
.calendly-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  min-height: 700px;
}
```

## Benefits of Cal.com

✅ **Free Forever** - No monthly fees  
✅ **Open Source** - Full control and transparency  
✅ **Better Customization** - More styling options  
✅ **API Access** - Free API for integrations  
✅ **Self-Hosting Option** - Host on your own server  
✅ **Active Development** - Regular updates and features  
✅ **Privacy Focused** - GDPR compliant  

## Support & Resources

- **Cal.com Docs**: https://cal.com/docs
- **Embed Guide**: https://cal.com/docs/integrations/embed
- **API Docs**: https://cal.com/docs/api-reference
- **Community**: https://github.com/calcom/cal.com/discussions

## Next Steps

1. ✅ Create Cal.com account
2. ✅ Set up "Claim Readiness Review" event
3. ✅ Update `booking.html` with your event link
4. ✅ Test locally with `test-booking.html`
5. ✅ Deploy to Vercel
6. ✅ Test production deployment
7. ⬜ Optional: Set up payment integration
8. ⬜ Optional: Configure email notifications
9. ⬜ Optional: Add custom branding

## Questions?

If you encounter any issues:
1. Check the Cal.com documentation
2. Review the browser console for errors
3. Verify your event link is correct
4. Test with a different browser

---

**Ready to deploy?** Just update the `calLink` in `booking.html` and push to Vercel!
