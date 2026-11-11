# Disaster-recovery drill (reproducible).
#
# Timeline produced by this script:
#   1. create marker user A
#   2. take an online backup (A is inside)
#   3. create marker user B (after the backup -> outside the RPO window)
#   4. simulate data loss: stop the cluster, move the database file away, start fresh
#   5. verify A cannot log in (data is really gone)
#   6. restore from the latest backup and wait for readiness (RTO measured)
#   7. verify A works again and B is absent (RPO demonstrated)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1
[CmdletBinding()]
param(
    [string]$Root = '',
    [int[]]$Ports = @(3001, 3002, 3003),
    [string]$Password = 'DrDemo1234'
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$runDir = Join-Path $Root '.run'
$dataDir = Join-Path $Root 'data'
$dbFile = Join-Path $dataDir 'siyaj.sqlite'
$backupDir = Join-Path $Root 'backups'
$base = 'http://127.0.0.1:3001'
$suffix = Get-Random -Minimum 100000 -Maximum 999999
$emailA = "dr.early.$suffix@siyaj.om"
$emailB = "dr.late.$suffix@siyaj.om"

function Write-Step([string]$Message) {
    Write-Host ("[{0}] {1}" -f (Get-Date).ToString('HH:mm:ss.fff'), $Message)
}

function Invoke-Login([string]$Email, [string]$Pass) {
    $body = @{ identifier = $Email; password = $Pass } | ConvertTo-Json
    try {
        $r = Invoke-WebRequest "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 20 -UseBasicParsing
        return [int]$r.StatusCode
    } catch {
        try { return [int]$_.Exception.Response.StatusCode } catch { return 0 }
    }
}

function Start-ClusterInline {
    foreach ($port in $Ports) {
        $env:PORT = [string]$port
        $outLog = Join-Path $runDir ("api-{0}.log" -f $port)
        $errLog = Join-Path $runDir ("api-{0}.err.log" -f $port)
        $proc = Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory $Root `
            -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
        Set-Content -Path (Join-Path $runDir ("api-{0}.pid" -f $port)) -Value $proc.Id
    }
    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
        $ready = 0
        foreach ($port in $Ports) {
            try {
                $response = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/readyz" -f $port) -TimeoutSec 2
                if ($response.status -eq 'ready') { $ready += 1 }
            } catch { }
        }
        if ($ready -eq $Ports.Count) { return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Stop-ClusterInline {
    Get-ChildItem -Path $runDir -Filter 'api-*.pid' -ErrorAction SilentlyContinue | ForEach-Object {
        $processId = Get-Content $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($processId -and (Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue)) {
            Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
}

Write-Host '================ DR DRILL ================'
Write-Step "marker A: $emailA"
$signupA = @{ username = "dr_early_$suffix"; email = $emailA; phone = "+9689$suffix"; password = $Password } | ConvertTo-Json
$statusA = 0
try { $statusA = [int](Invoke-WebRequest "$base/api/auth/signup" -Method Post -ContentType 'application/json' -Body $signupA -TimeoutSec 20 -UseBasicParsing).StatusCode } catch { $statusA = [int]$_.Exception.Response.StatusCode }
Write-Step "signup A -> HTTP $statusA"

Write-Step 'taking online backup'
& (Join-Path $Root 'scripts\backup.ps1') | Out-Null
$backupFile = Get-ChildItem -Path $backupDir -Filter 'siyaj-*.sqlite' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Step ("backup: {0} ({1} bytes)" -f $backupFile.Name, $backupFile.Length)

Write-Step "marker B (after the backup): $emailB"
$signupB = @{ username = "dr_late_$suffix"; email = $emailB; phone = "+9688$suffix"; password = $Password } | ConvertTo-Json
$statusB = 0
try { $statusB = [int](Invoke-WebRequest "$base/api/auth/signup" -Method Post -ContentType 'application/json' -Body $signupB -TimeoutSec 20 -UseBasicParsing).StatusCode } catch { $statusB = [int]$_.Exception.Response.StatusCode }
Write-Step "signup B -> HTTP $statusB"

Write-Step 'pausing the self-healing task, stopping the cluster'
try { Disable-ScheduledTask -TaskName 'SiyajAlwaysOn' -ErrorAction Stop | Out-Null; Write-Step 'SiyajAlwaysOn paused' } catch { Write-Step 'SiyajAlwaysOn not found (continuing)' }
Stop-ClusterInline

$lostName = "siyaj.sqlite.LOST-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss')
if (Test-Path $dbFile) {
    Move-Item -Path $dbFile -Destination (Join-Path $dataDir $lostName) -Force
}
$disasterAt = Get-Date
Write-Step ("DATA LOSS simulated: database moved to data\{0}" -f $lostName)

Write-Step 'restarting on an empty database (the disaster state)'
$ok = Start-ClusterInline
Write-Step ("cluster ready on empty DB: {0}" -f $ok)
$loginAAfterLoss = Invoke-Login $emailA $Password
Write-Step ("login A after loss -> HTTP {0} (expected 401)" -f $loginAAfterLoss)

Write-Step 'restoring from the latest backup'
$restoreOutput = & (Join-Path $Root 'scripts\restore.ps1') -Latest 2>&1
$restoreOutput | ForEach-Object { Write-Host ("  " + $_) }
$resultPath = Join-Path $runDir 'last-restore.json'
$restoreResult = if (Test-Path $resultPath) { Get-Content $resultPath -Raw | ConvertFrom-Json } else { $null }
$recoveredAt = Get-Date

$loginAAfterRestore = Invoke-Login $emailA $Password
$loginBAfterRestore = Invoke-Login $emailB $Password
Write-Step ("login A after restore -> HTTP {0} (expected 200)" -f $loginAAfterRestore)
Write-Step ("login B after restore -> HTTP {0} (expected 401, created after the backup)" -f $loginBAfterRestore)

Write-Step 're-enabling the self-healing task'
try { Enable-ScheduledTask -TaskName 'SiyajAlwaysOn' -ErrorAction Stop | Out-Null; Write-Step 'SiyajAlwaysOn resumed' } catch { }

Write-Host ''
Write-Host '================ RESULT ================'
Write-Host ("backup file        : {0}" -f $backupFile.Name)
Write-Host ("backup created     : {0}" -f $backupFile.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
Write-Host ("data loss at       : {0}" -f $disasterAt.ToString('yyyy-MM-dd HH:mm:ss'))
Write-Host ("service recovered  : {0}" -f $recoveredAt.ToString('yyyy-MM-dd HH:mm:ss'))
Write-Host ("total outage       : {0:N1} s (includes drill pauses)" -f ($recoveredAt - $disasterAt).TotalSeconds)
if ($restoreResult) { Write-Host ("automated restore  : {0:N2} s (stop + copy + start + readiness)" -f $restoreResult.rtoSeconds) }
Write-Host ("login A after loss : {0}" -f $loginAAfterLoss)
Write-Host ("login A restored   : {0}" -f $loginAAfterRestore)
Write-Host ("login B (post-RPO) : {0}" -f $loginBAfterRestore)
$pass = ($loginAAfterLoss -eq 401) -and ($loginAAfterRestore -eq 200) -and ($loginBAfterRestore -eq 401)
Write-Host ("DRILL: {0}" -f $(if ($pass) { 'PASS' } else { 'FAIL' }))
if (-not $pass) { exit 1 }
