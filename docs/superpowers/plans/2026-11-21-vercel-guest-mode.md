# Siyaj Vercel Guest Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the existing Express/Postgres Siyaj app to Vercel, replace login with a name + tribe guest entry that persists in the same browser, and layer the requested motion and fake AI button on the unchanged design.

**Architecture:** Keep the existing Express app and all pages; wrap it in one Vercel Serverless Function. Add a passwordless guest session endpoint that reuses the current token/cookie machinery, so every existing data endpoint keeps working. All UI work is additive on the current HTML/CSS; no visual redesign.

**Tech Stack:** Node 20, Express 4, `pg`/sql.js data store, Vercel `@vercel/node`, Neon Postgres, vanilla JS/CSS, `node:test`.

**Spec:** `docs/design-vercel-guest-mode.md`

## Global Constraints

- Platform: **Vercel with the full backend** (chosen option ب). No Render deployment after cutover.
- Design: **same HTML/CSS and all pages** (dashboard, wizard, history, reports, report, settings). Do not redesign.
- Entry: delete login/signup UI; in the same card place fields **الاسم** and **القبيلة**. No password, no registration.
- Persistence: guest token and identity live in `localStorage` of the **same browser** only.
- AI: existing `analyze-panels` button becomes a **2.5 s visual fake**; add **no backend AI code** and no new AI endpoint.
- Motion: squash & stretch 80–150 ms on page container only; slow-in `cubic-bezier(0.16,1,0.3,1)` / slow-out `(0.7,0,0.84,0)`; icon hover scale `1.08`; Peak-End after last panel-data step: ~400 ms celebration, stagger 30–60 ms, cascade <300 ms.
- Accessibility: respect `prefers-reduced-motion`; touch targets ≥44 px.
- Weather path: keep Open-Meteo primary and MET Norway fallback.
- Secrets: `DATABASE_URL` and all keys go to Vercel Environment Variables; never commit. Guest role is not admin.

## Review Focus

1. Stale/invalid guest token in `localStorage` → guest form reappears without a crash or blank page. Test: `tests/guest-ui.test.mjs` asserts boot path handles a non-2xx `/api/auth/session` by clearing `siyaj_guest_token` and showing `#page-auth`.
2. Guest tries an admin endpoint → no admin data. Test: `tests/guest-auth.test.mjs` asserts a guest session gets 403 from `/api/admin/stats`.
3. Empty or over-long name/tribe → 400 and no session. Test: `tests/guest-auth.test.mjs` asserts 400 for `''`, `' '`, and 200-character values.
4. `prefers-reduced-motion: reduce` → no animation, all content still visible. Test: `tests/motion.test.mjs` asserts a `@media (prefers-reduced-motion: reduce)` block that sets `animation: none !important` and `transition: none !important`.
5. Double-click on the fake AI button → one 2.5 s sequence, no duplicate result, no `/api/panel/analysis` request. Test: `tests/peak-end.test.mjs` asserts the handler guards with `analysisBusy` and contains no `/api/panel/analysis` call.

---

### Task 1: Passwordless guest session + Vercel serverless entry

**Files:**
- Modify: `server/auth.mjs` (add `registerGuestAccount`, extend `safeUser`)
- Modify: `server.mjs` (add `POST /api/auth/guest`; guard `app.listen`)
- Create: `api/index.js`, `vercel.json`
- Modify: `package.json` (add `test` script)
- Create: `tests/guest-auth.test.mjs`
- Modify: `.env.example` (Vercel note only)

**Interfaces:**
- Consumes: existing `readDatabase`, `updateDatabase`, `authenticateToken`, `requireAuth`, `sendAuthSession`, `authIpLimit`, `securityHeaders`.
- Produces: `POST /api/auth/guest` accepting `{ name, tribe }` → `200 { user: { id, role:'guest', name, tribe, ... } }` plus `siyaj_session` cookie; `400` on invalid input. `registerGuestAccount({ name, tribe }) -> { token, user }` from `server/auth.mjs`.

