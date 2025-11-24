@echo off
echo ========================================
echo   C&P Exam Coaching - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Checking configuration...
if not exist .env (
    echo WARNING: .env file not found!
    echo.
    echo You need to configure your credentials first.
    echo.
    echo Choose an option:
    echo   1. Run interactive setup (recommended)
    echo   2. Manually create .env file
    echo.
    set /p choice="Enter your choice (1 or 2): "
    
    if "!choice!"=="1" (
        echo.
        echo Running setup script...
        node setup.js
    ) else (
        echo.
        echo Please create a .env file with your credentials.
        echo See .env.example for the template.
        echo.
        pause
        exit /b 0
    )
)
echo Configuration found!
echo.

echo [4/4] Starting development server...
echo.
echo ========================================
echo   Server will start at:
echo   http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
