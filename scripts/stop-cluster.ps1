# Stop every Siyaj API instance started by start-cluster.ps1.
[CmdletBinding()]
param(
    [string]$Root = ''
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$runDir = Join-Path $Root '.run'
if (-not (Test-Path $runDir)) {
    Write-Host 'Nothing to stop (.run folder not found).'
    return
}

$pidFiles = Get-ChildItem -Path $runDir -Filter 'api-*.pid' -ErrorAction SilentlyContinue
if (-not $pidFiles) {
    Write-Host 'Nothing to stop (no PID files).'
    return
}

foreach ($file in $pidFiles) {
    $processId = Get-Content $file.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($processId -and (Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue)) {
        Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
        Write-Host ("Stopped PID {0} ({1})" -f $processId, $file.BaseName)
    }
    Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
}
Write-Host 'Cluster stopped.'
