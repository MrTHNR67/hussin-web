# Basic service-health and resource/load metrics sampler for the Siyaj demo stack.
# Reads application health endpoints, Nginx stub_status (loopback-only, port 8081)
# and the total CPU/memory of the Node instance pool, then writes a CSV time series.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\monitor.ps1 -DurationSeconds 30
#   powershell -ExecutionPolicy Bypass -File scripts\monitor.ps1 -DurationSeconds 60 -IntervalSeconds 1
[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:8080',
    [string]$StatusUrl = 'http://127.0.0.1:8081/nginx_status',
    [int]$DurationSeconds = 30,
    [int]$IntervalSeconds = 2,
    [string]$OutFile = ''
)

$ErrorActionPreference = 'Stop'
$base = $BaseUrl.TrimEnd('/')
$scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$root = Split-Path -Parent $scriptDirectory
if (-not $OutFile) {
    $OutFile = Join-Path (Join-Path $root '.run') 'metrics.csv'
}
$outDir = Split-Path -Parent $OutFile
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

$cores = [Environment]::ProcessorCount
$inv = [System.Globalization.CultureInfo]::InvariantCulture
$rows = New-Object System.Collections.ArrayList

function Get-NginxStatus {
    try {
        $text = (Invoke-WebRequest $StatusUrl -TimeoutSec 5 -UseBasicParsing).Content
        $active = if ($text -match 'Active connections:\s*(\d+)') { [int]$matches[1] } else { $null }
        $total = $null
        if ($text -match '(?m)^\s*(\d+)\s+(\d+)\s+(\d+)\s*$') { $total = [int]$matches[3] }
        return @{ Active = $active; TotalRequests = $total }
    } catch {
        return @{ Active = $null; TotalRequests = $null }
    }
}

function Get-PoolStats {
    $runDir = Join-Path $root '.run'
    $procs = @()
    if (Test-Path $runDir) {
        Get-ChildItem -Path $runDir -Filter 'api-*.pid' -ErrorAction SilentlyContinue | ForEach-Object {
            $processId = Get-Content $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($processId) {
                $process = Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue
                if ($process -and $process.ProcessName -eq 'node') { $procs += $process }
            }
        }
    }
    $cpuSeconds = 0.0
    $memoryMb = 0.0
    foreach ($p in $procs) {
        $cpuSeconds += [double]$p.CPU
        $memoryMb += [double]$p.WorkingSet64 / 1MB
    }
    return @{ Count = $procs.Count; CpuSeconds = $cpuSeconds; MemoryMb = $memoryMb }
}

$started = Get-Date
$deadline = $started.AddSeconds($DurationSeconds)
$prevCpu = (Get-PoolStats).CpuSeconds
$prevRequests = (Get-NginxStatus).TotalRequests
$prevAt = Get-Date

Write-Host ("Monitoring {0} every {1}s for {2}s (CPU cores: {3})" -f $base, $IntervalSeconds, $DurationSeconds, $cores)
Write-Host ("Writing {0}" -f $OutFile)

while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds $IntervalSeconds
    $now = Get-Date

    $watch = [System.Diagnostics.Stopwatch]::StartNew()
    $healthOk = $true
    $instance = ''
    try {
        $health = Invoke-RestMethod -Uri "$base/healthz" -TimeoutSec 5
        $instance = [string]$health.instance
    } catch { $healthOk = $false }
    $healthMs = [math]::Round($watch.Elapsed.TotalMilliseconds, 1)

    $readyOk = $true
    try { Invoke-RestMethod -Uri "$base/readyz" -TimeoutSec 5 | Out-Null } catch { $readyOk = $false }

    $pool = Get-PoolStats
    $status = Get-NginxStatus

    $elapsed = ($now - $prevAt).TotalSeconds
    $cpuPercent = if ($elapsed -gt 0) { (($pool.CpuSeconds - $prevCpu) / $elapsed / $cores) * 100 } else { 0 }
    $rps = if ($status.TotalRequests -ne $null -and $prevRequests -ne $null -and $elapsed -gt 0) {
        ($status.TotalRequests - $prevRequests) / $elapsed
    } else { $null }

    $row = [pscustomobject]@{
        timestamp      = $now.ToString('yyyy-MM-dd HH:mm:ss')
        health_ok      = [int]$healthOk
        health_ms      = $healthMs
        ready_ok       = [int]$readyOk
        instance       = $instance
        instances      = $pool.Count
        cpu_percent    = [math]::Round($cpuPercent, 1)
        memory_mb      = [math]::Round($pool.MemoryMb, 0)
        active_conns   = $status.Active
        requests_per_s = if ($rps -ne $null) { [math]::Round($rps, 1) } else { $null }
    }
    [void]$rows.Add($row)
    $rpsText = if ($row.requests_per_s -ne $null) { $row.requests_per_s } else { '-' }
    Write-Host ("[{0}] health={1} {2}ms ready={3} replicas={4} cpu={5}% mem={6}MB rps={7} conns={8}" -f `
        $row.timestamp, $row.health_ok, $row.health_ms, $row.ready_ok, $row.instances, $row.cpu_percent, $row.memory_mb, $rpsText, $row.active_conns)

    $prevCpu = $pool.CpuSeconds
    $prevRequests = $status.TotalRequests
    $prevAt = $now
}

$rows | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8

$healthFailures = @($rows | Where-Object { $_.health_ok -eq 0 }).Count
$rpsValues = @($rows | Where-Object { $_.requests_per_s -ne $null } | ForEach-Object { [double]$_.requests_per_s })
$cpuValues = @($rows | ForEach-Object { [double]$_.cpu_percent })
$healthMsValues = @($rows | ForEach-Object { [double]$_.health_ms })

Write-Host ''
Write-Host '== Summary =='
Write-Host ("samples: {0} | health failures: {1}" -f $rows.Count, $healthFailures)
if ($rpsValues.Count) {
    Write-Host ("requests/s: avg {0} | max {1}" -f [math]::Round((($rpsValues | Measure-Object -Average).Average), 1), ($rpsValues | Measure-Object -Maximum).Maximum)
}
Write-Host ("cpu %:     avg {0} | max {1}" -f [math]::Round((($cpuValues | Measure-Object -Average).Average), 1), ($cpuValues | Measure-Object -Maximum).Maximum)
Write-Host ("health ms: avg {0} | max {1}" -f [math]::Round((($healthMsValues | Measure-Object -Average).Average), 1), ($healthMsValues | Measure-Object -Maximum).Maximum)
Write-Host ("CSV: {0}" -f $OutFile)
