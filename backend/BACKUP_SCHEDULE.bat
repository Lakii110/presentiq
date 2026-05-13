@echo off
REM Automated database backup script
REM Run this daily using Windows Task Scheduler

cd /d "%~dp0"

echo ========================================
echo  Database Backup - %date% %time%
echo ========================================

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Run backup
python backup_database.py

echo.
echo Backup complete!
echo ========================================
