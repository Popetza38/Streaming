@echo off
title Drama Streaming Platform
echo ========================================
echo   Drama Streaming Platform (Firebase)
echo   Platforms: DramaBox, ShortMax, ShortBox
echo             FlexTV, DramaPops, DramaBite
echo ========================================
echo.

rem Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found. Running npm install...
    call npm install
)

echo Starting Express API server (port 3000)...
start "Drama API Server" cmd /k "npm run server"

echo Starting Vite dev server...
timeout /t 2 /nobreak >nul
start "Drama Vite Dev" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo   API:  http://localhost:3000
echo   App:  http://localhost:5173
echo ========================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173
