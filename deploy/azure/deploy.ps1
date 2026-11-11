[CmdletBinding()]
param(
  [string]$ResourceGroup = 'siyaj-rg',
  [string]$Location = 'uaenorth',
  [string]$Prefix = 'siyaj',
  [string]$RepoUrl = 'https://github.com/MrTHNR67/hussin-web.git',
  [string]$AdminEmails = '',
  [string]$VnetCidr = '10.20.0.0/16',
  [string]$AppSubnetCidr = '10.20.2.0/24',
  [string]$DataSubnetCidr = '10.20.3.0/24',
  [string]$MgmtSubnetCidr = '10.20.4.0/24',
  [int]$MinInstances = 2,
  [int]$MaxInstances = 5
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
function New-Suffix([int]$Length = 6) {
  $chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  -join (1..$Length | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

Section '0. Pre-flight'
Invoke-Step 'verify Azure login' { az account show --query '{name:name,id:id,tenant:tenantId}' -o json }
$account = az account show -o json | ConvertFrom-Json
Write-Host "Subscription: $($account.name) ($($account.id))"
Write-Host "Region: $Location"

$suffix = New-Suffix 6
$vnet = "$Prefix-vnet"
$appSubnet = 'snet-app'
$dataSubnet = 'snet-data'
$mgmtSubnet = 'snet-mgmt'
$appNsg = "$Prefix-nsg-app"
$dataNsg = "$Prefix-nsg-data"
$natGw = "$Prefix-nat"
$natIp = "$Prefix-nat-ip"
$lb = "$Prefix-lb"
$lbIp = "$Prefix-lb-ip"
$lbDns = "$Prefix-$suffix"
$probe = "$Prefix-probe"
$pool = "$Prefix-bepool"
$vmss = "$Prefix-vmss"
$autoscale = "$Prefix-autoscale"
$storage = "siyajstore$suffix"
$share = 'siyaj-data'
$pgName = "$Prefix-pg-$suffix"
$pgUser = 'siyajadmin'
$pgDb = 'siyaj'
$vmUser = 'azureuser'

Section '1. Resource group'
Invoke-Step 'create resource group' { az group create -n $ResourceGroup -l $Location -o none }

Section '2. Virtual network and subnets'
Invoke-Step 'create vnet + app subnet' {
  az network vnet create -g $ResourceGroup -n $vnet -l $Location `
    --address-prefixes $VnetCidr --subnet-name $appSubnet --subnet-prefixes $AppSubnetCidr -o none
}
Invoke-Step 'create data subnet (delegated to PostgreSQL)' {
  az network vnet subnet create -g $ResourceGroup --vnet-name $vnet -n $dataSubnet `
    --address-prefixes $DataSubnetCidr --delegations Microsoft.DBforPostgreSQL/flexibleServers -o none
}
Invoke-Step 'create management subnet' {
  az network vnet subnet create -g $ResourceGroup --vnet-name $vnet -n $mgmtSubnet `
    --address-prefixes $MgmtSubnetCidr -o none
}
Invoke-Step 'enable Storage service endpoint on app subnet' {
  az network vnet subnet update -g $ResourceGroup --vnet-name $vnet -n $appSubnet `
    --service-endpoints Microsoft.Storage -o none
}

Section '3. Network security groups'
Invoke-Step 'create app NSG' {
  az network nsg create -g $ResourceGroup -n $appNsg -l $Location -o none
}
Invoke-Step 'allow 3000 from Internet (load balancer front door)' {
  az network nsg rule create -g $ResourceGroup --nsg-name $appNsg -n allow-lb-3000 `
    --priority 1000 --direction Inbound --access Allow --protocol Tcp `
    --source-address-prefixes Internet --destination-port-ranges 3000 -o none
}
Invoke-Step 'explicitly deny SSH from Internet' {
  az network nsg rule create -g $ResourceGroup --nsg-name $appNsg -n deny-ssh-internet `
    --priority 1100 --direction Inbound --access Deny --protocol Tcp `
    --source-address-prefixes Internet --destination-port-ranges 22 -o none
}
Invoke-Step 'attach app NSG' {
  az network vnet subnet update -g $ResourceGroup --vnet-name $vnet -n $appSubnet --network-security-group $appNsg -o none
}
Invoke-Step 'create data NSG' {
  az network nsg create -g $ResourceGroup -n $dataNsg -l $Location -o none
}
Invoke-Step 'allow 5432 only from app subnet' {
  az network nsg rule create -g $ResourceGroup --nsg-name $dataNsg -n allow-app-5432 `
    --priority 1000 --direction Inbound --access Allow --protocol Tcp `
    --source-address-prefixes $AppSubnetCidr --destination-port-ranges 5432 -o none
}
Invoke-Step 'deny 5432 from Internet' {
  az network nsg rule create -g $ResourceGroup --nsg-name $dataNsg -n deny-db-internet `
    --priority 1100 --direction Inbound --access Deny --protocol Tcp `
    --source-address-prefixes Internet --destination-port-ranges 5432 -o none
}
Invoke-Step 'attach data NSG' {
  az network vnet subnet update -g $ResourceGroup --vnet-name $vnet -n $dataSubnet --network-security-group $dataNsg -o none
}

Section '4. NAT gateway (egress only)'
Invoke-Step 'create NAT public IP' {
  az network public-ip create -g $ResourceGroup -n $natIp -l $Location --sku Standard --allocation-method Static -o none
}
Invoke-Step 'create NAT gateway' {
  az network nat gateway create -g $ResourceGroup -n $natGw -l $Location --public-ip-addresses $natIp --idle-timeout 10 -o none
}
Invoke-Step 'associate NAT gateway to app subnet' {
  az network vnet subnet update -g $ResourceGroup --vnet-name $vnet -n $appSubnet --nat-gateway $natGw -o none
}

Section '5. Public load balancer'
Invoke-Step 'create load balancer public IP' {
  az network public-ip create -g $ResourceGroup -n $lbIp -l $Location --sku Standard --allocation-method Static --dns-name $lbDns -o none
}
Invoke-Step 'create standard load balancer + backend pool' {
  az network lb create -g $ResourceGroup -n $lb -l $Location --sku Standard --public-ip-address $lbIp --backend-pool-name $pool -o none
}
Invoke-Step 'create health probe on /healthz' {
  az network lb probe create -g $ResourceGroup --lb-name $lb -n $probe --protocol Http --port 3000 --path /healthz --interval 5 --threshold 2 -o none
}
Invoke-Step 'create HTTP rule 80 -> 3000' {
  az network lb rule create -g $ResourceGroup --lb-name $lb -n http-80 `
    --protocol Tcp --frontend-port 80 --backend-port 3000 --probe-name $probe --idle-timeout 15 -o none
}

Section '6. Shared media storage (Azure Files)'
Invoke-Step 'create storage account' {
  az storage account create -g $ResourceGroup -n $storage -l $Location --sku Standard_LRS --kind StorageV2 `
    --min-tls-version TLS1_2 --https-only true --allow-blob-public-access false -o none
}
$storageKey = az storage account keys list -g $ResourceGroup -n $storage --query '[0].value' -o tsv
Invoke-Step 'create file share' {
  az storage share create --account-name $storage --account-key $storageKey -n $share --quota 5 -o none
}
Invoke-Step 'restrict storage to the app subnet' {
  az storage account update -g $ResourceGroup -n $storage --default-action Deny -o none
  az storage account network-rule add -g $ResourceGroup -n $storage --vnet-name $vnet --subnet $appSubnet -o none
}

Section '7. PostgreSQL Flexible Server (private)'
$pgPassword = New-Secret 28
Invoke-Step 'create PostgreSQL server in delegated subnet' {
  az postgres flexible-server create -g $ResourceGroup -n $pgName -l $Location `
    --admin-user $pgUser --admin-password $pgPassword `
    --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 `
    --vnet $vnet --subnet $dataSubnet `
    --private-dns-zone "siyaj.private.postgres.database.azure.com" `
    --backup-retention 7 --yes -o none
}
Invoke-Step 'create application database' {
  az postgres flexible-server db create -g $ResourceGroup -s $pgName -d $pgDb -o none
}

Section '8. Generate cloud-init and credentials'
$vmPassword = New-Secret 24
$databaseUrl = "postgresql://$pgUser@$pgName.postgres.database.azure.com:5432/$pgDb"
$mountSource = "//$storage.file.core.windows.net/$share"
$mountOptions = "vers=3.0,username=$storage,password=$storageKey,dir_mode=0777,file_mode=0777,serverino,nosharesock,actimeo=30,_netdev,nofail"

$template = Get-Content -Raw (Join-Path $here 'cloud-init.yaml')
$cloudInit = $template.
  Replace('__REPO_URL__', $RepoUrl).
  Replace('__DATABASE_URL__', $databaseUrl).
  Replace('__DATABASE_PASSWORD__', $pgPassword).
  Replace('__ADMIN_EMAILS__', $AdminEmails).
  Replace('__MOUNT_SOURCE__', $mountSource).
  Replace('__MOUNT_OPTIONS__', $mountOptions)
$cloudInitPath = Join-Path $buildDir 'cloud-init.generated.yaml'
Set-Content -Path $cloudInitPath -Value $cloudInit -Encoding utf8NoBOM

$secrets = [ordered]@{
  resourceGroup = $ResourceGroup
  location = $Location
  vmssAdminUser = $vmUser
  vmssAdminPassword = $vmPassword
  postgresServer = $pgName
  postgresUser = $pgUser
  postgresPassword = $pgPassword
  postgresDatabase = $pgDb
  storageAccount = $storage
  storageKey = $storageKey
  endpoint = "http://$lbDns.$Location.cloudapp.azure.com"
  createdAt = (Get-Date).ToString('s')
}
$secrets | ConvertTo-Json | Set-Content -Path (Join-Path $buildDir 'deployment.json') -Encoding utf8

Section '9. VM Scale Set (private, behind load balancer)'
Invoke-Step 'create VMSS' {
  az vmss create -g $ResourceGroup -n $vmss -l $Location `
    --image Ubuntu2204 --vm-sku Standard_B1ms --instance-count $MinInstances `
    --vnet-name $vnet --subnet $appSubnet --public-ip-per-instance false `
    --load-balancer $lb --backend-pool-name $pool `
    --admin-username $vmUser --admin-password $vmPassword `
    --custom-data $cloudInitPath --upgrade-policy-mode Automatic `
    --orchestration-mode Uniform --storage-sku StandardSSD_LRS `
    --os-disk-size-gb 32 --disable-overprovision -o none
}

Section '10. Autoscaling policy'
$vmssId = az vmss show -g $ResourceGroup -n $vmss --query id -o tsv
Invoke-Step 'create autoscale profile (min 2 / max 5)' {
  az monitor autoscale create -g $ResourceGroup --resource $vmssId `
    --resource-type Microsoft.Compute/virtualMachineScaleSets -n $autoscale `
    --min-count $MinInstances --max-count $MaxInstances --count $MinInstances -o none
}
Invoke-Step 'scale out rule: CPU > 60% for 5 minutes' {
  az monitor autoscale rule create -g $ResourceGroup --autoscale-name $autoscale `
    --condition "Percentage CPU > 60 total 5m" --scale out 1 -o none
}
Invoke-Step 'scale in rule: CPU < 30% for 10 minutes' {
  az monitor autoscale rule create -g $ResourceGroup --autoscale-name $autoscale `
    --condition "Percentage CPU < 30 total 10m" --scale in 1 -o none
}

Section '11. Wait for the public endpoint'
$endpoint = "http://$lbDns.$Location.cloudapp.azure.com"
$healthy = $false
for ($i = 1; $i -le 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "$endpoint/healthz" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) { $healthy = $true; break }
  } catch { }
  Write-Host "   attempt $i/60 - instances still booting (Node install + npm ci)" -ForegroundColor DarkGray
  Start-Sleep -Seconds 15
}

Section '12. Result'
Write-Host "Endpoint:   $endpoint"
Write-Host "Health:     $endpoint/healthz"
Write-Host "Healthy:    $healthy"
Write-Host "Secrets:    $(Join-Path $buildDir 'deployment.json')"
Write-Host ''
az vmss list-instances -g $ResourceGroup -n $vmss --query '[].{name:name,state:provisioningState}' -o table
