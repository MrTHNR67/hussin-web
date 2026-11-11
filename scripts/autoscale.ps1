# Siyaj auto-scaler (local demonstration of a scaling policy).
#
# Policy
#   scale out : average latency > -HighMs  for -Samples consecutive samples
#   scale in  : average latency < -LowMs   for -Samples consecutive samples
#   bounds    : -MinInstances .. -MaxInstances, one decision per cooldown
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\autoscale.ps1 -NginxDir C:\nginx
#   powershell -ExecutionPolicy Bypass -File scripts\autoscale.ps1 -Iterations 5 -HighMs 50 -LowMs 10
[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$Url = 'http://localhost:8080/readyz',
    [string]$NginxDir = '',
    [int]$MinInstances = 2,
    [int]$MaxInstances = 5,
    [int]$FirstPort = 3001,
    [int]$HighMs = 400,
    [int]$LowMs = 150,
    [int]$Samples = 6,
    [int]$SampleRequests = 3,
    [int]$IntervalSeconds = 5,
    [int]$Iterations = 0
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$runDir = Join-Path $Root '.run'
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Get-ActiveInstances {
    $instances = @()
    if (-not (Test-Path $runDir)) { return $instances }
    Get-ChildItem -Path $runDir -Filter 'api-*.pid' -ErrorAction SilentlyContinue | ForEach-Object {
        $port = 0
        [void][int]::TryParse(($_.BaseName -replace '^api-', ''), [ref]$port)
        $processId = Get-Content $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($port -gt 0 -and $processId -and (Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue)) {
            $instances += [pscustomobject]@{ Port = $port; ProcessId = [int]$processId }
        }
    }
    return @($instances | Sort-Object Port)
}

function Start-Instance([int]$Port) {
    $env:PORT = [string]$Port
    $outLog = Join-Path $runDir ("api-{0}.log" -f $Port)
    $errLog = Join-Path $runDir ("api-{0}.err.log" -f $Port)
    $process = Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory $Root `
        -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
    Set-Content -Path (Join-Path $runDir ("api-{0}.pid" -f $Port)) -Value $process.Id
    Write-Host ("  + started instance on {0} (PID {1})" -f $Port, $process.Id)
}

function Stop-Instance([int]$Port) {
    $pidFile = Join-Path $runDir ("api-{0}.pid" -f $Port)
    if (-not (Test-Path $pidFile)) { return }
    $processId = Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($processId) { Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    Write-Host ("  - stopped instance on {0}" -f $Port)
}

function Wait-Ready([int]$Port, [int]$TimeoutSeconds = 15) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-RestMethod -Uri ("http://127.0.0.1:{0}/readyz" -f $Port) -TimeoutSec 2
            if ($response.status -eq 'ready') { return $true }
        } catch { }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Write-NginxConfig([int[]]$Ports) {
    if (-not $NginxDir) {
        Write-Host '  (nginx not updated: pass -NginxDir C:\nginx to rewrite the upstream list)'
        return
    }
    $exe = Join-Path $NginxDir 'nginx.exe'
    if (-not (Test-Path $exe)) {
        Write-Warning "nginx.exe not found in $NginxDir"
        return
    }
    $upstreamLines = ($Ports | ForEach-Object { "        server 127.0.0.1:$_ max_fails=3 fail_timeout=15s;" }) -join "`r`n"
    $config = @"
worker_processes 1;
events { worker_connections 1024; }
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    client_max_body_size 30m;

    upstream siyaj_upstream {
        least_conn;
$upstreamLines
    }

    server {
        listen 8080;
        server_name localhost;
        location = /nginx_status { return 404; }
        location / {
            proxy_pass http://siyaj_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            proxy_next_upstream error timeout http_502 http_503;
        }
    }

    # Monitoring endpoint: loopback only, never exposed through the public listener.
    server {
        listen 127.0.0.1:8081;
        server_name localhost;
        location /nginx_status {
            stub_status;
            allow 127.0.0.1;
            deny all;
        }
        location / { return 404; }
    }
}
"@
    Set-Content -Path (Join-Path (Join-Path $NginxDir 'conf') 'nginx.conf') -Value $config -Encoding ascii
    Push-Location $NginxDir
    try {
        & $exe -p "$NginxDir\" -c 'conf/nginx.conf' -s reload 2>&1 | Out-Null
    } catch {
        Write-Warning "nginx reload failed: $($_.Exception.Message)"
    } finally {
        Pop-Location
    }
    Write-Host ("  nginx upstream -> {0}" -f ($Ports -join ', '))
}

function Measure-AverageLatency {
    $total = 0.0
    $count = 0
    for ($i = 0; $i -lt $SampleRequests; $i += 1) {
        $watch = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 | Out-Null
            $total += $watch.Elapsed.TotalMilliseconds
            $count += 1
        } catch {
            $total += 5000
            $count += 1
        }
    }
    if ($count -eq 0) { return 0 }
    return [math]::Round($total / $count, 1)
}

$instances = Get-ActiveInstances
if ($instances.Count -eq 0) {
    Write-Host 'No running instances. Starting the minimum...'
    for ($i = 0; $i -lt $MinInstances; $i += 1) { Start-Instance ($FirstPort + $i) }
    $instances = Get-ActiveInstances
}
Write-NginxConfig ($instances | ForEach-Object { $_.Port })

$highStreak = 0
$lowStreak = 0
$iteration = 0

while ($true) {
    $iteration += 1
    $latency = Measure-AverageLatency
    $instances = Get-ActiveInstances
    $count = $instances.Count
    Write-Host ("[{0}] avg={1}ms replicas={2}" -f (Get-Date -Format 'HH:mm:ss'), $latency, $count)

    if ($latency -gt $HighMs) { $highStreak += 1 } else { $highStreak = 0 }
    if ($latency -lt $LowMs) { $lowStreak += 1 } else { $lowStreak = 0 }

    if ($highStreak -ge $Samples -and $count -lt $MaxInstances) {
        $used = @($instances | ForEach-Object { $_.Port })
        $nextPort = $FirstPort
        while ($used -contains $nextPort) { $nextPort += 1 }
        Write-Host ("  scale-out: average latency exceeded {0}ms for {1} samples" -f $HighMs, $Samples)
        Start-Instance $nextPort
        $ready = Wait-Ready $nextPort 15
        if (-not $ready) { Write-Warning ("  instance on {0} did not become ready in time" -f $nextPort) }
        Write-NginxConfig (@(Get-ActiveInstances | ForEach-Object { $_.Port }))
        $highStreak = 0
    } elseif ($lowStreak -ge $Samples -and $count -gt $MinInstances) {
        $last = $instances | Select-Object -Last 1
        Write-Host ("  scale-in: latency below {0}ms for {1} samples" -f $LowMs, $Samples)
        Stop-Instance $last.Port
        Write-NginxConfig (@(Get-ActiveInstances | ForEach-Object { $_.Port }))
        $lowStreak = 0
    }

    if ($Iterations -gt 0 -and $iteration -ge $Iterations) { break }
    Start-Sleep -Seconds $IntervalSeconds
}

Write-Host 'Auto-scaler finished.'
