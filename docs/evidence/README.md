# Evidence Index — Enterprise Cloud-Native Architecture Hackathon

**Application:** Siyaj Solar Guardian (InnovationFest scenario)
**Public endpoint:** https://siyaj-web.onrender.com
**Repository:** https://github.com/MrTHNR67/hussin-web
**Evidence collected:** 2026-11-11 (Asia/Muscat, UTC+4)

| # | Task | Evidence | Key result | Reproduce |
|---|---|---|---|---|
| 1 | Cloud networking | [`task1-networking.md`](task1-networking.md) | HTTPS 200, TLS 1.3, HTTP→301, DNS via Cloudflare, segmentation table, Azure/GCP VPC+NSG design | `curl.exe -vI https://siyaj-web.onrender.com/` · `Resolve-DnsName siyaj-web.onrender.com` |
| 2 | High availability | [`task2-ha-task3-lb.md`](task2-ha-task3-lb.md) | 30/30 requests succeeded while one of three instances was killed; session survived on the survivors | `scripts\verify-ha-lb.ps1` |
| 3 | Load balancing | [`task2-ha-task3-lb.md`](task2-ha-task3-lb.md) | 10/10/10 baseline distribution; 15/15 after failover; node ejected/rejoined in 15 s | `scripts\verify-ha-lb.ps1` |
| 4 | Auto-scaling | [`task4-autoscaling.md`](task4-autoscaling.md) | policy + observed 3→4→5 scale-out under load, 5→4→3 scale-in after; 0 server 5xx | `scripts\autoscale.ps1` + `scripts\load-test.ps1` |
| 5 | Disaster recovery | [`task5-dr.md`](task5-dr.md) | real data loss → restore in **1.44 s**; RPO proof (post-backup data lost); backups every 5 min with SHA-256 log | `scripts\drill-dr.ps1` |
| 6 | Security / IAM | [`task6-iam.md`](task6-iam.md) | 401 unauthenticated, 403 non-admin, 429 lockout, HSTS/CSP headers, no secrets in git, least-privilege DB role | `scripts\verify-iam.ps1` |
| 7 | Monitoring + cost | [`task7-monitoring-cost.md`](task7-monitoring-cost.md) | 15/15 healthy samples at ~1.7k req/s, CPU/mem/RPS time series, alert policy, $0 deployed cost model | `scripts\monitor.ps1` |

## Deliverables

| Deliverable | File |
|---|---|
| Architecture blueprint (4–6 pages) | [`../architecture-blueprint.md`](../architecture-blueprint.md) |
| Presentation outline (5–7 slides) | [`../slides.md`](../slides.md) |
| Video script (≤ 3 min) | [`../video-script.md`](../video-script.md) |
| Network design | [`../network.md`](../network.md) |
| Scaling / autoscaling policy | [`../scaling.md`](../scaling.md) |
| IAM control catalogue | [`../iam.md`](../iam.md) |
| Cloud-native notes | [`../cloud-native.md`](../cloud-native.md) |

## Current deployment facts

- Render web service `siyaj-web` (free plan, Frankfurt) deployed from `main` with auto-deploy.
- Render Postgres `siyaj-db` (free plan, 1 GB, expires 2026-12-11); external IP allow-list pinned to a
  non-routable TEST-NET range, so only the internal application network can connect.
- Health checks: `/healthz` (liveness), `/readyz` (readiness).
- Local evidence stack: 3 Node instances (3001–3003) behind Nginx `:8080`, metrics on loopback `:8081`,
  `SiyajAlwaysOn` keeps instances alive, `SiyajBackup` takes a verified database backup every 5 minutes.

## Verification in one pass (local stack running)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1 -BaseUrl http://127.0.0.1:8080
powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1
powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1
powershell -ExecutionPolicy Bypass -File scripts\monitor.ps1 -DurationSeconds 20
```

Public endpoint only:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1 -BaseUrl https://siyaj-web.onrender.com
```
