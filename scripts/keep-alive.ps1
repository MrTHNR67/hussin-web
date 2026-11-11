# Keeps the Siyaj demo stack alive: API instances, Nginx and the public tunnel.
# Designed to run as a Windows scheduled task at startup (SYSTEM).
[CmdletBinding()]
param(
    [int]$IntervalSeconds = 60,
    [string]$Root = '',
    [string]$NginxDir = 'C:\nginx',
    [string]$Cloudflared = 'C:\Program Files (x86)\cloudflared\cloudflared.exe',
    [int]$PublicPort = 8080
)

if (-not $Root) {
    $scriptDirectory = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $Root = Split-Path -Parent $scriptDirectory
}

$runDir = Join-Path $Root '.run'
New-Item -ItemType Directory -Force -Path $runDir | Out-Null
$logPath = Join-Path $runDir 'keep-alive.log'
$urlPath = Join-Path $runDir 'public-url.txt'
$cloudflaredLog = Join-Path $runDir 'cloudflared.log'

function Write-Log([string]$Message) {
    $line = '{0} {1}' -f (Get-Date).ToString('s'), $Message
    Add-Content -Path $logPath -Value $line -Encoding utf8
    Write-Host $line
}

function Test-Port([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $task = $client.ConnectAsync('127.0.0.1', $Port)
        if ($task.Wait(700) -and $client.Connected) { return $true }
    } catch { }
    finally { $client.Dispose() }
    return $false
}

function Ensure-Cluster {
    $missing = @(3001, 3002, 3003 | Where-Object { -not (Test-Port $_) })
    if ($missing.Count -eq 0) { return }
    Write-Log ("restarting API instances for ports: {0}" -f ($missing -join ','))
    & (Join-Path $Root 'scripts\start-cluster.ps1') *> $null
}

function Ensure-Nginx {
    if (Test-Port $PublicPort) { return }
    Write-Log 'starting nginx'
    if (Test-Path (Join-Path $NginxDir 'nginx.exe')) {
        Start-Process -FilePath (Join-Path $NginxDir 'nginx.exe') -ArgumentList '-p', ($NginxDir + '\') -WindowStyle Hidden
    } else {
        Write-Log "nginx not found at $NginxDir"
    }
}

function Get-TunnelUrl {
    if (-not (Test-Path $cloudflaredLog)) { return $null }
    $match = Get-Content $cloudflaredLog -ErrorAction SilentlyContinue |
        Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches |
        ForEach-Object { $_.Matches.Value } |
        Select-Object -Last 1
    return $match
}

function Ensure-Tunnel {
    if (Get-Process cloudflared -ErrorAction SilentlyContinue) {
        $url = Get-TunnelUrl
        if ($url -and -not (Test-Path $urlPath)) {
            Set-Content -Path $urlPath -Value $url -Encoding utf8
            Write-Log "public url: $url"
        }
        return
    }
    Write-Log 'starting cloudflare tunnel'
    if (-not (Test-Path $Cloudflared)) { Write-Log "cloudflared not found at $Cloudflared"; return }
    Start-Process -FilePath $Cloudflared -WindowStyle Hidden -ArgumentList @(
        'tunnel', '--url', "http://127.0.0.1:$PublicPort", '--no-autoupdate', '--loglevel', 'info', '--logfile', $cloudflaredLog
    )
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 2
        $url = Get-TunnelUrl
        if ($url) {
            Set-Content -Path $urlPath -Value $url -Encoding utf8
            Write-Log "public url: $url"
            return
        }
    }
    Write-Log 'tunnel started but no url yet'
}

Write-Log 'siyaj keep-alive started'
while ($true) {
    try {
        Ensure-Cluster
        Ensure-Nginx
        Ensure-Tunnel
        if (Test-Path $urlPath) {
            $current = (Get-Content $urlPath -First 1).Trim()
            $latest = Get-TunnelUrl
            if ($latest -and $latest -ne $current) {
                Set-Content -Path $urlPath -Value $latest -Encoding utf8
                Write-Log "public url changed: $latest"
            }
        }
        if ((Test-Path $logPath) -and ((Get-Item $logPath).Length -gt 5MB)) {
            Set-Content -Path $logPath -Value '' -Encoding utf8
        }
    } catch {
        Write-Log ("error: {0}" -f $_.Exception.Message)
    }
    Start-Sleep -Seconds $IntervalSeconds
}
