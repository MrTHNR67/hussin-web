# File Inventory — Siyaj Solar Guardian

Purpose of every file and folder (excluding `node_modules/`, `data/`, `backups/`, `.worktrees/`).

## Root folder
- `server.mjs` — Express app entry point: middleware, routes, static serving, health checks.
- `package.json` — project metadata, dependencies, `npm start` script.
- `package-lock.json` — locked dependency versions.
- `.env` — local secrets/config (not committed).
- `.env.example` — template of all environment variables.
- `.gitignore` — ignored paths (node_modules, data, backups, .worktrees, .superpowers).
- `README.md` — project overview and setup instructions.
- `render.yaml` — Render deployment configuration.
- `Dockerfile` — container image build.
- `docker-compose.yml` — multi-service local orchestration.
- `start-siyaj.bat` — one-click Windows launcher.

## `public/` — Frontend
- `index.html` — main application shell (auth, panels, analysis UI).
- `app.js` — client logic: authentication, panel data, Claude analysis, motion, guest flow.
- `styles.css` — main stylesheet.
- `motion.css` — animation styles (4 approved behaviours).
- `motion.js` — motion helper invoked on page navigation.
- `about.html` — about page.
- `privacy.html` — privacy policy.
- `sw.js` — service worker (PWA offline).
- `manifest.webmanifest` — PWA manifest.
- `google7cc29c20cc2a70ef.html` — Google site verification.
- `loaderio-...txt` — Loader.io domain verification.
- `assets/logo.png` — brand logo.

## `server/` — Backend modules
- `auth.mjs` — auth: register/login/guest/Google, sessions, tokens. Exports: registerAccount, registerGuestAccount, loginAccount, loginWithGoogle, authenticateToken, removeSession.
- `data-store.mjs` — data layer (SQLite/Postgres), media storage, app settings. Exports: readDatabase, updateDatabase, initializeDataStore, saveAccountMedia, etc.
- `claude-analysis.mjs` — Claude vision analysis of panel images and invoices. Exports: analyzePanelMedia, extractElectricityInvoice, validatePanelMedia.
- `solar-assessment.mjs` — solar context and monthly loss estimation. Exports: buildSolarContext, estimateMonthlyLoss.
- `weather-data.mjs` — weather snapshots and rainfall. Exports: fetchWeatherSnapshot, fetchRainfallSince, localDateInTimezone.
- `dust-wind-alerts.mjs` — daily dust/wind alert scheduler. Exports: runDailyDustWindCheck, startDustWindScheduler.
- `heat-cleaning-warning.mjs` — heat cleaning warning logic. Exports: createHeatCleaningWarning, heatWarningNeedsWork, retryHeatCleaningWarning.
- `heat-loss-report.mjs` — panel heat-loss analysis builder. Exports: buildPanelAnalysis, createPanelAnalysis, resolveAnalysisTemperature.
- `push-delivery.mjs` — Web Push notifications. Exports: getPushConfiguration, sendPushToUser, sendTestPush.
- `complaints.mjs` — complaint/report mail handling. Exports: normalizeComplaint, buildComplaintMailto, sendComplaint.
- `ai-usage.mjs` — Claude request quota/limits. Exports: reserveClaudeRequest.
- `audit.mjs` — auth event audit trail. Exports: recordAuthEvent, readAuthEvents.
- `rate-limit.mjs` — in-memory rate limiting/lockout. Exports: rateLimit, createLockout, clientIp.
- `security.mjs` — security headers/CSP. Exports: securityHeaders.

## `services/` — Microservices
- `weather/` — standalone weather service (Dockerfile, package.json, server.mjs).

## `scripts/` — Ops (PowerShell)
- `backup.ps1`, `restore.ps1` — DB backup/restore.
- `autoscale.ps1`, `start-cluster.ps1`, `stop-cluster.ps1` — cluster management.
- `monitor.ps1`, `keep-alive.ps1` — monitoring/uptime.
- `drill-dr.ps1` — disaster recovery drill.
- `verify-ha-lb.ps1`, `verify-iam.ps1`, `verify-upload.ps1` — verification scripts.
- `load-test.ps1` — load testing.

## `tests/` — Test suite (run: `node --test tests/*.mjs`)
- `guest-auth.test.mjs` — guest auth API tests.
- `guest-session-restore.test.mjs` — client session restore tests.
- `guest-ui.test.mjs` — guest UI rendering tests.
- `motion.test.mjs` — motion CSS/JS tests.
- `peak-end.test.mjs` — peak-end celebration tests.

## `docs/` — Documentation
- `READ-ME-FIRST.txt` — quick intro to the project.
- `HOW-TO-RUN.md` — local run guide.
- `CHANGES-REPORT.md` — change report.
- `LEADER-SUMMARY.md` — short summary for leadership.
- `STRUCTURE.md` — folder/file map.
- `FILE-INVENTORY.md` — this file.
- `project-guide.md` — full project guide.
- `README.md` — docs index/notes.
- `render-deployment.md` — Render deployment guide.
- `cloud-native.md`, `scaling.md`, `network.md`, `iam.md` — infrastructure docs.
- `architecture-blueprint.md`, `design-vercel-guest-mode.md` — design docs.
- `slides.md`, `video-script.md`, `submission-form.md` — presentation materials.
- `superpowers/plans/...` — implementation plans.
- `evidence/` — deployment/HA/DR evidence.

## Runtime (gitignored)
- `data/` — SQLite DB and uploads.
- `backups/` — DB backups.
- `node_modules/` — dependencies.
- `.worktrees/` — git worktrees.
