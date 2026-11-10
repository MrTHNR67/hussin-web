# Load test against the load balancer (or a single instance).
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\load-test.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\load-test.ps1 -Url http://localhost:8080/readyz -Connections 200 -Duration 30
[CmdletBinding()]
param(
    [string]$Url = 'http://localhost:8080/readyz',
    [int]$Connections = 100,
    [int]$Duration = 20
)

Write-Host ("autocannon {0}  (connections={1}, duration={2}s)" -f $Url, $Connections, $Duration)
Write-Host 'Tip: run "Get-Process node" in a second window to watch replicas.'
npx --yes autocannon -c $Connections -d $Duration $Url
