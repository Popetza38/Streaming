@echo off
title GoodShort - ShortMax
echo ========================================
echo   GoodShort ShortMax Server
echo ========================================
echo.
echo Starting Express API server (port 3002)...
start "GoodShort API" cmd /k "cd /d %~dp0 && node server.js"
echo Starting Vite dev server...
timeout /t 2 /nobreak >nul
start "GoodShort Vite" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo ========================================
echo   Both servers are starting!
echo   API:  http://localhost:3002
echo   App:  http://localhost:5173
echo ========================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
