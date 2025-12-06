# Klondike Solitaire - Development Environment Init Script
# This script sets up and starts the development environment
# Self-auditing: kills stale servers, validates deps, health checks, smoke test

$ErrorActionPreference = "Stop"
$DEV_PORT = 5173

Write-Host "🃏 Klondike Solitaire - Development Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Step 1: Kill any stale dev servers on target port
Write-Host "🔍 Checking for stale processes on port $DEV_PORT..." -ForegroundColor Yellow
$staleProcesses = Get-NetTCPConnection -LocalPort $DEV_PORT -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique
if ($staleProcesses) {
    foreach ($pid in $staleProcesses) {
        Write-Host "  Killing stale process PID: $pid" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
    Write-Host "✓ Stale processes cleaned up" -ForegroundColor Green
} else {
    Write-Host "✓ No stale processes found" -ForegroundColor Green
}

# Step 2: Check/install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
        Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Step 3: Type check
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type check failed!" -ForegroundColor Red
    Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Type check passed" -ForegroundColor Green

# Step 4: Lint check
Write-Host "🧹 Running linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lint check failed!" -ForegroundColor Red
    Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Lint check passed" -ForegroundColor Green

# Step 5: Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm test -- --run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed!" -ForegroundColor Red
    Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Tests passed" -ForegroundColor Green

# Step 6: Start dev server in background
Write-Host "" 
Write-Host "🚀 Starting development server in background..." -ForegroundColor Green
Write-Host "   The app will be available at http://localhost:$DEV_PORT" -ForegroundColor Cyan
Write-Host ""

# Start dev server as a background job
$devJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1
}

# Step 7: Wait for port to be ready (health check)
Write-Host "⏳ Waiting for server to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $DEV_PORT -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            $serverReady = $true
        }
    } catch {
        # Continue waiting
    }
}

if (-not $serverReady) {
    Write-Host "❌ Server failed to start within 30 seconds!" -ForegroundColor Red
    Write-Host "   Checking job output..." -ForegroundColor Yellow
    Receive-Job -Id $devJob.Id
    Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dev server ready on port $DEV_PORT (Job ID: $($devJob.Id))" -ForegroundColor Green

# Step 8: Smoke test - verify the app responds
Write-Host "💨 Running smoke test..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$DEV_PORT" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Smoke test passed (HTTP 200)" -ForegroundColor Green
    } else {
        throw "Unexpected status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Smoke test failed: $_" -ForegroundColor Red
    Write-Host "   Run /recover-from-failure to diagnose" -ForegroundColor Red
    exit 1
}

Write-Host "  To view output: Receive-Job -Id $($devJob.Id)" -ForegroundColor Gray
Write-Host "  To stop: Stop-Job -Id $($devJob.Id); Remove-Job -Id $($devJob.Id)" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Environment ready! All health checks passed." -ForegroundColor Green
