# Start N Siyaj API instances on separate ports, sharing the same database.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\start-cluster.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\start-cluster.ps1 -Ports 3001,3002,3003,3004
[CmdletBinding()]
param(
    [int[]]$Ports = @(3001, 3002, 3003),
    [string]$Root = ''
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$runDir = Join-Path $Root '.run'
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

Write-Host "Siyaj cluster root: $Root"
Write-Host "Instances share the database configured in .env (DATABASE_URL)."

foreach ($port in $Ports) {
    $pidFile = Join-Path $runDir ("api-{0}.pid" -f $port)
    if (Test-Path $pidFile) {
        $existingId = Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($existingId -and (Get-Process -Id ([int]$existingId) -ErrorAction SilentlyContinue)) {
            Write-Host ("Port {0}: already running (PID {1})" -f $port, $existingId)
            continue
        }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }

    $env:PORT = [string]$port
    $outLog = Join-Path $runDir ("api-{0}.log" -f $port)
    $errLog = Join-Path $runDir ("api-{0}.err.log" -f $port)
    $process = Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory $Root `
        -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
    Set-Content -Path $pidFile -Value $process.Id
    Write-Host ("Port {0}: PID {1}" -f $port, $process.Id)
    Start-Sleep -Milliseconds 600
}

Start-Sleep -Seconds 3
Write-Host ''
Write-Host 'Health checks:'
foreach ($port in $Ports) {
    try {
        $response = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/healthz" -f $port) -TimeoutSec 10
        Write-Host ("  {0} -> {1}" -f $port, ($response | ConvertTo-Json -Compress))
    } catch {
        Write-Warning ("  {0} did not answer: {1}" -f $port, $_.Exception.Message)
    }
}
