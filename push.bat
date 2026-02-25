@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   Push to GitHub - Streaming
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking for changes...
git status --porcelain | findstr /R "." > nul
if %errorlevel% neq 0 (
    echo No changes detected. Nothing to push.
    echo.
    pause
    exit /b
)

git status
echo.

:: Get a cleaner timestamp using wmic (locale independent)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%

set /p MSG="Commit message (Enter = auto-timestamp): "
if "%MSG%"=="" set MSG=Update !TIMESTAMP!

echo.
echo [2/4] Adding and committing...
git add -A
git commit -m "%MSG%"
if %errorlevel% neq 0 (
    echo Commit failed.
    pause
    exit /b
)
echo.

echo [3/4] Pulling latest changes (Rebase)...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo   PULL/REBASE FAILED!
    echo   Please resolve conflicts manually.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo.
    pause
    exit /b
)
echo.

echo [4/4] Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo   PUSH FAILED!
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo.
)

echo.
echo ========================================
echo   Done!
echo ========================================
pause
