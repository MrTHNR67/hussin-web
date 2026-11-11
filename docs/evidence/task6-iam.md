# Task 6 — Security & Identity / Access Management (Evidence)

**Collected:** 2026-11-11 16:55–17:00 (Asia/Muscat, UTC+4)
**Environments:**
- `LIVE` = https://siyaj-web.onrender.com (Render, Frankfurt, HTTPS managed by Render)
- `LOCAL` = 3 Node instances (3001–3003) behind Nginx on `127.0.0.1:8080`

Reproduce with: `powershell -ExecutionPolicy Bypass -File scripts/verify-iam.ps1 -BaseUrl <url>`

---

## 1. Denied unauthorized request (rubric: 5 marks)

| # | Test | Command | Observed | Expected |
|---|---|---|---|---|
| 1.1 | No session → admin API | `GET /api/admin/stats` | **HTTP 401** | 401 |
| 1.2 | Normal user session → admin API | `GET /api/admin/stats` (cookie `siyaj_session` of `demo@siyaj.om`) | **HTTP 403** | 403 |
| 1.3 | Admin session (`SIYAJ_ADMIN_EMAILS=iam.demo@siyaj.om` on a local instance) | `GET /api/admin/stats` | **HTTP 200** + stats JSON | 200 |
| 1.4 | Credential brute force (10 bad logins, same identifier) | `POST /api/auth/login` ×11 | attempts 1–10 = **401**, attempt 11 = **429** + `Retry-After: 900` | 429 |
| 1.5 | Cloud API without credentials | `GET https://api.render.com/v1/owners` (no `Authorization`) | **HTTP 401** | 401 |

Raw output (LIVE, 17:00:03 +04:00):

```text
GET https://siyaj-web.onrender.com/api/admin/stats            -> HTTP 401
POST https://siyaj-web.onrender.com/api/auth/login            -> HTTP 200 (demo@siyaj.om)
GET https://siyaj-web.onrender.com/api/admin/stats (cookie)   -> HTTP 403
GET https://api.render.com/v1/owners (no Authorization)       -> HTTP 401  (0.28 s)
```

Raw output (LOCAL, 16:55:20 +04:00):

```text
HTTP 401 | /api/admin/stats (no cookie)
signup HTTP 201 (user iam_demo, role=user)
HTTP 403 | /api/admin/stats (role=user)
instance 3004 with SIYAJ_ADMIN_EMAILS=iam.demo@siyaj.om
login HTTP 200 -> /api/admin/stats HTTP 200
```

Local admin response (excerpt):

```json
{"users":3,"admins":1,"activeSessions":11,"panelAnalyses":6,"authEvents":39}
```

Brute-force lockout (LOCAL, 3001, 11 attempts on `nobody@example.com`):

```text
1..10 -> 401
11    -> 429   (account_locked, retry_after=900s)
```

---

## 2. Least-privilege design (rubric: 5 marks)

