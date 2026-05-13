@echo off
echo ========================================
echo  CLEARING CACHE AND RESTARTING
echo ========================================
echo.

echo Step 1: Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Clearing Next.js cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo   - Deleted .next folder
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo   - Deleted node_modules\.cache
)

echo.
echo Step 3: Starting dev server...
echo.
echo ========================================
echo  DEV SERVER STARTING
echo ========================================
echo.
echo After server starts:
echo 1. Open browser to http://localhost:3000
echo 2. Press Ctrl + Shift + R to hard refresh
echo 3. Check the logo on any page
echo.
echo ========================================
echo.

npm run dev
