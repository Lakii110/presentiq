@echo off
echo ========================================
echo Starting Both Servers
echo ========================================
echo.
echo This will open two terminal windows:
echo   1. Backend (http://localhost:8000)
echo   2. Frontend (http://localhost:3000)
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "start-backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "start-frontend.bat"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the opened terminal windows for logs.
echo Close this window or press any key to exit.
pause >nul