- [ ] **Step 1: Write failing tests in `tests/guest-auth.test.mjs`**

Use `node:test` with a temp `SIYAJ_DATA_DIR` (sql.js path, no `DATABASE_URL`). Assert: valid guest → 200 + `role === 'guest'` + cookie set; `''`, `' '`, and 200-char name/tribe → 400; guest session → 403 on `/api/admin/stats`.

- [ ] **Step 2: Run `npm test` and confirm the new tests FAIL** with 404 / missing export.

- [ ] **Step 3: Implement `registerGuestAccount` in `server/auth.mjs`**

Signature `registerGuestAccount({ name, tribe })`. Normalize with `normalizeUsername`-style trim, require 1–40 chars each, generate a user with `role: 'guest'`, `name`, `tribe`, no password, and issue a session via the existing token helper. Extend `safeUser` to include `tribe: user.tribe || ''`.

- [ ] **Step 4: Implement `POST /api/auth/guest` in `server.mjs`**

Use `authIpLimit`, call `registerGuestAccount`, respond with `sendAuthSession(res, session)`. Add `if (!process.env.VERCEL && !process.env.SIYAJ_TEST) { app.listen(...) }`.

- [ ] **Step 5: Create `api/index.js` and `vercel.json`**

`api/index.js`: `export { default } from '../server.mjs';` after confirming `server.mjs` default-exports `app` (add `export default app` in Step 4). `vercel.json`: `@vercel/node` build for `api/index.js`, rewrites `/api/(.*)` → `api/index.js`, static serving from `public`.

- [ ] **Step 6: Run `npm test`; all tests PASS.**

- [ ] **Step 7: Commit**

```bash
git add server/auth.mjs server.mjs api/index.js vercel.json package.json .env.example tests/guest-auth.test.mjs
git commit -m "feat: passwordless guest session and Vercel serverless entry"
```

### Task 2: Replace the login screen with name + tribe (same visual design)

**Files:**
- Modify: `public/index.html:167-202` and `public/index.html:53`
- Modify: `public/app.js:2691-2950`, `public/app.js:1447-1454`, `public/app.js:1120`
- Modify: `tests/guest-ui.test.mjs` (new)
- Modify: `public/styles.css` only if a new hint line needs styling (reuse `.auth-field`, `.panel`, `.auth-card`)

**Interfaces:**
- Consumes: `POST /api/auth/guest` from Task 1; existing `state`, `persist()`, `showPage()`, `syncHeader()`, `applyLanguage()`.
- Produces: `localStorage.siyaj_guest_token`; `state.user` populated for guests; boot function `restoreGuestSession()`.

- [ ] **Step 1: Write failing static DOM tests in `tests/guest-ui.test.mjs`**

Read `public/index.html` and assert: contains `id="guest-name"` and `id="guest-tribe"`; does NOT contain `id="login-form"` or `id="signup-form"`; header no longer has text `تسجيل الدخول`. Read `public/app.js` and assert it contains `restoreGuestSession` and `siyaj_guest_token`.

- [ ] **Step 2: Run `npm test`; confirm FAIL.**

- [ ] **Step 3: Replace the auth card markup in `public/index.html`**

Keep `.auth-layout`, `.auth-heading`, `.panel.auth-card`, `.auth-form`, `.auth-field`, `.button-primary` classes unchanged. New form `id="guest-form"` with labels `الاسم` and `القبيلة`, inputs `guest-name` / `guest-tribe` (`required`, `maxlength="40"`), submit `ابدأ التجربة`. Remove tabs, both forms, Google button, logout button, and the cloud-sync note; keep the privacy link. Change nav button at line 53 to show the guest name instead of `تسجيل الدخول`.

- [ ] **Step 4: Rewire `public/app.js`**

