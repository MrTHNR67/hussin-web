# Project Structure — Siyaj Solar Guardian

Top-level layout and where to find things.

## Root
- `server.mjs` — Express entry point, wires routes and middleware.
- `package.json` / `package-lock.json` — Node dependencies and scripts (`npm start`).
- `.env` / `.env.example` — environment variables (secrets, DB, VAPID, Google OAuth).
- `render.yaml` — Render deployment config.
- `start-siyaj.bat` — one-click local launcher.
- `Dockerfile`, `docker-compose.yml` — container build.
- `README.md` — project overview and setup.

## `public/` — Frontend (static assets served by Express)
- `index.html` — main app shell.
- `app.js` — client logic (auth, panels, analysis, motion).
- `styles.css`, `motion.css` — styling.
- `motion.js` — animation helper.
- `about.html`, `privacy.html` — static pages.
- `sw.js`, `manifest.webmanifest` — PWA.
- `assets/` — images (logo, etc.).

## `server/` — Backend modules (route handlers / services)
- `auth.mjs` — authentication (guest, Google, admin).
- `data-store.mjs` — SQLite/Postgres data layer.
- `claude-analysis.mjs` — AI analysis integration.
- `solar-assessment.mjs` — solar assessment logic.
- `weather-data.mjs` — weather integration.
- `dust-wind-alerts.mjs`, `heat-cleaning-warning.mjs`, `heat-loss-report.mjs` — alert/report modules.
- `ai-usage.mjs`, `audit.mjs`, `complaints.mjs`, `push-delivery.mjs` — supporting services.
- `rate-limit.mjs`, `security.mjs` — middleware.

## `services/` — Separate microservices
- `weather/` — weather service (Dockerfile + server.mjs).

## `scripts/` — Ops / maintenance PowerShell scripts
- Backups, monitoring, autoscale, DR drills, verification.

## `tests/` — Node test suite (`node --test tests/*.mjs`)
- `guest-*.test.mjs`, `motion.test.mjs`, `peak-end.test.mjs`.

## `docs/` — Documentation
- `READ-ME-FIRST.txt` — quick intro.
- `HOW-TO-RUN.md` — local run guide.
- `CHANGES-REPORT.md` — change report.
- `LEADER-SUMMARY.md` — short summary for leadership.
- `project-guide.md` — full project guide.
- `render-deployment.md`, `cloud-native.md`, `scaling.md`, `network.md`, `iam.md` — infra docs.
- `architecture-blueprint.md`, `design-vercel-guest-mode.md` — design docs.
- `STRUCTURE.md` — this file.

## `data/` — Runtime data (SQLite DB, uploads) — gitignored.
## `backups/` — DB backups — gitignored.
## `node_modules/` — dependencies — gitignored.
## `.worktrees/` — git worktrees — gitignored.
