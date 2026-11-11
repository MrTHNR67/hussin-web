# Submission Form — Enterprise Cloud-Native Architecture Hackathon 2026

> Fill the bracketed fields (`[...]`) before submitting. Everything else is final and verified.

## Team

| Field | Value |
|---|---|
| Team name | [TEAM NAME] |
| Member 1 | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 2 | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 3 (optional) | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| Member 4 (optional) | [FULL NAME] — [EMAIL] — [STUDENT ID] |
| University | [UNIVERSITY] |
| Contact | [PHONE / EMAIL] |

## Deployment

| Field | Value |
|---|---|
| Cloud provider | **Render** (managed PaaS on a Cloudflare edge) |
| Region | **Frankfurt (EU Central)** |
| Public endpoint | **https://siyaj-web.onrender.com** |
| Health checks | `https://siyaj-web.onrender.com/healthz` · `/readyz` |
| Compute | Render Web Service `siyaj-web`, free plan, Node.js 24 |
| Database | Render Postgres 16 `siyaj-db`, free plan, private hostname + TLS |
| Local evidence stack | Nginx `:8080` → 3 Node replicas `:3001–3003` (HA/LB/autoscale drills) |

## Links

| Deliverable | Link |
|---|---|
| Repository | https://github.com/MrTHNR67/hussin-web |
| Evidence index | https://github.com/MrTHNR67/hussin-web/blob/main/docs/evidence/README.md |
| Architecture blueprint | https://github.com/MrTHNR67/hussin-web/blob/main/docs/architecture-blueprint.md |
| Test evidence | https://github.com/MrTHNR67/hussin-web/tree/main/docs/evidence |
| Slides | https://github.com/MrTHNR67/hussin-web/blob/main/docs/slides.md |
| Video | [ADD VIDEO LINK — ≤ 3 minutes] |
| Submission form | https://github.com/MrTHNR67/hussin-web/blob/main/docs/submission-form.md |

> Repository visibility: the code contains no secrets (`git grep` verified). If the judges require a
> private repository, make it private and add the judge accounts listed in the organizer brief; the
> team will confirm access before the deadline.

## How judges can access the environment

1. **Public application** — open https://siyaj-web.onrender.com (HTTPS, no account needed to view).
   The free plan sleeps after 15 minutes idle; the first request may take 30–50 seconds.
2. **Demo account** (synthetic data only):

   ```text
   username : demo_siyaj
   email    : demo@siyaj.om
   password : DemoPass1234
   ```

3. **Denied-access checks** (no credentials needed):

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\verify-iam.ps1 -BaseUrl https://siyaj-web.onrender.com
   ```

   Expected: unauthenticated admin API → 401, normal user → 403, security headers present, HSTS on HTTPS.
4. **Full resilience/DR drills** run on the local stack (scripts + expected outputs are committed):

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\verify-ha-lb.ps1
   powershell -ExecutionPolicy Bypass -File scripts\drill-dr.ps1
   ```

5. **No cloud credentials are shared.** Render dashboard access remains with the team; the judges get
   the endpoint, the repository, the evidence files and the reproduction scripts.

## Originality declaration

We declare that the application code, infrastructure scripts, tests and documentation in this
repository were produced by the team during the hackathon window, using open-source libraries listed
in `package.json` and public weather/identity APIs. No third-party code or data was submitted as our
own work. No cloud passwords, access keys or confidential data are included in the repository or the
evidence.

**Signed:** [TEAM LEADER NAME] — [DATE]

## Teardown (after evaluation)

```bash
# cloud (dashboard or CLI): delete the Render web service and Postgres instance
# local:
powershell -ExecutionPolicy Bypass -File scripts\stop-cluster.ps1
Unregister-ScheduledTask -TaskName 'SiyajAlwaysOn' -Confirm:$false
Unregister-ScheduledTask -TaskName 'SiyajBackup'   -Confirm:$false
# remove local artifacts
Remove-Item -Recurse -Force .run, backups, data\siyaj.sqlite*
```

## Known limitations (also in the blueprint)

- Free Render service sleeps after 15 minutes idle; free Postgres expires **2026-12-11**.
- Public endpoint is PaaS; the Azure/GCP VPC/NSG designs are executable but were not applied.
- Single region; no WAF/MFA yet; Render Postgres external endpoint requires IP allow-list pinning.
- Uploaded media on Render is ephemeral across redeploys (object storage supported but not enabled).