| Control | Where | Evidence |
|---|---|---|
| Dedicated DB role, not `postgres` | Render Postgres `siyaj_user` | connection string user = `siyaj_user` (secret not published) |
| App reaches DB over the private/internal hostname | Render env `DATABASE_URL` (internal URL, no public DNS suffix) | deploy log: `Siyaj data store: Postgres is ready` |
| Database requires password + TLS | TCP 5432 is reachable on the external hostname, but authentication and TLS are mandatory | see §5; the app does not use the external address |
| Row Level Security on shared tables | `server/data-store.mjs` (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`) | tables `siyaj_app_state`, `app_settings`, `panel_analyses` |
| Browser DB roles revoked when present | `server/data-store.mjs` (`REVOKE … FROM PUBLIC, anon, authenticated` only if roles exist) | commit `397b078` |
| Admin role derived from server-side allow-list, never from request input | `SIYAJ_ADMIN_EMAILS` → `requireRole('admin')` | test 1.3 |
| No hardcoded credentials | `git grep` scan of 62 tracked files | §4 |
| Secrets only in environment | `DATABASE_URL`, `SUPABASE_SECRET_KEY`, `SIYAJ_JOB_SECRET`, `GOOGLE_CLIENT_ID` read via `process.env` | `server.mjs`, `server/data-store.mjs` |
| Session tokens stored hashed | `server/auth.mjs` (SHA-256 of token) | code review |
| Password hashing | `scrypt` + random salt | `server/auth.mjs` |
| Job/alert endpoint authenticated | HMAC-SHA256 + nonce + 15-min window + `timingSafeEqual` | `server.mjs` |

"Admin" is computed per request from an explicit server-side allow-list, so a user cannot self-promote
by editing a payload or a database row.

---

## 3. Protected network boundary (rubric: 5 marks)

Security headers on `LIVE` (17:00:03 +04:00):

```text
strict-transport-security: max-age=31536000; includeSubDomains
content-security-policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; ...
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: no-referrer
x-powered-by: <absent>
```

- `script-src-attr 'none'` blocks inline event handlers (XSS hardening).
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` block clickjacking.
- HSTS is sent only when `NODE_ENV=production` (Render); the local HTTP stack deliberately omits it.
- The application port is not exposed directly to users: Render terminates TLS and proxies to the app;
  locally Nginx (8080) is the only public entry point and backends listen on loopback-only ports.
- IaC network segmentation (VPC/subnets/NSG/firewall) is in `docs/network.md`, `deploy/azure/`, `deploy/gcp/`
  for the provider-native deployment path; the PaaS deployment relies on Render's managed boundary.

---

## 4. Credential hygiene scan (17:00 +04:00)

```text
git grep -E "rnd_[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}"   -> no matches
git grep "PRIVATE KEY"                                                    -> no matches
git ls-files | grep "\.env$"                                              -> not tracked
.gitignore: node_modules/, .env, data/, .run/, *.log, nginx/logs/
```

Only placeholders appear in tracked files, e.g. `postgresql://$pgUser@$pgName...` inside the
Azure/GCP deployment scripts (variables, no password).

---

## 5. Database exposure test (16:57 +04:00, corrected)

Connecting to the Render Postgres **external** hostname from a normal Internet host:

```text
host   : dpg-dbq5rcjm8hqs739u4r7g-a.frankfurt-postgres.render.com
tcp 5432 reachable: True
pg client (TLS, password auth): Error: Connection terminated unexpectedly
```

What this means, precisely:

- The database **is** reachable on the provider's external hostname (Render enables external
  access by default). TCP 5432 is open.
- Authentication is still required: a client without the correct role/password and TLS cannot
  query data; the unauthenticated attempt above was dropped during connection setup.
- The application itself does **not** use the external address. It connects through the internal
  `DATABASE_URL` on Render's private network (`Siyaj data store: Postgres is ready`), so normal
  traffic never crosses the public database endpoint.
- **Hardening required:** pin the Render Postgres IP allow-list to the operator's egress IP (or an
  empty set where the plan supports it) once dashboard/API management is available. This is listed
  as a limitation below instead of being claimed as already done.

---

## 6. Limitations (disclosed, not hidden)

- Rate limiting and the login lockout are **per instance** (in-memory). With multiple replicas the
  effective limit multiplies; mitigation: Nginx `limit_req` at the edge, or a shared Redis store later.
- No WAF; Render's managed edge + CSP + strict headers are the current controls.
- Multi-factor authentication for admins is not enabled (documented as future work).
- Render Postgres exposes an external endpoint (TCP 5432 reachable) with password + TLS auth; the app
  uses the internal URL, and pinning the IP allow-list is the next hardening step.
- The Render API endpoint hung for authenticated calls during this session (provider-side incident);
  the 401-without-credentials check still completed, and no privileged action depends on it.

---

## 7. Related files

- `docs/iam.md` — full control catalogue and threat→control matrix.
- `scripts/verify-iam.ps1` — automated reproduction of §1 and §3.
- `server/auth.mjs`, `server/security.mjs`, `server/rate-limit.mjs`, `server/data-store.mjs`.
