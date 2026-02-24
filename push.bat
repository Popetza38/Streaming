@echo off
chcp 65001 >nul
echo ========================================
echo   Push to GitHub - Streaming
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking status...
git status
echo.

set /p MSG="Commit message (Enter = auto): "
if "%MSG%"=="" set MSG=Update %date% %time:~0,5%

echo.
echo [2/4] Adding all files...
git add -A
echo.

echo [3/4] Committing: %MSG%
git commit -m "%MSG%"
echo.

echo [4/4] Pushing to GitHub...
git push
echo.

echo ========================================
echo   Done!
echo ========================================
pause
