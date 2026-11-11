# Task 1 — Cloud Networking (Evidence)

**Collected:** 2026-11-11 17:21 (Asia/Muscat, UTC+4)
**Public endpoint:** https://siyaj-web.onrender.com (Render, Frankfurt)
**Design reference:** `docs/network.md` (diagram + control table)
**IaC (provider-native alternative):** `deploy/azure/deploy.ps1`, `deploy/gcp/deploy.ps1`

---

## 1. Live endpoint checks

```text
https root    : 200 in 0.43 s
https healthz : 200
https readyz  : 200
http  root    : 301 -> https://siyaj-web.onrender.com/
```

TLS:

```text
Subject : CN=onrender.com
Issuer  : CN=WE1, O=Google Trust Services, C=US
Valid   : 2026-09-22 -> 2026-12-21
TLS     : Tls13
```

DNS resolution chain:

```text
siyaj-web.onrender.com
  -> CNAME gcp-us-west1-1.origin.onrender.com
  -> CNAME gcp-us-west1-1.origin.onrender.com.cdn.cloudflare.net
  -> A records (Cloudflare anycast)
```

The hostname is served through Render's managed edge on Cloudflare: anycast DNS, automatic TLS,
DDoS absorption and HTTP→HTTPS redirect happen before traffic reaches the application.

---

## 2. Traffic path

```text
                          public Internet
                                |
                                | HTTPS 443 (TLS 1.3)
                                v
                 +-------------------------------+
                 | Cloudflare / Render edge      |  DDoS, TLS, HTTP->HTTPS 301
                 +-------------------------------+
                                |
                                | HTTPS (provider internal)
                                v
                 +-------------------------------+
                 | Render web service "siyaj-web"|  Node app, Frankfurt
                 |  / /healthz /readyz /api/*    |
                 +---------------+---------------+
                                 | internal network (private hostname)
                                 v
                 +-------------------------------+
                 | Render Postgres "siyaj-db"    |  port 5432, password + TLS
                 +-------------------------------+

         outbound 443 (egress): Open-Meteo, MET Norway, Google identity
```

Local evidence stack (same application, self-managed network):

```text
client -> Nginx :8080 (only public listener) -> least_conn -> 127.0.0.1:3001/3002/3003
                                                     |
                                                     +-> internal metrics 127.0.0.1:8081 (loopback only)
```

---

## 3. Network segmentation (PaaS deployment)

| Path | Port | Exposure | Control |
|---|---|---|---|
| Internet → application | 443 | public | managed edge, TLS 1.3, HSTS, CSP |
| Internet → application | 80 | public | 301 redirect to HTTPS |
| App → Postgres | 5432 | private/internal hostname | Render internal network, TLS, dedicated role |
| Postgres external endpoint | 5432 | reachable on the Internet | password + TLS required; **IP allow-list pinning recommended** (see limitations) |
| App → weather/identity APIs | 443 | outbound only | CSP `connect-src` allow-list, no inbound opening |
| Metrics endpoint (local) | 8081 | loopback only | `listen 127.0.0.1:8081`, `allow 127.0.0.1; deny all;` |
| Backends (local) | 3001–3003 | loopback only | bound to 127.0.0.1, only Nginx is public |

No database port is opened in the application's own firewall: the app is the only client of the DB,
and it uses the private `DATABASE_URL`.

---

## 4. Provider-native design (executable IaC, not applied)

Because no cloud account/card was available, the following is the reviewed design (not billed):

**Azure** — VNet `10.20.0.0/16`

| Subnet | CIDR | Purpose |
|---|---|---|
| app | 10.20.2.0/24 | VMSS instances, no public IP per instance |
| data | 10.20.3.0/24 | PostgreSQL Flexible Server (delegated) |
| mgmt | 10.20.4.0/24 | administration |

NSG rules (`deploy/azure/deploy.ps1`):

```text
app NSG   : allow TCP 3000 from Internet (only through the load balancer)
            deny  TCP 22 from Internet
data NSG  : allow TCP 5432 only from 10.20.2.0/24 (app subnet)
            deny  TCP 5432 from Internet
egress    : NAT Gateway with a static public IP
```

**GCP** — custom VPC, `me-central2`

| Subnet | CIDR | Purpose |
|---|---|---|
| app | 10.20.2.0/24 | managed instance group, no external IPs |
| mgmt | 10.20.4.0/24 | administration (IAP only) |

Firewall rules (`deploy/gcp/deploy.ps1`):

```text
allow TCP 3000 from 130.211.0.0/22, 35.191.0.0/16   (Google load-balancer + health checks)
allow TCP 3000 from 10.20.0.0/16                     (internal)
allow TCP 22   from 35.235.240.0/20                  (Identity-Aware Proxy only)
deny  TCP 22   from 0.0.0.0/0
deny  TCP 5432 from 0.0.0.0/0
egress through Cloud NAT
```

These rules implement the same intent as the live PaaS setup: one public entry point (the load
balancer/edge), application ports never exposed directly, database reachable only from the app tier,
and administration only over a controlled path.

---

## 5. Verification commands

```powershell
# endpoint + redirect + latency
curl.exe -s -o NUL -w "https %{http_code} %{time_total}s`n" https://siyaj-web.onrender.com/
curl.exe -s -o NUL -w "http  %{http_code} -> %{redirect_url}`n" http://siyaj-web.onrender.com/

# TLS
curl.exe -vI https://siyaj-web.onrender.com/

# DNS chain
Resolve-DnsName siyaj-web.onrender.com

# database external endpoint (see limitation)
Test-NetConnection dpg-dbq5rcjm8hqs739u4r7g-a.frankfurt-postgres.render.com -Port 5432

# local segmentation
Get-NetTCPConnection -LocalPort 8080,8081,3001,3002,3003 -State Listen
curl.exe -s -o NUL -w "metrics via public listener: %{http_code}`n" http://127.0.0.1:8080/nginx_status   # 404
```

Observed: public listener 200/301 as above; `/nginx_status` on 8080 = **404**; metrics only on 8081.

---

## 6. Limitations (honest)

- The production endpoint is **PaaS**: the VPC/subnet/NSG layout is governed by Render, not by the
  IaC in `deploy/`. The IaC is the executable design for a provider-native deployment and was not
  applied (no cloud account/card).
- Render Postgres exposes an external endpoint on 5432 by default. The app uses the internal URL;
  the next hardening step is to pin the database IP allow-list to the operator's address.
- Single region (Frankfurt) for cost; multi-region would require a second service + DB replica and a
  global load balancer (documented, not deployed).
- The local tunnel (`trycloudflare`) is a development convenience only; the stable public URL is the
  Render service, which does not depend on any machine being on.
