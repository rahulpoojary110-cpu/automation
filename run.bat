@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo Node.js is required and wasn't found on this machine.
    echo Install it from https://nodejs.org ^(the LTS version^), then double-click run.bat again.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Setting up deck-sop-agent for the first time, this takes a minute...
    call npm install --no-fund --no-audit --loglevel=error
    if errorlevel 1 (
        echo.
        echo Setup failed. See the error above.
        pause
        exit /b 1
    )
)

node src\app.mjs

echo.
pause