Replace `authMode`, `setAuthMode`, `renderAuth`, `handleLogin`, `handleSignup` with `handleGuestSubmit()`: `POST /api/auth/guest` with `{ name, tribe }`, save `session.user` + token to `localStorage`, call `finishServerAuth(session)`. Add `restoreGuestSession()`: if token exists call `/api/auth/session`; on 401 clear the token and call `showPage('auth')`. In `showPage`, keep the `!state.user` guard. Remove listeners for the deleted IDs and add `#guest-form` submit listener. Update the i18n dictionary with the new Arabic strings.

- [ ] **Step 5: Run `npm test`; all tests PASS.**

- [ ] **Step 6: Manual smoke: start locally with `npm start`, open `/`, submit name + tribe, confirm redirect to wizard/dashboard and that reload keeps the session. Commit.**

```bash
git add public/index.html public/app.js public/styles.css tests/guest-ui.test.mjs
git commit -m "feat: guest name and tribe entry replaces login"
```

### Task 3: Motion layer over the unchanged design

**Files:**
- Create: `public/motion.css`, `tests/motion.test.mjs`
- Modify: `public/index.html` (stylesheet + module script before `app.js`)
- Modify: `public/app.js` (`showPage` transition hook)

**Interfaces:**
- Consumes: `showPage(page)` from Task 2; existing `.page`, `.button`, icon markup.
- Produces: `window.SiyajMotion.playPageTransition(container)` called by `showPage`; CSS classes `.page-enter`, `.icon-hoverable`.

- [ ] **Step 1: Write failing tests in `tests/motion.test.mjs`**

Assert `public/motion.css` contains `cubic-bezier(0.16, 1, 0.3, 1)`, `cubic-bezier(0.7, 0, 0.84, 0)`, `scaleX(1.1)` with `scaleY(0.9)`, `scale(1.08)`, and the `@media (prefers-reduced-motion: reduce)` block from Review Focus #4. Assert `public/app.js` calls `SiyajMotion.playPageTransition`.

- [ ] **Step 2: Run `npm test`; confirm FAIL.**

- [ ] **Step 3: Create `public/motion.css`**

Page enter: 120 ms squash/stretch on the container (`scaleX(1.1) scaleY(0.9)` → `1`), easing `cubic-bezier(0.16,1,0.3,1)`. Buttons: enter/leave transitions using the two exact curves. Icons: `.icon-hoverable:hover svg { transform: scale(1.08); }` with `transform-origin: center`. Reduced-motion block disables animation and transition with `!important`.

- [ ] **Step 4: Hook `showPage` in `public/app.js`**

After toggling `hidden`, call `window.SiyajMotion?.playPageTransition?.(el('page-' + page))`. Do not animate numbers or text nodes; add `icon-hoverable` to existing icon buttons via a single `querySelectorAll` pass.

- [ ] **Step 5: Run `npm test`; all tests PASS. Verify in browser with reduced-motion enabled that all pages remain visible. Commit.**

```bash
git add public/motion.css public/index.html public/app.js tests/motion.test.mjs
git commit -m "feat: add squash-stretch, slow in-out and icon hover motion"
```

### Task 4: Peak-End moment and visual-only AI button

**Files:**
- Modify: `public/app.js` (step 3 confirmation ~1422, `runAnalysis` ~2015, listener ~2959)
- Modify: `public/motion.css` (celebration keyframes)
- Create: `tests/peak-end.test.mjs`

**Interfaces:**
- Consumes: `state`, `persist()`, `showPage`, `renderDashboard`, `motion.css` classes.
- Produces: `playPeakEnd()` and `runFakeAnalysis()` globals in `app.js`; result stays in the existing toast/display area.

- [ ] **Step 1: Write failing tests in `tests/peak-end.test.mjs`**

Assert `public/app.js` defines `playPeakEnd` and `runFakeAnalysis`, that `runFakeAnalysis` contains `2500` and `analysisBusy`, and that it contains no `/api/panel/analysis` string. Assert `public/motion.css` defines a `peak-burst` keyframe and a stagger delay under 300 ms.

