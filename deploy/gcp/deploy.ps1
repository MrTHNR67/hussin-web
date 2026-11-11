[CmdletBinding()]
param(
  [string]$Project = '',
  [string]$Region = 'me-central2',
  [string]$Prefix = 'siyaj',
  [string]$RepoUrl = 'https://github.com/MrTHNR67/hussin-web.git',
  [string]$AdminEmails = '',
  [int]$MinInstances = 2,
  [int]$MaxInstances = 5,
  [string]$MachineType = 'e2-small'
)

$ErrorActionPreference = 'Continue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildDir = Join-Path $here '.build'
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

function Section([string]$Title) { Write-Host "`n=== $Title ===" -ForegroundColor Cyan }
function Invoke-Step([string]$Label, [scriptblock]$Action) {
  Write-Host "-> $Label" -ForegroundColor Yellow
  & $Action
  if ($LASTEXITCODE -ne 0) { throw "FAILED: $Label (exit $LASTEXITCODE)" }
}
function New-Secret([int]$Length = 24) {
  $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  -join (1..$Length | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

Section '0. Pre-flight'
Invoke-Step 'verify gcloud authentication' { gcloud auth list --filter=status:ACTIVE --format="value(account)" }
if (-not $Project) { $Project = (gcloud config get-value project 2>$null | Out-String).Trim() }
if (-not $Project -or $Project -eq '(unset)') {
  throw 'No project selected. Run: gcloud config set project <PROJECT_ID>'
}
Write-Host "Project: $Project"
Write-Host "Region : $Region"

$vpc = "$Prefix-vpc"
$subnetApp = "$Prefix-snet-app"
$subnetMgmt = "$Prefix-snet-mgmt"
$router = "$Prefix-router"
$nat = "$Prefix-nat"
$psaRange = "$Prefix-psa"
$sql = "$Prefix-pg"
$sqlDb = 'siyaj'
$sqlUser = 'siyajadmin'
$saName = "$Prefix-vm"
$sa = "$saName@$Project.iam.gserviceaccount.com"
$template = "$Prefix-template"
$mig = "$Prefix-mig"
$hc = "$Prefix-hc"
$backend = "$Prefix-backend"
$urlmap = "$Prefix-urlmap"
$proxy = "$Prefix-http-proxy"
$ipName = "$Prefix-lb-ip"
$fr = "$Prefix-http"

Section '1. Enable required APIs'
Invoke-Step 'enable services' {
  gcloud services enable compute.googleapis.com sqladmin.googleapis.com `
    servicenetworking.googleapis.com monitoring.googleapis.com logging.googleapis.com
}

Section '2. VPC, subnets and routing'
Invoke-Step 'create custom VPC' { gcloud compute networks create $vpc --subnet-mode=custom }
Invoke-Step 'create app subnet (private, no external IPs)' {
  gcloud compute networks subnets create $subnetApp --network=$vpc --region=$Region --range=10.20.2.0/24
}
Invoke-Step 'create management subnet (IAP only)' {
  gcloud compute networks subnets create $subnetMgmt --network=$vpc --region=$Region --range=10.20.4.0/24
}
Invoke-Step 'create Cloud Router + NAT (egress only)' {
  gcloud compute routers create $router --network=$vpc --region=$Region
  gcloud compute routers nats create $nat --router=$router --region=$Region `
    --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges
}

Section '3. Firewall rules'
Invoke-Step 'allow load balancer + health checks to port 3000' {
  gcloud compute firewall-rules create "$Prefix-allow-lb" --network=$vpc --direction=INGRESS `
    --action=ALLOW --rules=tcp:3000 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=$Prefix-app
}
Invoke-Step 'allow internal traffic on 3000' {
  gcloud compute firewall-rules create "$Prefix-allow-internal" --network=$vpc --direction=INGRESS `
    --action=ALLOW --rules=tcp:3000 --source-ranges=10.20.0.0/16 --target-tags=$Prefix-app --priority=1100
}
Invoke-Step 'allow SSH only through IAP' {
  gcloud compute firewall-rules create "$Prefix-allow-iap" --network=$vpc --direction=INGRESS `
    --action=ALLOW --rules=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=$Prefix-app --priority=900
}
Invoke-Step 'deny SSH from the Internet' {
  gcloud compute firewall-rules create "$Prefix-deny-ssh" --network=$vpc --direction=INGRESS `
    --action=DENY --rules=tcp:22 --source-ranges=0.0.0.0/0 --target-tags=$Prefix-app --priority=1000
}
Invoke-Step 'deny PostgreSQL from the Internet' {
  gcloud compute firewall-rules create "$Prefix-deny-db" --network=$vpc --direction=INGRESS `
    --action=DENY --rules=tcp:5432 --source-ranges=0.0.0.0/0 --priority=1000
}

Section '4. Private services access for Cloud SQL'
Invoke-Step 'allocate private range 10.30.0.0/16' {
  gcloud compute addresses create $psaRange --global --purpose=VPC_PEERING --prefix-length=16 --network=$vpc
}
Invoke-Step 'peer with servicenetworking' {
  gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=$psaRange --network=$vpc
}

Section '5. Cloud SQL PostgreSQL (private IP only)'
$pgPassword = New-Secret 28
Invoke-Step 'create Cloud SQL instance' {
  gcloud sql instances create $sql --database-version=POSTGRES_16 --tier=db-f1-micro `
    --region=$Region --network=$vpc --no-assign-ip --edition=ENTERPRISE `
    --storage-size=10GB --backup --enable-point-in-time-recovery `
    --retained-backups-count=7 --retained-transaction-log-days=7
}
Invoke-Step 'set admin password' {
  gcloud sql users set-password $sqlUser --instance=$sql --password=$pgPassword
}
Invoke-Step 'create application database' {
  gcloud sql databases create $sqlDb --instance=$sql
}
$sqlIp = (gcloud sql instances describe $sql --format="value(ipAddresses[0].ipAddress)" | Out-String).Trim()
if (-not $sqlIp) { throw 'Cloud SQL has no private IP yet.' }
Write-Host "Cloud SQL private IP: $sqlIp"

Section '6. Least-privilege service account for the instances'
Invoke-Step 'create service account' {
  gcloud iam service-accounts create $saName --display-name="Siyaj app instances"
}
Invoke-Step 'grant logging + metrics writer only' {
  gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$sa" --role="roles/logging.logWriter" --quiet
  gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$sa" --role="roles/monitoring.metricWriter" --quiet
}

Section '7. Instance template and managed instance group'
$databaseUrl = "postgresql://$sqlUser@$sqlIp:5432/$sqlDb"
$startupPath = Join-Path $here 'startup-script.sh'
Invoke-Step 'create instance template' {
  gcloud compute instance-templates create $template `
    --machine-type=$MachineType --network=$vpc --subnet=$subnetApp --no-address `
    --tags=$Prefix-app --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud `
    --service-account=$sa --scopes=cloud-platform --boot-disk-size=30GB `
    --metadata=repo-url=$RepoUrl,db-url=$databaseUrl,db-password=$pgPassword,admin-emails=$AdminEmails `
    "--metadata-from-file=startup-script=$startupPath"
}
Invoke-Step 'create health check on /healthz' {
  gcloud compute health-checks create http $hc --port=3000 --request-path=/healthz `
    --check-interval=10 --timeout=5 --healthy-threshold=2 --unhealthy-threshold=3
}
Invoke-Step 'create regional managed instance group' {
  gcloud compute instance-groups managed create $mig --template=$template --size=$MinInstances --region=$Region
}
Invoke-Step 'attach health check to the group' {
  gcloud compute instance-groups managed update $mig --region=$Region --health-check=$hc --initial-delay=300
}
Invoke-Step 'autoscaling policy: CPU 60%, min 2 max 5' {
  gcloud compute instance-groups managed set-autoscaling $mig --region=$Region `
    --min-num-replicas=$MinInstances --max-num-replicas=$MaxInstances `
    --target-cpu-utilization=0.6 --cool-down-period=120
}

Section '8. Global external load balancer'
Invoke-Step 'create backend service' {
  gcloud compute backend-services create $backend --global --protocol=HTTP --port-name=http `
    --health-checks=$hc --session-affinity=GENERATED_COOKIE --timeout=30
}
Invoke-Step 'add instance group as backend' {
  gcloud compute backend-services add-backend $backend --global --instance-group=$mig `
    --instance-group-region=$Region --balancing-mode=UTILIZATION --max-utilization=0.8
}
Invoke-Step 'create URL map, HTTP proxy, static IP and forwarding rule' {
  gcloud compute url-maps create $urlmap --default-service=$backend
  gcloud compute target-http-proxies create $proxy --url-map=$urlmap
  gcloud compute addresses create $ipName --global
  gcloud compute forwarding-rules create $fr --global --address=$ipName --target-http-proxy=$proxy --ports=80
}
$lbIp = (gcloud compute addresses describe $ipName --global --format="value(address)" | Out-String).Trim()
$endpoint = "http://$lbIp"

Section '9. Save credentials'
$secrets = [ordered]@{
  project = $Project
  region = $Region
  postgresHost = $sqlIp
  postgresUser = $sqlUser
  postgresPassword = $pgPassword
  postgresDatabase = $sqlDb
  serviceAccount = $sa
  endpoint = $endpoint
  createdAt = (Get-Date).ToString('s')
}
$secrets | ConvertTo-Json | Set-Content -Path (Join-Path $buildDir 'deployment.json') -Encoding utf8

Section '10. Wait for the public endpoint'
$healthy = $false
for ($i = 1; $i -le 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "$endpoint/healthz" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) { $healthy = $true; break }
  } catch { }
  Write-Host "   attempt $i/60 - instances booting (Node install + npm ci)" -ForegroundColor DarkGray
  Start-Sleep -Seconds 15
}

Section '11. Result'
Write-Host "Endpoint: $endpoint"
Write-Host "Health:   $endpoint/healthz"
Write-Host "Healthy:  $healthy"
Write-Host "Secrets:  $(Join-Path $buildDir 'deployment.json')"
