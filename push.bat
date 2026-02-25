@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   Push to GitHub - Streaming
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking for changes...
git status --porcelain > "%temp%\git_status.tmp"
set "HAS_UNCOMMITTED="
for /f "usebackq" %%A in ("%temp%\git_status.tmp") do set "HAS_UNCOMMITTED=1"

git log @{u}.. > "%temp%\git_unpushed.tmp" 2>nul
set "HAS_UNPUSHED="
for /f "usebackq" %%A in ("%temp%\git_unpushed.tmp") do set "HAS_UNPUSHED=1"

if not defined HAS_UNCOMMITTED (
    if not defined HAS_UNPUSHED (
        echo No changes detected and no unpushed commits. Nothing to push.
        echo.
        pause
        exit /b
    ) else (
        echo No uncommitted changes, but found unpushed commits. Skipping commit step.
        echo.
    )
) else (
    git status
    echo.
    
    :: Get a cleaner timestamp using powershell (wmic is deprecated)
    for /f "usebackq" %%I in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm'"`) do set TIMESTAMP=%%I

    set /p MSG="Commit message (Enter = auto-timestamp): "
    if "!MSG!"=="" set MSG=Update !TIMESTAMP!

    echo.
    echo [2/4] Adding and committing...
    git add -A
    git commit -m "!MSG!"
    if !errorlevel! neq 0 (
        echo Commit failed.
        pause
        exit /b
    )
    echo.
)

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
