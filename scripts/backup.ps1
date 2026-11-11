# Backup the Siyaj application database (SQLite file used by the local/demo stack).
# - online-safe: copies the persisted database file (sql.js writes it on every mutation)
# - verifies the SQLite header before keeping the copy
# - records timestamp, size and SHA-256 in backups/backup-log.csv
# - applies a retention count
#
# For the managed Postgres deployment on Render use pg_dump (see docs/evidence/task5-dr.md);
# this script is the equivalent logical backup for the self-contained demo stack.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Keep 48
[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$BackupDir = '',
    [string]$DatabaseFile = '',
    [int]$Keep = 24
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
if (-not $BackupDir) { $BackupDir = Join-Path $Root 'backups' }
if (-not $DatabaseFile) { $DatabaseFile = Join-Path (Join-Path $Root 'data') 'siyaj.sqlite' }

if (-not (Test-Path $DatabaseFile)) {
    throw "Database file not found: $DatabaseFile"
}
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dest = Join-Path $BackupDir ("siyaj-{0}.sqlite" -f $stamp)
Copy-Item -Path $DatabaseFile -Destination $dest -Force

# Verify it really is a SQLite database before we trust the backup.
$stream = [System.IO.File]::OpenRead($dest)
try {
    $buffer = New-Object byte[] 16
    [void]$stream.Read($buffer, 0, 16)
} finally {
    $stream.Dispose()
}
$header = [System.Text.Encoding]::ASCII.GetString($buffer)
if ($header -notlike 'SQLite format 3*') {
    Remove-Item $dest -Force -ErrorAction SilentlyContinue
    throw "Backup verification failed: $dest is not a SQLite database"
}

$size = (Get-Item $dest).Length
$hash = (Get-FileHash -Path $dest -Algorithm SHA256).Hash
$logPath = Join-Path $BackupDir 'backup-log.csv'
if (-not (Test-Path $logPath)) {
    Set-Content -Path $logPath -Value 'timestamp,file,bytes,sha256,source' -Encoding utf8
}
$line = '{0},{1},{2},{3},{4}' -f (Get-Date).ToString('o'), (Split-Path -Leaf $dest), $size, $hash, $DatabaseFile
Add-Content -Path $logPath -Value $line -Encoding utf8

# Retention: keep the newest N backups.
$old = Get-ChildItem -Path $BackupDir -Filter 'siyaj-*.sqlite' |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip $Keep
foreach ($file in $old) { Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue }

Write-Host ("BACKUP_FILE={0}" -f $dest)
Write-Host ("BACKUP_BYTES={0}" -f $size)
Write-Host ("BACKUP_SHA256={0}" -f $hash)
Write-Host ("BACKUP_LOG={0}" -f $logPath)
Write-Host ("BACKUPS_RETAINED={0}" -f ((Get-ChildItem -Path $BackupDir -Filter 'siyaj-*.sqlite').Count))
