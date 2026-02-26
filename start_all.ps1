$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Load-EnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")

        if ($key) {
            Set-Item -Path "Env:$key" -Value $value
        }
    }
}

function Stop-PortProcess {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $connections) {
        return
    }

    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $processIds) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Stop-PortProcess -Port 8000
Stop-PortProcess -Port 3000

$envFile = Join-Path $PSScriptRoot ".env"
Load-EnvFile -Path $envFile

$pythonPath = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Error "Python executable not found at $pythonPath"
}

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $backendPath)) {
    Write-Error "Backend folder not found at $backendPath"
}
if (-not (Test-Path $frontendPath)) {
    Write-Error "Frontend folder not found at $frontendPath"
}

$backendCommand = "Set-Location `"$backendPath`"; & `"$pythonPath`" -m uvicorn main:app --host 127.0.0.1 --port 8000"
$frontendCommand = "Set-Location `"$frontendPath`"; npm run dev -- -p 3000"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null

Write-Host "Started backend and frontend in separate terminals."
Write-Host "Frontend: http://127.0.0.1:3000"
Write-Host "Dashboard Login: http://127.0.0.1:3000/dashboard-login"
Write-Host "Backend API: http://127.0.0.1:8000"

if ($env:TWILIO_ACCOUNT_SID -and $env:TWILIO_AUTH_TOKEN -and $env:TWILIO_WHATSAPP_FROM) {
    Write-Host "WhatsApp Provider: Twilio configured (real delivery enabled)"
} else {
    Write-Host "WhatsApp Provider: Not configured. Add TWILIO_* values in .env for real delivery."
}
