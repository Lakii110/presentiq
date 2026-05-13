# Complete system test
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    if ($health.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
}

# Test 2: Frontend Health
Write-Host "`nTest 2: Frontend Health Check..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend health check failed" -ForegroundColor Red
}

# Test 3: Proxy Connection
Write-Host "`nTest 3: Frontend-Backend Proxy..." -ForegroundColor Yellow
try {
    $proxy = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/health" -UseBasicParsing
    if ($proxy.StatusCode -eq 200) {
        Write-Host "✅ Proxy connection working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Proxy connection failed" -ForegroundColor Red
}

# Test 4: Login Endpoint
Write-Host "`nTest 4: Login Functionality..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@test.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $login = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    if ($login.StatusCode -eq 200) {
        $token = ($login.Content | ConvertFrom-Json).access_token
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
        
        # Test 5: Authenticated Endpoint
        Write-Host "`nTest 5: Authenticated Request..." -ForegroundColor Yellow
        try {
            $me = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/auth/me" `
                -Headers @{ Authorization = "Bearer $token" } `
                -UseBasicParsing
            
            if ($me.StatusCode -eq 200) {
                $user = $me.Content | ConvertFrom-Json
                Write-Host "✅ Authentication working" -ForegroundColor Green
                Write-Host "   User: $($user.email)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "❌ Authentication failed" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
}

# Test 6: API Documentation
Write-Host "`nTest 6: API Documentation..." -ForegroundColor Yellow
try {
    $docs = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
    if ($docs.StatusCode -eq 200) {
        Write-Host "✅ API docs accessible at http://localhost:8000/docs" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API docs not accessible" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SYSTEM TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
