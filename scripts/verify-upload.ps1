# Upload validation and per-user isolation test.
#
# Proves the controls that answer the InnovationFest failure modes:
#   - oversized uploads are rejected before they reach storage
#   - only whitelisted media types are accepted
#   - file names are sanitised (no path traversal)
#   - one user can never read another user's document
#   - a valid panel image is accepted and returned byte-for-byte
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\verify-upload.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\verify-upload.ps1 -BaseUrl https://siyaj-web.onrender.com
[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:8080',
    [string]$Email = 'demo@siyaj.om',
    [string]$Password = 'DemoPass1234',
    [switch]$SkipOversize
)

$ErrorActionPreference = 'Stop'
$results = New-Object System.Collections.ArrayList

function Add-Result([string]$Name, [bool]$Pass, [string]$Detail) {
    $label = if ($Pass) { 'PASS' } else { 'FAIL' }
    [void]$results.Add([pscustomobject]@{ Test = $Name; Result = $label; Detail = $Detail })
    Write-Host ("[{0}] {1} - {2}" -f $label, $Name, $Detail)
}

function Get-StatusCode($ErrorRecord) {
    try { return [int]$ErrorRecord.Exception.Response.StatusCode } catch { return 0 }
}

function New-Session([string]$Identifier, [string]$Pass) {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $body = @{ identifier = $Identifier; password = $Pass } | ConvertTo-Json
    $response = Invoke-WebRequest "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' `
        -Body $body -WebSession $session -TimeoutSec 90 -UseBasicParsing
    if ($response.StatusCode -ne 200) { throw "login failed for $Identifier" }
    return $session
}

# A real 1x1 PNG.
$png = [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
$mediaId = [guid]::NewGuid().ToString()
$suffix = Get-Random -Minimum 100000 -Maximum 999999

Write-Host "Target: $BaseUrl"

# user A (demo)
$sessionA = New-Session $Email $Password
Add-Result 'login as demo user' $true 'session established'

# 1) valid upload with a path-traversal file name
$uploadUrl = "$BaseUrl/api/account/media/$mediaId" + '?category=panels&name=' + [uri]::EscapeDataString('..\..\evil-panel.png')
try {
    $response = Invoke-WebRequest $uploadUrl -Method Post -ContentType 'image/png' -Body $png `
        -WebSession $sessionA -TimeoutSec 90 -UseBasicParsing
    $file = ($response.Content | ConvertFrom-Json).file
    Add-Result 'valid PNG accepted' ($response.StatusCode -eq 201) "HTTP $($response.StatusCode), $($file.size_bytes) bytes stored"
    Add-Result 'file name sanitised' ($file.name -eq 'evil-panel.png') "stored as '$($file.name)' (traversal stripped)"
} catch {
    Add-Result 'valid PNG accepted' $false "HTTP $(Get-StatusCode $_)"
}

# 2) read it back (download to a file so the bytes are compared exactly)
$tempFile = Join-Path ([System.IO.Path]::GetTempPath()) ("siyaj-upload-{0}.png" -f $mediaId)
try {
    $download = Invoke-WebRequest "$BaseUrl/api/account/media/$mediaId" -WebSession $sessionA -TimeoutSec 90 `
        -UseBasicParsing -OutFile $tempFile
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $expected = -join ($sha.ComputeHash($png) | ForEach-Object { $_.ToString('x2') })
    $same = (Get-FileHash $tempFile -Algorithm SHA256).Hash.ToLower() -eq $expected
    $readStatus = if ($download -and $download.StatusCode) { [int]$download.StatusCode } else { 200 }
    Add-Result 'owner can read the file' ($readStatus -eq 200 -and $same) "HTTP $readStatus, bytes identical: $same"
} catch {
    Add-Result 'owner can read the file' $false "HTTP $(Get-StatusCode $_)"
} finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
}

