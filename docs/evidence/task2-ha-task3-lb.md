# Task 2 (High Availability) + Task 3 (Load Balancing) — Evidence

**Collected:** 2026-11-11 17:07 (Asia/Muscat, UTC+4)
**Topology:** Nginx `:8080` → `least_conn` upstream → 3 Node instances (`3001`, `3002`, `3003`), shared database.
**Reproduce:** `powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1`

Nginx configuration (active):

```nginx
upstream siyaj_upstream {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=15s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=15s;
    server 127.0.0.1:3003 max_fails=3 fail_timeout=15s;
}
location / {
    proxy_pass http://siyaj_upstream;
    proxy_next_upstream error timeout http_502 http_503;
}
```

- `least_conn` distributes new requests to the instance with the fewest active connections.
- `max_fails=3` + `fail_timeout=15s` = passive health check: after 3 failures the node is ejected for 15 s.
- `proxy_next_upstream` retries a failed request on another healthy node, so the client does not see the failure.
- App health endpoints: `/healthz` (liveness) and `/readyz` (readiness).

---

## 1. Load distribution (30 requests)

```text
== Baseline distribution (30 requests) ==
  instance 3001: 10 requests
  instance 3002: 10 requests
  instance 3003: 10 requests
  success: 30/30 | avg 3.4 ms | max 48.1 ms
```

Even distribution across all three backends, zero errors.

---

## 2. Simulated loss of one application component (Task 2 rubric: continuity)

Test: log in through instance **3001** (session cookie issued there), verify an authenticated call,
then kill the 3001 process while it is serving traffic.

```text
== Session continuity (login on 127.0.0.1:3001, then kill it) ==
  login on victim instance: HTTP 200
  authenticated call on victim instance: HTTP 200
  killed instance 3001 (PID 12844) at 17:07:15.385

== During outage of instance 3001 (30 requests) ==
  instance 3002: 15 requests
  instance 3003: 15 requests
  success: 30/30 | avg 205.3 ms | max 2054.2 ms
  authenticated session via load balancer after kill: HTTP 200
```

What this proves:

1. **Traffic continuity:** 30/30 requests succeeded while one of three backends was dead;
   Nginx re-routed work to the two surviving instances (15/15).
2. **Session continuity:** the cookie issued by the killed instance is still accepted by the
   survivors, because sessions live in the shared database, not in process memory.
3. **Cost of failover:** the average latency rose from 3.4 ms to 205.3 ms and the worst request
   took ~2.05 s (the first connections to the dead port plus retry). No request returned an error.
4. Nginx ejected 3001 after 3 failed connection attempts and retried the requests upstream
   (see `C:\nginx\logs\error.log`).

---

## 3. Recovery (scale-back / self-healing)

A replacement instance was started on the same port. Nginx keeps a failed node out for
`fail_timeout=15s`, then probes it again:

```text
== After recovery (12 requests, immediately) ==
  instance 3002: 6 requests
  instance 3003: 6 requests
  success: 12/12 | avg 0.8 ms | max 1.2 ms

--- after fail_timeout (15 s), 9 requests ---
  instance 3001: 3
  instance 3002: 3
  instance 3003: 3
  ok=9 fail=0
```

So the pool returns to full 3-way distribution automatically, without restarting Nginx.
The `SiyajAlwaysOn` scheduled task also checks every 60 s and restarts any missing instance
(self-healing on the demo host).

---

## 4. HA design beyond the single demo host (what the IaC provides)

| Layer | Local demo | Provider-native IaC (`deploy/`) |
|---|---|---|
| App instances | 3 Node processes, Nginx LB | Azure VMSS (2–5) across availability zones / GCP MIG across zones |
| Health checks | `/healthz` + Nginx passive checks | Azure Load Balancer probe / GCP backend health check |
| Shared state | one database for all replicas (required; in-memory state would break HA) | private PostgreSQL / Cloud SQL |
| Failed node | killed + auto-restarted | replaced by the scale set / managed instance group |
| Entry point | Nginx single host | managed load balancer with health probes |

Honest limitation: on the demo host all three processes share one power supply and OS, so this
is **component-level** failure isolation, not host-level. Host/zone redundancy is delivered by the
Azure/GCP templates in `deploy/` (not executed for this submission because no cloud account/card was
available); Render (the public endpoint) provides redundant infrastructure and zero-downtime deploys.

---

## 5. Raw summary

```text
Title                                        Total Success Failed AvgMs  MaxMs Distribution
Baseline distribution (30 requests)             30      30      0   3.4   48.1 3001:10, 3002:10, 3003:10
During outage of instance 3001 (30 requests)    30      30      0 205.3 2054.2 3002:15, 3003:15
After recovery (12 requests)                    12      12      0   0.8    1.2 3002:6, 3003:6
RESULT: PASS (zero failed requests)
```
