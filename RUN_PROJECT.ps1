# Speech Pronunciation Assessment System Launcher
Clear-Host

Write-Host ""
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host " |                                                      |" -ForegroundColor Cyan
Write-Host " |    Speech Pronunciation Assessment System           |" -ForegroundColor Cyan
Write-Host " |                                                      |" -ForegroundColor Cyan
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Starting servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host " Backend:  http://localhost:8000" -ForegroundColor White
Write-Host " Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host " [1/2] Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .venv\Scripts\Activate.ps1; python run.py" -WindowStyle Normal

# Wait for backend to initialize
Write-Host " Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host " [2/2] Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host " |                                                      |" -ForegroundColor Cyan
Write-Host " |    SERVERS STARTED SUCCESSFULLY!                    |" -ForegroundColor Cyan
Write-Host " |                                                      |" -ForegroundColor Cyan
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host " Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host " Use your registered credentials to login." -ForegroundColor Yellow
Write-Host ""
Write-Host " ========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Opening browser in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host " Browser opened! You can now login." -ForegroundColor Green
Write-Host ""
Write-Host " To stop the servers, close the terminal windows." -ForegroundColor Gray
Write-Host " Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
