# 🚀 Quick Start: Cal.com Setup

## 5-Minute Setup Guide

### 1️⃣ Create Cal.com Account
- Go to: **https://cal.com**
- Sign up (free)
- Verify email

### 2️⃣ Create Event
- Click **"Event Types"** → **"New Event Type"**
- Name: **"Claim Readiness Review"**
- Duration: **60 minutes**
- Save

### 3️⃣ Get Your Link
Your link will look like:
```
https://cal.com/YOUR-USERNAME/claim-readiness-review
```

Copy only: `YOUR-USERNAME/claim-readiness-review`

### 4️⃣ Update booking.html
Find line ~180 and replace:
```javascript
calLink: "YOUR-USERNAME/claim-readiness-review",
```

With your actual link:
```javascript
calLink: "john-smith/claim-readiness-review",
```

### 5️⃣ Test
Open `test-booking.html` in browser → Click "Open Booking Page"

### 6️⃣ Deploy
```bash
git add .
git commit -m "Add Cal.com integration"
git push
```

## ✅ Done!

**Need more details?** See `CAL_COM_MIGRATION_COMPLETE.md`

---

## 🎯 What Changed

| Before | After |
|--------|-------|
| Calendly (paid) | Cal.com (free) |
| Limited customization | Full customization |
| Closed source | Open source |
| $8-12/month | $0/month |

## 📁 New Files

- `CalIntegration.js` - Cal.com integration class
- `CAL_COM_SETUP_GUIDE.md` - Detailed guide
- `CAL_COM_MIGRATION_COMPLETE.md` - Migration summary
- `cleanup-calendly.bat` / `.sh` - Cleanup scripts

## 🗑️ Files to Delete (Optional)

Run `cleanup-calendly.bat` (Windows) or `cleanup-calendly.sh` (Mac/Linux)

Or manually delete:
- CalendlyIntegration.js
- test-calendly*.html
- verify-calendly*.js
- CALENDLY_*.md
- __tests__/CalendlyIntegration.test.js

## 🔧 Customization

### Change Layout
```javascript
layout: "month_view" // or "week_view", "column_view"
```

### Change Theme
```javascript
config: { theme: "light" } // or "dark", "auto"
```

### Pre-fill Data
```javascript
config: {
  theme: "light",
  name: "John Doe",
  email: "john@example.com",
  notes: "Diagnostic Score: 7/10"
}
```

## 💡 Pro Tips

1. **Test locally first** - Use `test-booking.html`
2. **Set availability** - Configure your Cal.com schedule
3. **Add buffer time** - Prevent back-to-back bookings
4. **Enable reminders** - Reduce no-shows
5. **Customize emails** - Brand your notifications

## 🆘 Troubleshooting

**Widget not loading?**
- Check console for errors
- Verify event link is correct
- Ensure event is published

**"Event Not Found"?**
- Check username spelling
- Verify event is public
- Confirm event slug matches

## 📚 Resources

- **Setup Guide**: `CAL_COM_SETUP_GUIDE.md`
- **Full Docs**: https://cal.com/docs
- **Embed Guide**: https://cal.com/docs/integrations/embed
- **Community**: https://github.com/calcom/cal.com/discussions

---

**Total Time: ~5 minutes** ⏱️

**Cost: $0** 💰

**Difficulty: Easy** ✨
