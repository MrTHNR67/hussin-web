# Submission Form — Enterprise Cloud-Native Architecture Hackathon 2026

**Project / site name:** تكنو موسى (Techno Musa) — رفيق الطاقة الشمسية
**Team:** فريق سياج (Siyaj Team)

> Fill the remaining bracketed fields (`[...]`) before submitting. Items marked **pending** must be
> confirmed after the Vercel deployment is live.

## Team

| Field | Value |
|---|---|
| Team name | فريق سياج (Siyaj Team) |
| University | جامعة التقنية والعلوم التطبيقية فرع مسقط |
| Member 1 | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 2 | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 3 (optional) | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 4 (optional) | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Contact | [PHONE / EMAIL] |

## Deployment

| Field | Value |
|---|---|
| Cloud provider | **Vercel** (Serverless Functions + edge network) |
| Region | Vercel default (global edge); database region chosen in Neon |
| Public endpoint | **[PENDING — Vercel deployment URL]** |
| Health checks | `<DEPLOY_URL>/healthz` · `<DEPLOY_URL>/readyz` |
| Compute | Vercel Serverless Function `api/index.js` → `server.mjs`, Node.js |
| Database | **Neon Postgres**, connected through `DATABASE_URL` |
| Local evidence stack | Nginx `:8080` → 3 Node replicas `:3001–3003` (HA/LB/autoscale drills) |

## Links

| Deliverable | Link |
|---|---|
| Repository | https://github.com/MrTHNR67/hussin-web (private; judges added as collaborators) |
| Branch used for this build | https://github.com/MrTHNR67/hussin-web/tree/vercel-guest-mode (merge to `main` before final submission) |
| Evidence index | https://github.com/MrTHNR67/hussin-web/blob/main/docs/evidence/README.md |
| Architecture blueprint | https://github.com/MrTHNR67/hussin-web/blob/main/docs/architecture-blueprint.md |
| Vercel deployment guide | https://github.com/MrTHNR67/hussin-web/blob/main/docs/vercel-deployment.md |
| Slides | https://github.com/MrTHNR67/hussin-web/blob/main/docs/slides.md |
| Video | **[ADD VIDEO LINK — ≤ 3 minutes]** |
| Submission form | https://github.com/MrTHNR67/hussin-web/blob/main/docs/submission-form.md |

## How judges can access the environment

1. **Public application** — open `<DEPLOY_URL>`. HTTPS, no signup needed.
2. **Guest entry** — enter **any name** and **any tribe** in the two fields on the landing card, then
   press «ابدأ التجربة». There is no password, no account and no admin role in the UI. The name and
   tribe are stored only in that browser (`localStorage`) and persist across reloads.
3. **Denied-access checks** (no credentials needed): unauthenticated `GET /api/admin/stats` → `401`;
   a guest session cookie/Bearer token → `403`. Security headers and HSTS are present on HTTPS.
4. **Full resilience/DR drills** run on the local stack (scripts + expected outputs are committed):

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1
   powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1
   ```

5. **No cloud credentials are shared.** Vercel and Neon dashboard access stays with the team; judges
   get the endpoint, private-repository access, evidence files and reproduction scripts.

## Originality declaration

We declare that the application code, infrastructure scripts, tests and documentation in this
repository were produced by the team during the hackathon window, using open-source libraries listed
in `package.json` and public weather APIs. No third-party code or data was submitted as our own work.
No cloud passwords, access keys or confidential data are included in the repository or the evidence.

**Signed:** [TEAM LEADER NAME] — [DATE]

## Teardown (after evaluation)

```bash
# cloud (dashboard): delete the Vercel project and the Neon database
# local:
powershell -ExecutionPolicy Bypass -File scripts\stop-cluster.ps1
Unregister-ScheduledTask -TaskName 'SiyajAlwaysOn' -Confirm:$false
Unregister-ScheduledTask -TaskName 'SiyajBackup'   -Confirm:$false
# remove local artifacts
Remove-Item -Recurse -Force .run, backups, data\siyaj.sqlite*
```

Also revoke the retired Render API key that was used during the earlier hosting attempt.

## Known limitations (also in the blueprint)

- The Vercel project and the Neon database are new; the previous Render free Postgres expired
  **2026-12-11** and its service is retired.
- The «قراءة تقديرية للألواح» button is a 2.5 s visual simulation in the browser; it adds no AI
  backend and uploads no images. Bill extraction with Claude remains optional and server-side.
- Local HA/LB, autoscaling and DR evidence comes from the on-premise Nginx + Node stack; the Vercel
  deployment relies on the platform's managed scaling instead.
- No WAF/MFA yet; guest account rows are not garbage-collected automatically.
