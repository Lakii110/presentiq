# PowerShell script to start frontend server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules not found!" -ForegroundColor Red
    Write-Host "Please run: npm install" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev
