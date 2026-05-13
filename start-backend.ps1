# PowerShell script to start backend server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location backend

if (-not (Test-Path ".venv")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    Write-Host "Then: .venv\Scripts\pip install -r requirements.txt" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .venv\Scripts\Activate.ps1

Write-Host "`nStarting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

python run.py
