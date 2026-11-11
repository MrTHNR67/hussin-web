# Restore the Siyaj application database from a backup copy and bring the cluster back.
#
# Steps:
#   1) verify the backup is a valid SQLite file
#   2) stop every API instance (no writes during the swap)
#   3) archive the current database (forensics, never delete evidence)
#   4) copy the backup over data/siyaj.sqlite
#   5) start the instances and wait until /readyz reports ready
#   6) print the measured recovery time (RTO) for this drill
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 -Latest
#   powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 -BackupFile backups\siyaj-20261111-171500.sqlite
[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$BackupFile = '',
    [switch]$Latest,
    [int[]]$Ports = @(3001, 3002, 3003),
    [int]$ReadyTimeoutSeconds = 40
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$backupDir = Join-Path $Root 'backups'
$dataDir = Join-Path $Root 'data'
$runDir = Join-Path $Root '.run'
$databaseFile = Join-Path $dataDir 'siyaj.sqlite'
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

if (-not $BackupFile) {
    $candidate = Get-ChildItem -Path $backupDir -Filter 'siyaj-*.sqlite' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if (-not $candidate) { throw "No backups found in $backupDir" }
    $BackupFile = $candidate.FullName
}
if (-not (Test-Path $BackupFile)) { throw "Backup not found: $BackupFile" }

# 1) Validate the backup before touching the live database.
$stream = [System.IO.File]::OpenRead($BackupFile)
try {
    $buffer = New-Object byte[] 16
    [void]$stream.Read($buffer, 0, 16)
} finally {
    $stream.Dispose()
}
if ([System.Text.Encoding]::ASCII.GetString($buffer) -notlike 'SQLite format 3*') {
    throw "Refusing to restore: $BackupFile is not a SQLite database"
}

$startedAt = Get-Date
Write-Host ("Restoring {0}" -f $BackupFile)
Write-Host ("Backup age: {0:N1} minutes" -f ((New-TimeSpan -Start (Get-Item $BackupFile).LastWriteTime -End $startedAt).TotalMinutes))

# 2) Stop the cluster.
$pidFiles = Get-ChildItem -Path $runDir -Filter 'api-*.pid' -ErrorAction SilentlyContinue
foreach ($file in $pidFiles) {
    $processId = Get-Content $file.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($processId -and (Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue)) {
        Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

# 3) Archive the current state (may be a fresh/empty DB after a simulated loss).
if (Test-Path $databaseFile) {
    $archive = Join-Path $dataDir ("siyaj.sqlite.pre-restore-{0}" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    Copy-Item -Path $databaseFile -Destination $archive -Force
    Write-Host ("Archived current database: {0}" -f $archive)
}

# 4) Put the backup in place.
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
Copy-Item -Path $BackupFile -Destination $databaseFile -Force
Write-Host ("Database restored from backup ({0} bytes)" -f (Get-Item $databaseFile).Length)

# 5) Start the instances directly (avoids inheriting a child-process pipe).
foreach ($port in $Ports) {
    $env:PORT = [string]$port
    $outLog = Join-Path $runDir ("api-{0}.log" -f $port)
    $errLog = Join-Path $runDir ("api-{0}.err.log" -f $port)
    $process = Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory $Root `
        -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
    Set-Content -Path (Join-Path $runDir ("api-{0}.pid" -f $port)) -Value $process.Id
    Write-Host ("Started instance {0} (PID {1})" -f $port, $process.Id)
}

# 6) Wait until every instance reports ready.
$deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    $readyCount = 0
    foreach ($port in $Ports) {
        try {
            $response = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/readyz" -f $port) -TimeoutSec 2
            if ($response.status -eq 'ready') { $readyCount += 1 }
        } catch { }
    }
    if ($readyCount -eq $Ports.Count) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
}

$elapsed = [math]::Round(((Get-Date) - $startedAt).TotalSeconds, 2)
if (-not $ready) {
    Write-Host ("RECOVERY_FAILED after {0}s: not all instances reported ready" -f $elapsed)
    exit 1
}

Write-Host ("RECOVERY_OK in {0}s (stop + restore + start + readiness)" -f $elapsed)
Write-Host ("RESTORE_FILE={0}" -f $BackupFile)
Write-Host ("RTO_SECONDS={0}" -f $elapsed)

$result = [pscustomobject]@{
    restoredFrom = $BackupFile
    rtoSeconds   = $elapsed
    finishedAt   = (Get-Date).ToString('o')
    ports        = $Ports
}
$result | ConvertTo-Json | Set-Content -Path (Join-Path $runDir 'last-restore.json') -Encoding utf8
