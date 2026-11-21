# Submission Form — Enterprise Cloud-Native Architecture Hackathon 2026

**Project / site name:** تكنو موسى (Techno Musa) — رفيق الطاقة الشمسية
**Team:** فريق سياج (Siyaj Team)

> Fill the remaining bracketed fields (`[...]`) before submitting: team member details, the video
> link and the sign-off. Everything else is live and verified.

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
| Cloud provider | **Render** (managed PaaS on a Cloudflare edge) |
| Region | **Frankfurt (EU Central)** |
| Public endpoint | **https://siyaj-web.onrender.com** |
| Health checks | `https://siyaj-web.onrender.com/healthz` · `/readyz` |
| Compute | Render Web Service `siyaj-web`, free plan, Node.js |
| Database | Render Postgres 16 `siyaj-db`, free plan, private hostname + TLS |
| Local evidence stack | Nginx `:8080` → 3 Node replicas `:3001–3003` (HA/LB/autoscale drills) |

## Links

| Deliverable | Link |
|---|---|
| Repository | https://github.com/MrTHNR67/hussin-web (public) |
| Source branch | https://github.com/MrTHNR67/hussin-web/tree/main |
| Evidence index | https://github.com/MrTHNR67/hussin-web/blob/main/docs/evidence/README.md |
| Architecture blueprint | https://github.com/MrTHNR67/hussin-web/blob/main/docs/architecture-blueprint.md |
| Render deployment guide | https://github.com/MrTHNR67/hussin-web/blob/main/docs/render-deployment.md |
| Slides | https://github.com/MrTHNR67/hussin-web/blob/main/docs/slides.md |
| Video | **[ADD VIDEO LINK — ≤ 3 minutes]** |
| Submission form | https://github.com/MrTHNR67/hussin-web/blob/main/docs/submission-form.md |

## How judges can access the environment

1. **Public application** — open `https://siyaj-web.onrender.com`. HTTPS, no signup needed.
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

5. **No cloud credentials are shared.** Render and database dashboard access stays with the team; judges
   get the public endpoint, repository access, evidence files and reproduction scripts.

## Originality declaration

We declare that the application code, infrastructure scripts, tests and documentation in this
repository were produced by the team during the hackathon window, using open-source libraries listed
in `package.json` and public weather APIs. No third-party code or data was submitted as our own work.
No cloud passwords, access keys or confidential data are included in the repository or the evidence.

**Signed:** [TEAM LEADER NAME] — [DATE]

## Teardown (after evaluation)

```bash
# cloud (dashboard): delete the Render web service and Postgres database
# local:
powershell -ExecutionPolicy Bypass -File scripts\stop-cluster.ps1
Unregister-ScheduledTask -TaskName 'SiyajAlwaysOn' -Confirm:$false
Unregister-ScheduledTask -TaskName 'SiyajBackup'   -Confirm:$false
# remove local artifacts
Remove-Item -Recurse -Force .run, backups, data\siyaj.sqlite*
```

## Known limitations (also in the blueprint)

- The Render free Postgres expires **2026-12-11**; a reminder and an export plan are documented.
- The «قراءة تقديرية للألواح» button is a 2.5 s visual simulation in the browser; it adds no AI
  backend and uploads no images. Bill extraction with Claude remains optional and server-side.
- Local HA/LB, autoscaling and DR evidence comes from the on-premise Nginx + Node stack; the public
  Render service relies on the platform's managed scaling instead.
- No WAF/MFA yet; guest account rows are not garbage-collected automatically.
