@echo off
REM Cleanup script to remove old Calendly files after Cal.com migration
REM Run this script to safely remove Calendly-related files

echo.
echo Cleaning up Calendly files...
echo.

set REMOVED=0
set NOT_FOUND=0

REM Remove CalendlyIntegration.js
if exist "CalendlyIntegration.js" (
    del "CalendlyIntegration.js"
    echo [OK] Removed: CalendlyIntegration.js
    set /a REMOVED+=1
) else (
    echo [!] Not found: CalendlyIntegration.js
    set /a NOT_FOUND+=1
)

REM Remove test-calendly.html
if exist "test-calendly.html" (
    del "test-calendly.html"
    echo [OK] Removed: test-calendly.html
    set /a REMOVED+=1
) else (
    echo [!] Not found: test-calendly.html
    set /a NOT_FOUND+=1
)

REM Remove test-calendly-stripe-integration.html
if exist "test-calendly-stripe-integration.html" (
    del "test-calendly-stripe-integration.html"
    echo [OK] Removed: test-calendly-stripe-integration.html
    set /a REMOVED+=1
) else (
    echo [!] Not found: test-calendly-stripe-integration.html
    set /a NOT_FOUND+=1
)

REM Remove verify-calendly-integration.js
if exist "verify-calendly-integration.js" (
    del "verify-calendly-integration.js"
    echo [OK] Removed: verify-calendly-integration.js
    set /a REMOVED+=1
) else (
    echo [!] Not found: verify-calendly-integration.js
    set /a NOT_FOUND+=1
)

REM Remove verify-calendly-stripe-integration.js
if exist "verify-calendly-stripe-integration.js" (
    del "verify-calendly-stripe-integration.js"
    echo [OK] Removed: verify-calendly-stripe-integration.js
    set /a REMOVED+=1
) else (
    echo [!] Not found: verify-calendly-stripe-integration.js
    set /a NOT_FOUND+=1
)

REM Remove CALENDLY_INTEGRATION_SUMMARY.md
if exist "CALENDLY_INTEGRATION_SUMMARY.md" (
    del "CALENDLY_INTEGRATION_SUMMARY.md"
    echo [OK] Removed: CALENDLY_INTEGRATION_SUMMARY.md
    set /a REMOVED+=1
) else (
    echo [!] Not found: CALENDLY_INTEGRATION_SUMMARY.md
    set /a NOT_FOUND+=1
)

REM Remove CALENDLY_STRIPE_INTEGRATION.md
if exist "CALENDLY_STRIPE_INTEGRATION.md" (
    del "CALENDLY_STRIPE_INTEGRATION.md"
    echo [OK] Removed: CALENDLY_STRIPE_INTEGRATION.md
    set /a REMOVED+=1
) else (
    echo [!] Not found: CALENDLY_STRIPE_INTEGRATION.md
    set /a NOT_FOUND+=1
)

REM Remove QUICK_START_CALENDLY_STRIPE.md
if exist "QUICK_START_CALENDLY_STRIPE.md" (
    del "QUICK_START_CALENDLY_STRIPE.md"
    echo [OK] Removed: QUICK_START_CALENDLY_STRIPE.md
    set /a REMOVED+=1
) else (
    echo [!] Not found: QUICK_START_CALENDLY_STRIPE.md
    set /a NOT_FOUND+=1
)

REM Remove TASK_12_IMPLEMENTATION_SUMMARY.md
if exist "TASK_12_IMPLEMENTATION_SUMMARY.md" (
    del "TASK_12_IMPLEMENTATION_SUMMARY.md"
    echo [OK] Removed: TASK_12_IMPLEMENTATION_SUMMARY.md
    set /a REMOVED+=1
) else (
    echo [!] Not found: TASK_12_IMPLEMENTATION_SUMMARY.md
    set /a NOT_FOUND+=1
)

REM Remove __tests__/CalendlyIntegration.test.js
if exist "__tests__\CalendlyIntegration.test.js" (
    del "__tests__\CalendlyIntegration.test.js"
    echo [OK] Removed: __tests__\CalendlyIntegration.test.js
    set /a REMOVED+=1
) else (
    echo [!] Not found: __tests__\CalendlyIntegration.test.js
    set /a NOT_FOUND+=1
)

echo.
echo Summary:
echo    Removed: %REMOVED%
echo    Not found: %NOT_FOUND%
echo.
echo Cleanup complete!
echo.
echo Next steps:
echo 1. Update Cal.com event link in booking.html
echo 2. Test with: test-booking.html
echo 3. Deploy to Vercel
echo.
pause
