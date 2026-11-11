# Task 7 — Monitoring + Cost (Evidence)

**Collected:** 2026-11-11 17:16–17:17 (Asia/Muscat, UTC+4)
**Stack:** 3 Node replicas behind Nginx, sampled by `scripts/monitor.ps1`
**Reproduce:** `powershell -ExecutionPolicy Bypass -File scripts\monitor.ps1 -DurationSeconds 30`

---

## 1. What is monitored

| Signal | Source | Interval | Why |
|---|---|---|---|
| Liveness | `GET /healthz` per instance (through the LB) | 2 s | process alive and answering |
| Readiness | `GET /readyz` | 2 s | instance able to serve traffic (DB reachable) |
| Health latency | response time of `/healthz` | 2 s | early sign of saturation |
| Requests/s | Nginx `stub_status` counter delta | 2 s | actual load handled |
| Active connections | Nginx `stub_status` | 2 s | concurrency / queueing |
| CPU % of the app pool | per-process CPU delta ÷ interval ÷ cores | 2 s | scale-out signal |
| Memory (RSS) of the app pool | per-process `WorkingSet64` | 2 s | leak / sizing |
| Health failures | count of non-200 samples | per run | availability SLI |
| Application logs | `.run\api-*.log`, Render log stream | continuous | errors, fallbacks (e.g. MET Norway) |

The metrics endpoint is **not public**:

```nginx
# public listener, port 8080
location = /nginx_status { return 404; }

# monitoring listener, loopback only
server {
    listen 127.0.0.1:8081;
    location /nginx_status { stub_status; allow 127.0.0.1; deny all; }
    location / { return 404; }
}
```

Verified: `http://127.0.0.1:8081/nginx_status` → 200 (stub status);
`http://127.0.0.1:8080/nginx_status` → **404**; the public tunnel targets 8080 only, so the
metrics page is unreachable from the Internet.

---

## 2. Metrics captured during a real load test

Load: `autocannon -c 100 -d 30 http://127.0.0.1:8080/readyz` → 51,000 requests, 1,706 req/s,
p50 58 ms, max 111 ms, **0 errors**.

Time series (excerpt from `.run/metrics.csv`, full file has 15 samples):

```csv
"timestamp","health_ok","health_ms","ready_ok","instance","instances","cpu_percent","memory_mb","active_conns","requests_per_s"
"2026-11-11 17:16:59","1","53.5","1","3003","3","14.7","831","102","1812"
"2026-11-11 17:17:02","1","24.6","1","3002","3","13.8","833","102","1694"
"2026-11-11 17:17:06","1","19.6","1","3003","3","13.6","833","102","1712.4"
"2026-11-11 17:17:14","1","13.5","1","3001","3","13.4","827","102","1687.2"
"2026-11-11 17:17:23","1","11.7","1","3003","3","13.4","831","102","1710.8"
"2026-11-11 17:17:27","1","1.2","1","3002","3","11.2","837","2","1358.5"
"2026-11-11 17:17:29","1","1.1","1","3003","3","0","837","2","1.5"
```

Summary printed by the sampler:

```text
samples: 15 | health failures: 0
requests/s: avg 1580.2 | max 1812
cpu %:     avg 12.5 | max 14.7
health ms: avg 15.9 | max 53.5
```

Interpretation:

- **Availability:** 15/15 samples healthy on both `/healthz` and `/readyz`; zero failed health checks.
- **Capacity:** ~1.7k req/s at ~13% of the 28-core host, ~830 MB RSS for the 3-RW replica pool.
  There is large headroom before CPU becomes the scaling trigger.
- **Latency:** health checks stay under 54 ms even at 100 concurrent connections.
- The dip at 17:17:27 is the load generator stopping (connections 102 → 2), not a service event.

---

## 3. Alerting policy (defined; wired to the same signals)

