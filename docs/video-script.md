# Video script — maximum 3 minutes

**Goal:** show the working application and the key resilience/security tests, not slides.
**Recording tips:** 1080p, one browser window + one terminal, large font, no dead air.
Have these windows ready: the live site, a PowerShell at the repo root, `docs/evidence/README.md`.

---

## 0:00–0:15 — Intro (15 s)

**Say:** "Siyaj Solar Guardian, deployed on Render at siyaj-web.onrender.com. It runs without any
laptop being on. We'll show the app, then fail a component, scale under load, deny an unauthorized
request, and restore from backup."

**Show:** browser opens `https://siyaj-web.onrender.com` over HTTPS (padlock visible).

---

## 0:15–0:45 — Working app and validation (30 s)

**Do:** log in with the demo account → open a panel → upload a synthetic panel image → show the
validation/analysis result and the weather snapshot.

**Say:** "Uploads are capped at 25 MB and type-checked; each file is stored under the user's own
scope, then validated before analysis. Weather comes from Open-Meteo, with an automatic MET Norway
fallback if the primary is throttled."

**Show:** the analysis status/result and the weather card.

---

## 0:45–1:15 — Load balancing + component failure (30 s)

**Terminal 1:**

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1
```

**Say (while it runs):** "Nginx distributes with least_conn across three instances. The script logs
in through instance 3001, kills it, and keeps sending traffic."

**Show:** output lines:

```text
Baseline distribution: 3001:10, 3002:10, 3003:10
killed instance 3001
During outage: 3002:15, 3003:15 — success 30/30
authenticated session via load balancer after kill: HTTP 200
```

---

## 1:15–1:45 — Autoscaling (30 s)

**Terminal 2** (already running): show the autoscaler log with the timestamps.

**Say:** "Scale-out policy: latency above 35 ms for two samples, bounded 3 to 5; scale-in below 20 ms
after the load stops. New instances only join after /readyz passes."

**Show:** the lines `3 → 4 → 5` during load and `5 → 4 → 3` after.

Optional: 10-second clip of `npx autocannon -c 120 -d 25 http://127.0.0.1:8080/readyz` with the RPS
counter rising.

---

## 1:45–2:10 — Security / IAM denial (25 s)

**Terminal:**

```powershell
curl.exe -s -o NUL -w "no session: %{http_code}`n" https://siyaj-web.onrender.com/api/admin/stats
```

**Say:** "No session: 401. A normal logged-in user gets 403; only the allow-listed admin gets 200.
After 10 bad logins the account locks with 429. HSTS, CSP and frame-deny headers are on every
response."

**Show:** 401 (and optionally 403/429 from `scripts/verify-iam.ps1`).

---

## 2:10–2:40 — Recovery (30 s)

**Terminal:**

```powershell
powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1
```

**Say:** "The drill deletes the database, restarts empty, proves the user can't log in, then restores
the latest verified backup. Recovery took 1.44 seconds; data written after the backup is lost — that
is the RPO window, and backups run every five minutes."

**Show:** `login A after loss: 401`, `RECOVERY_OK in 1.44s`, `login A restored: 200`.

---

## 2:40–3:00 — Monitoring, cost, close (20 s)

**Show:** `docs/evidence/task7-monitoring-cost.md` summary (health samples, RPS, CPU) and the cost
table.

**Say:** "Health and load are sampled every two seconds: zero failed health checks at 1.7k requests
per second. The deployed cost is zero dollars on Render's free tier, with bounded autoscaling so
capacity doesn't keep running after demand falls. All evidence and scripts are in the repository."

**End card:** `https://siyaj-web.onrender.com` · `github.com/MrTHNR67/hussin-web` · evidence index.

---

## Checklist before recording

- [ ] Public endpoint warm (open it once, wait for the cold start to finish)
- [ ] Demo account credentials ready
- [ ] Terminal font ≥ 18 pt, repo root as working directory
- [ ] Autoscaler log file open (`\.run\autoscale-demo2.log`) or run the drill live
- [ ] Close notifications and unrelated tabs
- [ ] Rehearse once with a timer; cut anything over 3:00
