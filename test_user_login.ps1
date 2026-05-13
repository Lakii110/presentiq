# Test user login through frontend proxy
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing User Login" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$credentials = @(
    @{email="lakmihathnapitiya9@gmail.com"; password="HGlak@23562"; name="User 1"},
    @{email="deshanilakmi001@gmail.com"; password="HGlak@23562"; name="User 2"},
    @{email="admin@test.com"; password="admin123"; name="Admin"}
)

foreach ($cred in $credentials) {
    Write-Host "Testing $($cred.name) ($($cred.email))..." -ForegroundColor Yellow
    
    $body = @{
        email = $cred.email
        password = $cred.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "  ✅ Login successful!" -ForegroundColor Green
            Write-Host "  Token: $($data.access_token.Substring(0, 30))..." -ForegroundColor Gray
            Write-Host "  Is Admin: $($data.is_admin)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Login Tests Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
