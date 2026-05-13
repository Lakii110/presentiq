@echo off
title Speech Pronunciation Assessment System
color 0A

cls
echo.
echo  ========================================================
echo  ^|                                                      ^|
echo  ^|    Speech Pronunciation Assessment System           ^|
echo  ^|                                                      ^|
echo  ========================================================
echo.
echo  Starting servers...
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
echo  ========================================================
echo.

REM Start Backend
echo  [1/2] Starting Backend Server...
start "Backend - http://localhost:8000" cmd /k "cd backend && .venv\Scripts\activate && python run.py"

REM Wait for backend to initialize
timeout /t 5 /nobreak >nul

REM Start Frontend
echo  [2/2] Starting Frontend Server...
start "Frontend - http://localhost:3000" cmd /k "npm run dev"

echo.
echo  ========================================================
echo  ^|                                                      ^|
echo  ^|    SERVERS STARTED SUCCESSFULLY!                    ^|
echo  ^|                                                      ^|
echo  ========================================================
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
echo  Login Credentials:
echo  ------------------
echo  Email:    lakmihathnapitiya9@gmail.com
echo  Password: HGlak@23562
echo.
echo  Or Admin:
echo  Email:    admin@test.com
echo  Password: admin123
echo.
echo  ========================================================
echo.
echo  Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo  Browser opened! You can now login.
echo.
echo  To stop the servers, close the terminal windows.
echo  Press any key to close this window...
pause >nul