# 3) wrong content type
try {
    $r = Invoke-WebRequest "$BaseUrl/api/account/media/$([guid]::NewGuid())?category=panels&name=script.txt" `
        -Method Post -ContentType 'text/plain' -Body 'not an image' -WebSession $sessionA -TimeoutSec 90 -UseBasicParsing
    Add-Result 'wrong MIME type rejected' $false "HTTP $($r.StatusCode) - accepted"
} catch {
    $code = Get-StatusCode $_
    Add-Result 'wrong MIME type rejected' ($code -eq 400 -or $code -eq 415) "HTTP $code"
}

# 4) invalid category
try {
    $r = Invoke-WebRequest "$BaseUrl/api/account/media/$([guid]::NewGuid())?category=../../etc&name=x.png" `
        -Method Post -ContentType 'image/png' -Body $png -WebSession $sessionA -TimeoutSec 90 -UseBasicParsing
    Add-Result 'invalid category rejected' $false "HTTP $($r.StatusCode) - accepted"
} catch {
    $code = Get-StatusCode $_
    Add-Result 'invalid category rejected' ($code -eq 400) "HTTP $code"
}

# 5) another user cannot read user A's file
$sessionB = $null
try {
    $body = @{ username = "iso_$suffix"; email = "iso.$suffix@siyaj.om"; phone = "+9688$suffix"; password = 'IsoTest1234' } | ConvertTo-Json
    $signupSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $signup = Invoke-WebRequest "$BaseUrl/api/auth/signup" -Method Post -ContentType 'application/json' -Body $body `
        -WebSession $signupSession -TimeoutSec 90 -UseBasicParsing
    $sessionB = New-Session "iso.$suffix@siyaj.om" 'IsoTest1234'
    Add-Result 'second user created' ($signup.StatusCode -eq 201) "HTTP $($signup.StatusCode)"
} catch {
    Add-Result 'second user created' $false "HTTP $(Get-StatusCode $_)"
}
if ($sessionB) {
    try {
        $r = Invoke-WebRequest "$BaseUrl/api/account/media/$mediaId" -WebSession $sessionB -TimeoutSec 90 -UseBasicParsing
        Add-Result 'cross-user read blocked' $false "HTTP $($r.StatusCode) - leaked another user's document"
    } catch {
        $code = Get-StatusCode $_
        Add-Result 'cross-user read blocked' ($code -eq 404) "HTTP $code (not found, no existence leak)"
    }
}

# 6) oversized upload rejected before storage
if (-not $SkipOversize) {
    $big = New-Object byte[] (25 * 1024 * 1024 + 1024)
    [Array]::Clear($big, 0, $big.Length)
    $big[0] = 0x89; $big[1] = 0x50; $big[2] = 0x4E; $big[3] = 0x47
    try {
        $r = Invoke-WebRequest "$BaseUrl/api/account/media/$([guid]::NewGuid())?category=panels&name=big.png" `
            -Method Post -ContentType 'image/png' -Body $big -WebSession $sessionA -TimeoutSec 240 -UseBasicParsing
        Add-Result 'oversize upload rejected' $false "HTTP $($r.StatusCode) - accepted 25MB+"
    } catch {
        $code = Get-StatusCode $_
        Add-Result 'oversize upload rejected' ($code -eq 413) "HTTP $code (limit 25 MB)"
    }
}

# 7) cleanup the accepted file
try {
    $r = Invoke-WebRequest "$BaseUrl/api/account/media/$mediaId" -Method Delete -WebSession $sessionA -TimeoutSec 90 -UseBasicParsing
    $deleted = ($r.Content | ConvertFrom-Json).deleted
    Add-Result 'owner can delete the file' ($r.StatusCode -eq 200 -and $deleted) "HTTP $($r.StatusCode)"
} catch {
    Add-Result 'owner can delete the file' $false "HTTP $(Get-StatusCode $_)"
}

Write-Host ''
$failed = @($results | Where-Object { $_.Result -eq 'FAIL' }).Count
Write-Host ("upload checks: {0} passed, {1} failed" -f ($results.Count - $failed), $failed)
if ($failed -gt 0) { exit 1 }
