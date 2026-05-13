# Test full login flow through frontend proxy
$body = @{
    email = "lakmihathnapitiya9@gmail.com"
    password = "HGlak@23562"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/proxy/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response Body: $($response.Content)"

if ($response.StatusCode -eq 200) {
    Write-Host "`n✅ Login successful through frontend proxy!"
} else {
    Write-Host "`n❌ Login failed!"
}
