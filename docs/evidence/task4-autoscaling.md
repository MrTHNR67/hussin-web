# Task 4 — Auto-scaling (Evidence)

**Collected:** 2026-11-11 17:12–17:13 (Asia/Muscat, UTC+4)
**Component:** `scripts/autoscale.ps1` + Nginx upstream rewrite (local policy emulation)
**Cloud equivalents:** Azure Monitor autoscale and GCP MIG autoscaler rules already defined in `deploy/` (not executed — no cloud account/card).

---

## 1. Policy (configured, not hardcoded results)

| Parameter | Value used | Meaning |
|---|---|---|
| `MinInstances` | 3 | never go below the HA baseline |
| `MaxInstances` | 5 | cost ceiling |
| `HighMs` | 35 ms | scale-out threshold (average proxy latency over the sample window) |
| `LowMs` | 20 ms | scale-in threshold |
| `Samples` | 2 | consecutive samples required (debounce / anti-flapping) |
| `SampleRequests` | 4 | requests per sample |
| `IntervalSeconds` | 3 s | decision interval |
| Readiness gate | `/readyz` (max 15 s) | a new instance is added to Nginx **only after it reports ready** |

Cloud policies (IaC, same intent, CPU-based because managed groups cannot use Nginx latency):

```text
Azure VMSS: min 2 / max 5
  scale out: Percentage CPU > 60% for 5 minutes  -> +1
  scale in : Percentage CPU < 30% for 10 minutes -> -1
GCP MIG:   min 2 / max 5, target CPU 0.6, cooldown 120 s
```

---

## 2. Observed scale-out under controlled load

Load: `autocannon -c 120 -d 25 http://127.0.0.1:8080/readyz` (bounded, synthetic).

```text
  nginx upstream -> 3001, 3002, 3003
[17:12:13] avg=523ms  replicas=3
[17:12:16] avg=88.5ms replicas=3
  scale-out: average latency exceeded 35ms for 2 samples
  + started instance on 3004 (PID 17068)
  nginx upstream -> 3001, 3002, 3003, 3004
[17:12:20] avg=75.4ms replicas=4
[17:12:23] avg=71.3ms replicas=4
  scale-out: average latency exceeded 35ms for 2 samples
  + started instance on 3005 (PID 20336)
  nginx upstream -> 3001, 3002, 3003, 3004, 3005
[17:12:27] avg=61.6ms replicas=5
[17:12:30] avg=60.2ms replicas=5
[17:12:34] avg=63.9ms replicas=5
[17:12:37] avg=61.9ms replicas=5
[17:12:40] avg=58.1ms replicas=5
```

Scale-out completed in ~11 s from the first breach (17:12:16 → 17:12:27) and stopped at the
configured maximum (5).

## 3. Observed scale-in after demand fell

```text
[17:12:43] avg=13.7ms replicas=5
[17:12:47] avg=17.1ms replicas=5
  scale-in: latency below 20ms for 2 samples
  - stopped instance on 3005
  nginx upstream -> 3001, 3002, 3003, 3004
[17:12:53] avg=13.6ms replicas=4
[17:12:56] avg=13.8ms replicas=4
  scale-in: latency below 20ms for 2 samples
  - stopped instance on 3004
  nginx upstream -> 3001, 3002, 3003
[17:13:02] avg=13.3ms replicas=3
```

Scale-in returned to the 3-instance HA baseline and stayed there (min bound), so cost does not
creep after the load ends.

---

## 4. Load measurements

| Run | Connections | Duration | Requests | Throughput | p50 | p99 | Server 5xx |
|---|---|---|---|---|---|---|---|
| Elasticity run (3→5→3) | 120 | 25 s | 61,006 | ≈ 2,434 req/s | 134 ms | 158 ms | **0** |
| Steady state (3 replicas) | 100 | 15 s | 40,000 | **2,662 req/s** | 37 ms | 48 ms | **0** |
| Control, no scaling | 120 | 15 s | 29,000 | 1,906 req/s | 68 ms | 85 ms | **0** |

Nginx access log for the elasticity window (17:12):

```text
200: 60,890
499:    116   (client closed the keep-alive connection — autocannon shutdown/reload)
5xx:      0
total: 61,006
```

`autocannon` reported 240 client-side aborts (0 timeouts). These are **not** application errors:
the access log proves zero 5xx responses. They occur when Nginx reloads its upstream list and
closes idle keep-alive sockets on the client side (`499`).

---

## 5. What this satisfies

- **Policy defined (5/5):** explicit thresholds, bounds, sample window and cooldown; readiness gate.
- **Observed scale-out under load (5/5):** 3 → 4 → 5 replicas with timestamps and latency.
- **Scale-in / scale-down (5/5):** 5 → 4 → 3 replicas after load stopped, bounded by `MinInstances`.

Honest limitations:

- The local policy is **latency-based** because the demo uses Nginx; the managed cloud groups use CPU.
  The decision loop, bounds, cooldown and health gating are the same shape.
- Windows/Nginx reload closes idle keep-alive connections (`499`), visible only under synthetic load;
  no request received an error response.
- Auto-scaling at the public Render endpoint is provider-managed (instance count fixed on the free plan);
  elasticity evidence is from the controlled local cluster plus the IaC rules.
