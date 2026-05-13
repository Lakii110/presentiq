# PowerShell script to start both servers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Both Servers" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This will open two terminal windows:" -ForegroundColor Yellow
Write-Host "  1. Backend (http://localhost:8000)" -ForegroundColor White
Write-Host "  2. Frontend (http://localhost:3000)" -ForegroundColor White
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\start-backend.ps1"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\start-frontend.ps1"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Both servers are starting!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "`nCheck the opened terminal windows for logs." -ForegroundColor Yellow
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
