# Task 5 — Disaster Recovery (Evidence)

**Drill executed:** 2026-11-11 17:20:11–17:20:15 (Asia/Muscat, UTC+4)
**Reproduce:** `powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1`
**Scripts:** `scripts/backup.ps1`, `scripts/restore.ps1`, `scripts/drill-dr.ps1`
**Backup log:** `backups/backup-log.csv` (timestamp, file, bytes, SHA-256, source)

---

## 1. Recovery objectives

| Objective | Target | Achieved / plan |
|---|---|---|
| **RPO** (max acceptable data loss) | ≤ 5 minutes | local demo: backup task runs **every 5 minutes** (`SiyajBackup`) + manual backup before risky changes; measured in the drill: data written after the backup was lost by design |
| **RTO** (time to restore service) | ≤ 30 minutes for the cloud DB; ≤ 60 s for the demo stack | **1.44 s** automated restore measured on the demo stack (stop + copy + start + readiness checks); 2.2 s end-to-end outage in the drill |
| Backup retention | 24 copies (≈ 2 hours at 5-min cadence) | `backups/` folder, older copies pruned automatically |
| Backup integrity | every backup verified | SQLite header check + SHA-256 recorded in `backup-log.csv` |
| Restore safety | never destroy evidence | current DB archived as `data/siyaj.sqlite.pre-restore-<stamp>` before the swap |

---

## 2. What is backed up

**Demo / self-contained stack** — `data/siyaj.sqlite`, the application database that holds:

```text
users, sessions, account_states, account_media (metadata), ai_usage,
app_settings, panel_analyses, auth_events
```

The app re-opens this file on every request (`readDatabase()`), which is why a file-level
snapshot is a consistent logical backup for this deployment.

**Managed deployment (Render)** — `siyaj_app_state` (single row with the full application state),
`app_settings`, `panel_analyses` in PostgreSQL `siyaj-db`. Backup paths:

1. **Platform backups/PITR** — Render Postgres supports recovery from platform snapshots on paid
   plans; the free plan does **not** include point-in-time recovery, so the logical path below is
   the required control for the free tier.
2. **Logical dump** (portable, works on any plan):
   ```bash
   pg_dump "$DATABASE_URL" --format=custom --no-owner --file=siyaj-$(date +%Y%m%d-%H%M).dump
   ```
   The database IP allow-list is pinned to a non-routable range (Task 6), so an operator running
   `pg_dump` must temporarily add their public IP in the Render dashboard/API and remove it after.
3. **Restore** into a clean database, then point the service at it:
   ```bash
   pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" siyaj-YYYYMMDD-HHMM.dump
   ```
4. **Verification after restore:** `GET /healthz` = 200, `GET /readyz` = 200, log in with a known
   account, open a saved analysis, check `/api/admin/stats` counts.

> Render API operations were unavailable during this session (authenticated calls hung provider-side),
> so the Render logical dump was **not** executed end-to-end. The procedure above is the documented,
> reproducible path; the drill below proves the same backup→loss→restore→verify workflow on the
> application database with real data.

---

## 3. Drill timeline (actual output)

```text
[17:20:11.740] marker A: dr.early.350302@siyaj.om
[17:20:11.850] signup A -> HTTP 201
[17:20:11.850] taking online backup
BACKUP_FILE=...\backups\siyaj-20261111-172011.sqlite
BACKUP_BYTES=143360
BACKUP_SHA256=BA5FF5F48755E148C16298DD61AC6AF660D03319A0A3B3EB3760D7556E36C0AC
[17:20:11.918] marker B (after the backup): dr.late.350302@siyaj.om
[17:20:11.978] signup B -> HTTP 201
[17:20:12.227] SiyajAlwaysOn paused
[17:20:12.823] DATA LOSS simulated: database moved to data\siyaj.sqlite.LOST-20261111-172012
[17:20:12.824] restarting on an empty database (the disaster state)
[17:20:13.493] cluster ready on empty DB: True
[17:20:13.513] login A after loss -> HTTP 401 (expected 401)
[17:20:13.513] restoring from the latest backup
Database restored from backup (143360 bytes)
Started instance 3001 (PID 17872)
Started instance 3002 (PID 16776)
Started instance 3003 (PID 19708)
RECOVERY_OK in 1.44s (stop + restore + start + readiness)
[17:20:15.064] login A after restore -> HTTP 200 (expected 200)
[17:20:15.065] login B after restore -> HTTP 401 (expected 401, created after the backup)
[17:20:15.173] SiyajAlwaysOn resumed
```

Result summary:

```text
backup file        : siyaj-20261111-172011.sqlite
backup created     : 2026-11-11 17:20:11
data loss at       : 2026-11-11 17:20:12
service recovered  : 2026-11-11 17:20:15
total outage       : 2.2 s (includes drill pauses)
automated restore  : 1.44 s (stop + copy + start + readiness)
login A after loss : 401   <- data really was gone
login A restored   : 200   <- backup restored the account
login B (post-RPO) : 401   <- written after the backup, lost as expected (RPO window)
DRILL: PASS
```

---

## 4. Why this is a real DR test, not theatre

1. **The loss is real:** the database file was physically moved away; the restarted cluster created
   an empty database; marker A could not authenticate (`401`).
2. **The restore is real:** the backup file was validated (SQLite header, size, SHA-256) and copied
   back; all three instances were restarted and passed `/readyz`.
3. **RPO is demonstrated, not claimed:** marker B was created **after** the backup and is absent
   after restore (`401`). Data written after the last backup is exactly what an RPO window loses.
4. **RTO is measured:** the automated restore took 1.44 s; the full outage window (including the
   deliberate drill pauses) was 2.2 s.
5. **The backup is scheduled:** the `SiyajBackup` Windows task runs `scripts/backup.ps1` **every 5
   minutes**, keeps 24 verified copies, and appends a SHA-256 audit line.

---

## 5. Failure scenarios covered

| Scenario | Response |
|---|---|
| Accidental data deletion / corruption | restore latest verified backup (≤ 5 min old) |
| Application instance crash | `SiyajAlwaysOn` restarts it within 60 s; no data loss (DB external) |
| Bad deploy / migration | previous backup + `restore.ps1`; Render keeps previous deploy for rollback |
| Database host failure (cloud) | Render managed failover/restore; logical dump as portable fallback |
| Region outage (cloud) | restore the latest dump into a new region; RTO target ≤ 30 min |

---

## 6. Limitations and next steps

- The measured 1.44 s RTO is for the **local SQLite** demo stack. A Render Postgres restore moves a
  dump over the network; realistic RTO is **10–30 minutes** (restore + verify + restart), which is
  why the target is stated as ≤ 30 min for the cloud path.
- Backups live on the same host as the demo data. Production must copy dumps to object storage in a
  different failure domain (Render does this for managed plans; for the demo, a `robocopy`/`scp`
  step to a second disk or bucket is the next improvement).
- No automated restore-drill in CI yet; this document plus `scripts/drill-dr.ps1` make it repeatable
  on demand.
- The free Render Postgres instance expires on **2026-12-11**; a reminder and an export before
  expiry are required (data would otherwise be deleted by the provider).