| Condition | Severity | Action |
|---|---|---|
| `/healthz` fails 2 consecutive samples | Page | check process, `SiyajAlwaysOn` restarts it within 60 s |
| `/readyz` fails while `/healthz` passes | Warn | DB unreachable / migrating — do not route traffic |
| 5xx > 1% of requests over 5 min | Page | roll back last deploy, check logs |
| CPU > 60% for 5 min | Scale-out | +1 replica (cloud rule: Azure CPU > 60% / 5 min; GCP target 0.6) |
| CPU < 30% for 10 min | Scale-in | −1 replica, bounded by min 2 (cloud) / 3 (demo) |
| Render log: `MET Norway fallback` | Info | primary weather provider throttled; fallback active |
| Disk/DB backup stale > 24 h | Page | take manual backup, verify restore (Task 5) |

In Render, the same signals are visible in the dashboard (CPU/memory graphs, log stream) and the
`/healthz` endpoint is the health check used by the platform. UptimeRobot (free) can poll the public
URL every 5 minutes if an external witness is required.

---

## 4. Cost estimate (indicative, monthly, USD)

### 4.1 What is actually deployed now

| Item | Plan | Cost | Limit / note |
|---|---|---|---|
| Render Web Service `siyaj-web` | Free | **$0** | 512 MB RAM, 0.1 CPU, sleeps after 15 min idle (~30–50 s cold start) |
| Render Postgres `siyaj-db` | Free | **$0** | 1 GB, **expires 2026-12-11**; then a paid plan from ~$6–7/mo |
| GitHub repo + Actions-free deploys | Free | **$0** | public repo, auto-deploy from `main` |
| Local HA/LB/autoscale evidence stack | existing PC | **$0** | 3 Node + Nginx, no cloud spend |
| **Total for the submission** | | **$0** | resets to ~$6–7/mo if the free DB expires |

### 4.2 If the cloud IaC is executed (same architecture, provider-native)

| Azure (UAE North, pay-as-you-go, approx.) | Monthly |
|---|---|
| 2 × B2s VMSS instances (2 vCPU, 4 GB) | ~$61 |
| Standard Load Balancer + rules | ~$18 |
| NAT Gateway | ~$32 + data |
| PostgreSQL Flexible Server B1ms + 32 GB | ~$15 |
| Storage / snapshots / logs | ~$5 |
| **Total** | **~$130** |

| GCP (me-central1, approx.) | Monthly |
|---|---|
| 2 × e2-medium (2 vCPU, 4 GB) | ~$49 |
| External HTTP(S) Load Balancer | ~$18 |
| Cloud NAT | ~$2 + $0.044/GB |
| Cloud SQL db-f1-micro + 10 GB | ~$11 |
| **Total** | **~$80** |

Assumptions: 730 h/month, single region, no committed-use discount, egress < 100 GB,
moderate traffic (a few hundred thousand requests/month). Prices are indicative for the design
document; they are **not** billed amounts.

### 4.3 Cost-control decisions

1. **Free tier for the public demo** — the judges get a live HTTPS endpoint at $0; the trade-off
   (cold start after 15 min idle) is disclosed.
2. **Bounded autoscaling** — min 2 / max 5 (cloud), min 3 / max 5 (demo); scale-in after 10 min
   below 30% CPU prevents the "peak capacity kept running after demand fell" failure from the
   scenario.
3. **Scale-in observed in Task 4** — replicas returned 5 → 4 → 3 after load stopped.
4. **Single region + backup/restore DR** instead of a warm standby region (≈ 2× cost saved).
5. **Teardown scripts** (`deploy/*/delete.ps1`) and a calendar reminder for the Postgres free-tier
   expiry (2026-12-11) so nothing runs unbilled.
6. **Budget alerts** (Azure Cost Management / GCP Budgets) at 50% and 80% of a $150 cap when the
   IaC path is used.

---

## 5. Limitations

- No Prometheus/Grafana/OpenTelemetry stack; metrics are sampled by a PowerShell script and Nginx
  stub_status. Sufficient for the demo, not for production retention/alerting.
- Render's free plan exposes limited metrics (no custom dashboards); the local sampler covers the
  replica pool.
- Alert routing is manual (no PagerDuty/Slack webhook yet); the rules and thresholds are defined
  and measured.
