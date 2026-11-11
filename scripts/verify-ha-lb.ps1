# Task 2 (HA) + Task 3 (Load balancing) verification.
# 1) Shows requests distributed across the Nginx upstream pool.
# 2) Logs in through one instance, kills that instance, and proves the session
#    and the service continue on the remaining instances (shared DB state).
# 3) Restores the lost instance and shows it rejoins the pool.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1
[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$BaseUrl = 'http://127.0.0.1:8080',
    [int]$VictimPort = 3001,
    [int]$Requests = 30,
    [string]$LoginIdentifier = 'iam.demo@siyaj.om',
    [string]$LoginPassword = 'IamDemo1234'
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}
$base = $BaseUrl.TrimEnd('/')
$runDir = Join-Path $Root '.run'

function Get-HealthSample {
    param([int]$Count = 1)
    $samples = @()
    for ($i = 0; $i -lt $Count; $i++) {
        $watch = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $r = Invoke-RestMethod -Uri "$base/healthz" -TimeoutSec 10
            $samples += [pscustomobject]@{ Ok = $true; Instance = [string]$r.instance; Ms = [math]::Round($watch.Elapsed.TotalMilliseconds, 1) }
        } catch {
            $samples += [pscustomobject]@{ Ok = $false; Instance = 'error'; Ms = [math]::Round($watch.Elapsed.TotalMilliseconds, 1) }
        }
    }
    return $samples
}

function Show-Distribution {
    param([object[]]$Samples, [string]$Title)
    Write-Host ''
    Write-Host ("== {0} ==" -f $Title)
    $ok = @($Samples | Where-Object { $_.Ok })
    $failed = @($Samples | Where-Object { -not $_.Ok })
    $Samples | Group-Object Instance | Sort-Object Name | ForEach-Object {
        Write-Host ("  instance {0}: {1} requests" -f $_.Name, $_.Count)
    }
    $avg = if ($ok.Count) { [math]::Round((($ok | Measure-Object Ms -Average).Average), 1) } else { 0 }
    $max = if ($ok.Count) { ($ok | Measure-Object Ms -Maximum).Maximum } else { 0 }
    Write-Host ("  success: {0}/{1} | avg {2} ms | max {3} ms" -f $ok.Count, $Samples.Count, $avg, $max)
    if ($failed.Count) { Write-Host ("  FAILED requests: {0}" -f $failed.Count) }
    return [pscustomobject]@{
        Title = $Title; Total = $Samples.Count; Success = $ok.Count; Failed = $failed.Count
        AvgMs = $avg; MaxMs = $max
        Distribution = (($Samples | Group-Object Instance | Sort-Object Name | ForEach-Object { "{0}:{1}" -f $_.Name, $_.Count }) -join ', ')
    }
}

$summary = New-Object System.Collections.ArrayList

# 1) Baseline distribution
$baseline = Get-HealthSample -Count $Requests
[void]$summary.Add((Show-Distribution -Samples $baseline -Title "Baseline distribution ($Requests requests)"))

# 2) Session issued by the victim instance
Write-Host ''
Write-Host ("== Session continuity (login on 127.0.0.1:{0}, then kill it) ==" -f $VictimPort)
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ identifier = $LoginIdentifier; password = $LoginPassword } | ConvertTo-Json
try {
    $login = Invoke-WebRequest "http://127.0.0.1:$VictimPort/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -WebSession $session -TimeoutSec 20 -UseBasicParsing
    Write-Host ("  login on victim instance: HTTP {0}" -f $login.StatusCode)
} catch {
    Write-Host ("  login failed ({0}); provide -LoginIdentifier/-LoginPassword for an existing account" -f $_.Exception.Message)
}
try {
    $before = Invoke-WebRequest "http://127.0.0.1:$VictimPort/api/account/state" -WebSession $session -TimeoutSec 20 -UseBasicParsing
    Write-Host ("  authenticated call on victim instance: HTTP {0}" -f $before.StatusCode)
} catch {
    Write-Host ("  authenticated call on victim instance failed: {0}" -f $_.Exception.Message)
}

$pidFile = Join-Path $runDir ("api-{0}.pid" -f $VictimPort)
$victimPid = if (Test-Path $pidFile) { Get-Content $pidFile | Select-Object -First 1 } else { '' }
if ($victimPid) {
    Stop-Process -Id ([int]$victimPid) -Force -ErrorAction SilentlyContinue
    Write-Host ("  killed instance {0} (PID {1}) at {2}" -f $VictimPort, $victimPid, (Get-Date).ToString('HH:mm:ss.fff'))
} else {
    Write-Host ("  no PID file for {0}; skipping kill" -f $VictimPort)
}

Start-Sleep -Milliseconds 400
$failover = Get-HealthSample -Count $Requests
[void]$summary.Add((Show-Distribution -Samples $failover -Title "During outage of instance $VictimPort ($Requests requests)"))

# 3) Same cookie through the load balancer after the issuing instance died
try {
    $after = Invoke-WebRequest "$base/api/account/state" -WebSession $session -TimeoutSec 20 -UseBasicParsing
    Write-Host ("  authenticated session via load balancer after kill: HTTP {0}" -f $after.StatusCode)
} catch {
    Write-Host ("  authenticated session via load balancer after kill FAILED: {0}" -f $_.Exception.Message)
}

# 4) Restore
Write-Host ''
Write-Host ("== Restoring instance {0} ==" -f $VictimPort)
$env:PORT = [string]$VictimPort
$outLog = Join-Path $runDir ("api-{0}.log" -f $VictimPort)
$errLog = Join-Path $runDir ("api-{0}.err.log" -f $VictimPort)
$newProcess = Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory $Root `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
Set-Content -Path $pidFile -Value $newProcess.Id
Write-Host ("  started instance {0} (PID {1})" -f $VictimPort, $newProcess.Id)
Start-Sleep -Seconds 3
$recovered = Get-HealthSample -Count ([Math]::Min($Requests, 12))
[void]$summary.Add((Show-Distribution -Samples $recovered -Title "After recovery ($([Math]::Min($Requests,12)) requests)"))

Write-Host ''
Write-Host '== Summary =='
$summary | Format-Table -AutoSize | Out-String | Write-Host
$allGood = ($summary | Where-Object { $_.Failed -gt 0 }).Count -eq 0
if ($allGood) { Write-Host 'RESULT: PASS (zero failed requests)' } else { Write-Host 'RESULT: FAIL (some requests failed)' }
if (-not $allGood) { exit 1 }
