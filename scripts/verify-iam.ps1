# Task 6 verification: unauthenticated denial, RBAC denial, security headers, lockout.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1 -BaseUrl https://siyaj-web.onrender.com
#   powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1 -IncludeLockout
[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:8080',
    [switch]$IncludeLockout
)

$ErrorActionPreference = 'Stop'
$base = $BaseUrl.TrimEnd('/')
$results = New-Object System.Collections.ArrayList

function Invoke-Capture {
    param([scriptblock]$Action)
    try {
        $r = & $Action
        return @{ Code = [int]$r.StatusCode; Body = [string]$r.Content }
    } catch {
        $code = 0
        try { $code = [int]$_.Exception.Response.StatusCode } catch { }
        $body = ''
        try {
            $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
        } catch { }
        return @{ Code = $code; Body = $body }
    }
}

function Add-Check {
    param([string]$Name, [int]$Expected, [int]$Actual, [string]$Note = '')
    $ok = ($Actual -eq $Expected)
    [void]$results.Add([pscustomobject]@{ Check = $Name; Expected = $Expected; Actual = $Actual; Pass = $ok; Note = $Note })
    $mark = if ($ok) { 'PASS' } else { 'FAIL' }
    Write-Host ("[{0}] {1} (expected {2}, got {3}) {4}" -f $mark, $Name, $Expected, $Actual, $Note)
}

Write-Host ("Target: {0}" -f $base)
Write-Host ("Time:   {0}" -f (Get-Date).ToString('yyyy-MM-dd HH:mm:ssK'))
Write-Host ''

# 1) No session -> admin API must be denied
$unauth = Invoke-Capture { Invoke-WebRequest "$base/api/admin/stats" -TimeoutSec 30 -UseBasicParsing }
Add-Check 'unauthenticated admin API' 401 $unauth.Code

# 2) Normal user -> admin API must be forbidden
$suffix = Get-Random -Minimum 100000 -Maximum 999999
$signupBody = @{
    username = "verify_$suffix"
    email    = "verify_$suffix@example.com"
    phone    = "+9689$suffix"
    password = 'VerifyPass1234'
} | ConvertTo-Json
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$signup = Invoke-Capture { Invoke-WebRequest "$base/api/auth/signup" -Method Post -ContentType 'application/json' -Body $signupBody -WebSession $session -TimeoutSec 30 -UseBasicParsing }
$signupNote = if ($signup.Code -eq 409) { 'account already exists; continuing' } else { '' }
Write-Host ("[INFO] signup HTTP {0} {1}" -f $signup.Code, $signupNote)

if ($signup.Code -in 201, 409) {
    if ($signup.Code -eq 409) {
        $loginBody = @{ identifier = "verify_$suffix@example.com"; password = 'VerifyPass1234' } | ConvertTo-Json
        $login = Invoke-Capture { Invoke-WebRequest "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -WebSession $session -TimeoutSec 30 -UseBasicParsing }
        Write-Host ("[INFO] login HTTP {0}" -f $login.Code)
    }
    $nonAdmin = Invoke-Capture { Invoke-WebRequest "$base/api/admin/stats" -WebSession $session -TimeoutSec 30 -UseBasicParsing }
    Add-Check 'non-admin admin API' 403 $nonAdmin.Code
} else {
    Add-Check 'signup for RBAC test' 201 $signup.Code
}

# 3) Security headers
$page = Invoke-Capture { Invoke-WebRequest "$base/" -TimeoutSec 30 -UseBasicParsing }
$headers = $null
try { $headers = (Invoke-WebRequest "$base/" -TimeoutSec 30 -UseBasicParsing).Headers } catch { }
if ($headers) {
    $required = @(
        @{ Key = 'content-security-policy'; Label = 'CSP' },
        @{ Key = 'x-frame-options'; Label = 'X-Frame-Options' },
        @{ Key = 'x-content-type-options'; Label = 'X-Content-Type-Options' },
        @{ Key = 'referrer-policy'; Label = 'Referrer-Policy' }
    )
    foreach ($item in $required) {
        $value = $headers[$item.Key]
        $present = [bool]$value
        [void]$results.Add([pscustomobject]@{ Check = "header $($item.Label)"; Expected = 1; Actual = [int]$present; Pass = $present; Note = '' })
        $mark = if ($present) { 'PASS' } else { 'FAIL' }
        Write-Host ("[{0}] header {1}" -f $mark, $item.Label)
    }
    $poweredBy = $headers['x-powered-by']
    [void]$results.Add([pscustomobject]@{ Check = 'header X-Powered-By absent'; Expected = 0; Actual = [int][bool]$poweredBy; Pass = (-not $poweredBy); Note = '' })
    Write-Host ("[{0}] header X-Powered-By absent" -f $(if ($poweredBy) { 'FAIL' } else { 'PASS' }))
    $hsts = $headers['strict-transport-security']
    if ($base.StartsWith('https://')) {
        [void]$results.Add([pscustomobject]@{ Check = 'header HSTS (HTTPS target)'; Expected = 1; Actual = [int][bool]$hsts; Pass = [bool]$hsts; Note = '' })
        Write-Host ("[{0}] header HSTS (HTTPS target)" -f $(if ($hsts) { 'PASS' } else { 'FAIL' }))
    }
}

# 4) Optional: account lockout after repeated failures
if ($IncludeLockout) {
    $lockId = "lock_$suffix@example.com"
    $lockBody = @{ identifier = $lockId; password = 'wrong-password' } | ConvertTo-Json
    $last = 0
    for ($i = 1; $i -le 11; $i++) {
        $attempt = Invoke-Capture { Invoke-WebRequest "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $lockBody -TimeoutSec 30 -UseBasicParsing }
        $last = $attempt.Code
        if ($last -eq 429) { break }
    }
    Add-Check 'lockout returns 429' 429 $last
}

Write-Host ''
$failed = @($results | Where-Object { -not $_.Pass })
Write-Host ("Summary: {0} passed, {1} failed, {2} total" -f ($results.Count - $failed.Count), $failed.Count, $results.Count)
if ($failed.Count -gt 0) { exit 1 }
exit 0
