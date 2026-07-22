@echo off
title DramaBox Streaming App
echo =========================================
echo    Starting DramaBox Streaming App...
echo =========================================
echo.

echo Building frontend...
call npm run build

echo.
echo =========================================
echo    Server running on http://localhost:3000
echo =========================================
echo.
node server.js

