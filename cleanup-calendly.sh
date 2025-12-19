#!/bin/bash

# Cleanup script to remove old Calendly files after Cal.com migration
# Run this script to safely remove Calendly-related files

echo "🧹 Cleaning up Calendly files..."
echo ""

# Files to remove
FILES_TO_REMOVE=(
  "CalendlyIntegration.js"
  "test-calendly.html"
  "test-calendly-stripe-integration.html"
  "verify-calendly-integration.js"
  "verify-calendly-stripe-integration.js"
  "CALENDLY_INTEGRATION_SUMMARY.md"
  "CALENDLY_STRIPE_INTEGRATION.md"
  "QUICK_START_CALENDLY_STRIPE.md"
  "TASK_12_IMPLEMENTATION_SUMMARY.md"
  "__tests__/CalendlyIntegration.test.js"
)

# Count files
TOTAL=${#FILES_TO_REMOVE[@]}
REMOVED=0
NOT_FOUND=0

# Remove each file
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "✅ Removed: $file"
    ((REMOVED++))
  else
    echo "⚠️  Not found: $file"
    ((NOT_FOUND++))
  fi
done

echo ""
echo "📊 Summary:"
echo "   Total files: $TOTAL"
echo "   Removed: $REMOVED"
echo "   Not found: $NOT_FOUND"
echo ""
echo "✨ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Update Cal.com event link in booking.html"
echo "2. Test with: test-booking.html"
echo "3. Deploy to Vercel"