- [ ] **Step 2: Run `npm test`; confirm FAIL.**

- [ ] **Step 3: Implement `playPeakEnd()`**

Trigger once after the last panel-data step is saved (the step-3 confirmation save path near line 1530). Show a `.peak-burst` overlay for 400 ms with 40 ms stagger on its children, then remove it and continue to the existing result view. Respect reduced-motion by skipping the overlay.

- [ ] **Step 4: Implement `runFakeAnalysis()` and rebind the button**

On `#analyze-panels` click: if `analysisBusy` return; set busy, show the existing spinner markup, `await new Promise(r => setTimeout(r, 2500))`, clear busy, show a neutral Arabic result message ("تم تجهيز القراءة التقديرية") in the existing toast area. Remove the `runAnalysis({ useClaude: true })` call for this button. Add no server route and no fetch.

- [ ] **Step 5: Run `npm test`; all tests PASS. Manually confirm the browser Network tab shows no analysis request. Commit.**

```bash
git add public/app.js public/motion.css tests/peak-end.test.mjs
git commit -m "feat: peak-end celebration and simulated analysis button"
```

### Task 5: Vercel deployment with Neon Postgres

**Files:**
- Create: `docs/vercel-deployment.md`
- Modify: `README.md`, `.gitignore`
- Delete: `render.yaml`
- Verify: `vercel.json`, `api/index.js` from Task 1

**Interfaces:**
- Consumes: all prior tasks; `DATABASE_URL` supplied by the human operator from Neon.
- Produces: live Vercel URL; documented env vars and rollback.

- [ ] **Step 1: Collect the human-only inputs**

Ask the operator for the Neon **Connection string** and confirm they are logged into Vercel with the GitHub account `MrTHNR67`. Do not paste the secret into chat logs, issues, or repo files.

- [ ] **Step 2: Link and configure**

Run `vercel link` in the repo, then `vercel env add DATABASE_URL production` using the operator-provided value. Add `NODE_ENV=production` and any other existing secrets from `.env.example` that are actually used. Data-store creates tables on first boot; no manual SQL migration needed for an empty Neon database.

- [ ] **Step 3: Deploy and verify**

Run `vercel --prod`. Expected: deploy succeeds. Then verify with `curl`:
- `GET /healthz` → 200 `{"status":"ok",...}`
- `GET /readyz` → 200 `{"status":"ready",...}` (proves Neon connectivity)
- `GET /` → 200 and contains `guest-name` / `guest-tribe`
- Browser: submit a guest name + tribe, reach wizard, reload, session persists.
- Confirm `GET /api/admin/stats` with the guest cookie → 403.

- [ ] **Step 4: Update docs and commit**

Write `docs/vercel-deployment.md` with env var list, deploy command, verification commands, and the note that Render is no longer used. Update `README.md` links. Add `.superpowers/` to `.gitignore`.

```bash
git add docs/vercel-deployment.md README.md .gitignore
git rm render.yaml
git commit -m "docs: Vercel deployment guide and retire Render config"
git push origin main
```

## Self-Review

- Spec coverage: Vercel full backend (T1/T5), same design and all pages (T2/T3), login removed → name+tribe (T2), same-browser storage (T2), fake 2.5 s AI with no backend change (T4), squash/stretch + slow in/out + icon hover (T3), Peak-End after last panel field (T4), reduced motion/touch (T3), weather fallback untouched (global constraint), no secrets in git (T5).
- Review Focus: all five inputs are pinned by tests in T1–T4.
- Type consistency: `registerGuestAccount`, `restoreGuestSession`, `playPageTransition`, `playPeakEnd`, `runFakeAnalysis`, `siyaj_guest_token` use identical names in interfaces, steps and tests.
- Proportion: plan stays at decision/interface level; no full function bodies except exact constant values from the spec.
