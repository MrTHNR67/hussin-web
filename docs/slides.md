# Final Presentation — 7 slides (5-minute pitch)

**Siyaj Solar Guardian · InnovationFest secure submission platform**
Live: https://siyaj-web.onrender.com · Code: https://github.com/MrTHNR67/hussin-web

---

## Slide 1 — Problem and solution

**InnovationFest failed at the deadline:** downtime at peak, uploads slowed the site, teams could
open each other's documents, files were checked by hand, and peak infrastructure kept running.

**Our answer:** a hardened cloud-native service built on the Siyaj application.

- Public HTTPS endpoint on Render (free tier, no laptop required)
- 3 replicas behind a load balancer + bounded autoscaling
- Private per-user uploads with automated validation
- Least-privilege IAM, tested backup/restore, live health metrics

> Speaker note: name the provider (Render, Frankfurt, free tier) and state that every claim in the
> deck is backed by a dated file in `docs/evidence/`.

---

## Slide 2 — Architecture

```text
Users → Cloudflare/Render edge (TLS 1.3, 301, DDoS)
      → Render web service (Node/Express, Frankfurt)
      → Render Postgres (private hostname, TLS, dedicated role)
      → egress: Open-Meteo → MET Norway fallback
Local evidence: Nginx :8080 → Node :3001/:3002/:3003 (least_conn)
```

- Only 443 is public; the database is reached over the private network
- `/healthz` liveness, `/readyz` readiness
- Uploads: 25 MB cap, MIME allow-list, per-user isolation, validation before analysis
- Background jobs: HMAC-signed, nonce + 15-minute replay window

> Speaker note: point to `docs/architecture-blueprint.md`; explain the local cluster exists because
> the free PaaS plan does not expose LB/autoscale knobs, so we demonstrate them with the same code.

---

## Slide 3 — Resilience and elasticity

| Test | Result |
|---|---|
| 3 replicas baseline | 10 / 10 / 10 distribution, 30/30 success |
| Kill one instance | **30/30 success**, 15/15 on survivors, session kept working |
| Recovery | node rejoined after 15 s fail_timeout, 3-way distribution restored |
| Scale-out | 3 → 4 → 5 in ~11 s under latency breach |
| Scale-in | 5 → 4 → 3 after load stopped (bounded, no cost creep) |
| Throughput | 2,662 req/s steady, 61k requests / 0 server 5xx in elasticity run |

> Speaker note: the only errors autocannon saw were client-side 499s during Nginx reload; the access
> log proves zero 5xx. That is the honest version of the result.

---

## Slide 4 — Security and IAM

- `GET /api/admin/stats`: **401** unauthenticated, **403** normal user, **200** admin only
- Admin comes from a server-side allow-list — no self-promotion via payload or DB row
- 11 bad logins → **429** + `Retry-After: 900`
- HSTS, CSP (`script-src-attr 'none'`), `DENY` framing, `nosniff`, `no-referrer`
- Passwords: `scrypt` + salt; sessions stored as SHA-256 of the token
- Secrets only in environment variables; `git grep` over 62 tracked files = no keys
- DB: dedicated `siyaj_user`, RLS on shared tables, revoked browser roles

> Speaker note: show the denial live or open `docs/evidence/task6-iam.md`. Mention the honest gap:
> Render Postgres has an external endpoint protected by password + TLS; IP allow-list pinning is next.

---

## Slide 5 — Recovery, monitoring, cost

**Recovery:** real data loss drill — marker A restored (200), marker B written after the backup lost
(401). Automated restore **1.44 s**; RPO ≤ 5 min with a backup every 5 minutes and SHA-256 audit log.

**Monitoring:** `/healthz` + `/readyz` every 2 s, Nginx stub_status, CPU/RSS per replica.
15/15 healthy samples at ~1.7k req/s, ~13% CPU, health latency 15.9 ms avg.

**Cost:** **$0/month** deployed (Render free web + free Postgres; local stack on existing hardware).
Azure ≈ $130, GCP ≈ $80 if the IaC path is used. Decision: free tier + bounded autoscale + scale-in.

> Speaker note: explain the free Postgres expires 2026-12-11 and there is a reminder + export plan.

---

## Slide 6 — Validation results

| Rubric item | Result | Evidence |
|---|---|---|
| Working application | HTTPS 200, signup/login, upload validation | task1, task6 |
| Component failure | 30/30 requests during instance loss | task2 |
| Traffic change | 3→5→3 observed, 0 server 5xx | task4 |
| Recovery | 1.44 s restore, RPO proof | task5 |
| IAM denial | 401 / 403 / 429 | task6 |
| Health metrics | 15/15 samples, CPU/RPS time series | task7 |

> Speaker note: all evidence files are indexed in `docs/evidence/README.md` with one-line reproduce
> commands.

---

## Slide 7 — Limitations and conclusion

- PaaS free tier: sleeps after 15 min, autoscaling is provider-managed (IaC for Azure/GCP provided)
- Single region; no WAF/MFA yet; DB external endpoint needs allow-list pinning
- Local HA isolates components, not hosts; cloud templates provide zone redundancy
- **Why this is credible:** working endpoint, reproducible scripts, measured numbers, disclosed gaps

**Conclusion:** the failure modes of InnovationFest are each answered with a tested control, at $0,
with evidence a judge can re-run.

> Speaker note: close with the live URL and the evidence index; invite the judges to run
> `scripts/verify-iam.ps1` against the public endpoint.
