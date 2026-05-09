@echo off
title DramaBox Server
echo =========================================
echo    Starting DramaBox Streaming App...
echo =========================================
echo.

echo [1/2] Starting Backend Proxy Server (Port 3000)...
start "DramaBox Backend" cmd /k "node server.js"

echo [2/2] Starting Frontend Vite Server (Port 5173)...
start "DramaBox Frontend" cmd /k "npm run dev"

echo.
echo =========================================
echo    Both servers have been launched!
echo    You can now open http://localhost:5173
echo =========================================
echo.
pause
