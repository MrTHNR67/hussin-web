import 'dotenv/config';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { deleteAccountMedia, initializeDataStore, readAccountMedia, readDatabase, saveAccountMedia, updateDatabase } from './server/data-store.mjs';
import { buildPanelAnalysis, createPanelAnalysis, resolveAnalysisTemperature } from './server/heat-loss-report.mjs';
import { fetchWeatherSnapshot } from './server/weather-data.mjs';
import { getPushConfiguration, runDailyDustWindCheck, startDustWindScheduler } from './server/dust-wind-alerts.mjs';
import { AuthError, authenticateToken, loginAccount, loginWithGoogle, registerAccount, removeSession } from './server/auth.mjs';
import { analyzePanelMedia, ClaudeAnalysisError, extractElectricityInvoice, getClaudeConfiguration, validateInvoiceImages, validatePanelMedia } from './server/claude-analysis.mjs';
import { buildSolarContext, estimateMonthlyLoss } from './server/solar-assessment.mjs';
import { AiUsageError, reserveClaudeRequest } from './server/ai-usage.mjs';
import { buildComplaintMailto, getComplaintConfiguration, normalizeComplaint, sendComplaint } from './server/complaints.mjs';
import { securityHeaders } from './server/security.mjs';
import { createLockout, rateLimit } from './server/rate-limit.mjs';
import { readAuthEventCount, readAuthEvents, recordAuthEvent } from './server/audit.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const authCookieName = 'siyaj_session';
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
const googleAuthClient = new OAuth2Client();
const weatherServiceUrl = String(process.env.WEATHER_SERVICE_URL || '').trim().replace(/\/+$/, '');

// Brute-force protection: per-IP quota plus a lockout per identifier.
const authIpLimit = rateLimit({ windowMs: 60_000, max: 30, message: 'طلبات كثيرة؛ انتظر دقيقة ثم أعد المحاولة.' });
const loginIpLimit = rateLimit({ windowMs: 60_000, max: 20, message: 'محاولات دخول كثيرة من هذا العنوان؛ انتظر دقيقة.' });
const loginLockout = createLockout({
  failLimit: Number(process.env.LOGIN_FAIL_LIMIT || 10) || 10,
  lockMs: (Number(process.env.LOGIN_LOCK_MINUTES || 15) || 15) * 60_000,
  failWindowMs: (Number(process.env.LOGIN_FAIL_MINUTES || 15) || 15) * 60_000,
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(express.json({ limit: '18mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Liveness / readiness probes (used by the load balancer) -----------------
app.get('/healthz', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', instance: port, pid: process.pid, uptimeSeconds: Math.round(process.uptime()) });
});

app.get('/readyz', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await readDatabase();
    res.json({ status: 'ready', instance: port });
  } catch (error) {
    res.status(503).json({ status: 'not-ready', instance: port, error: error.message });
  }
});

async function requireAuth(req, res, next) {
  try {
    const authorization = String(req.headers.authorization || '');
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const cookie = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${authCookieName}=`));
    const cookieToken = cookie ? decodeURIComponent(cookie.slice(authCookieName.length + 1)) : '';
    const auth = await authenticateToken(match?.[1] || cookieToken);
    if (!auth) return res.status(401).json({ error: 'انتهت جلسة الدخول؛ سجّل الدخول من جديد.' });
    req.auth = auth;
    next();
  } catch (error) { res.status(500).json({ error: error.message || 'تعذر التحقق من الحساب.' }); }
}

function sendAuthError(res, error) {
  const status = error instanceof AuthError ? error.status : 500;
  res.status(status).json({ error: error.message || 'تعذر إكمال تسجيل الدخول.' });
}

function sendAuthSession(res, session, status = 200) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${authCookieName}=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`);
  res.status(status).json({ user: session.user });
}

function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${authCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

app.get('/api/config', (_req, res) => {
  const claude = getClaudeConfiguration();
  const complaints = getComplaintConfiguration();
  res.setHeader('Cache-Control', 'no-store');
  res.json({ googleClientId, claudeEnabled: claude.enabled, aiProvider: claude.provider, aiModel: claude.model,
    complaintEmail: complaints.email, complaintEmailDelivery: complaints.smtpEnabled });
});
app.get('/api/app-settings', async (_req, res) => {
  const db = await readDatabase();
  res.json({ ...db.app_settings });
});

app.get('/api/push/config', (_req, res) => res.json(getPushConfiguration()));

// Supabase Cron sends a short-lived signature, never the shared secret itself.
app.post('/api/jobs/daily-alerts', async (req, res) => {
  const secret = String(process.env.SIYAJ_JOB_SECRET || '');
  if (secret.length < 32) return res.status(503).json({ error: 'Scheduler is not configured.' });
  const timestamp = String(req.headers['x-siyaj-timestamp'] || '');
  const nonce = String(req.headers['x-siyaj-nonce'] || '');
  const signature = String(req.headers['x-siyaj-signature'] || '');
  const seconds = Number(timestamp);
  if (!/^\d{10}$/.test(timestamp) || !/^[0-9a-f-]{36}$/i.test(nonce) || !/^[0-9a-f]{64}$/.test(signature)
      || Math.abs(Date.now() / 1000 - seconds) > 900) {
    return res.status(401).json({ error: 'Invalid job signature.' });
  }
  const message = `${timestamp}\n${nonce}\nPOST\n/api/jobs/daily-alerts`;
  const expected = createHmac('sha256', secret).update(message).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return res.status(401).json({ error: 'Invalid job signature.' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    // Persistent per-panel leases and cooldowns also protect against replay/concurrent jobs.
    const summary = await runDailyDustWindCheck();
    res.json({ completed: true, summary });
  } catch (error) {
    console.error('Siyaj scheduled alert check failed:', error.message);
    res.status(503).json({ error: 'Alert check temporarily unavailable.' });
  }
});

app.post('/api/auth/signup', authIpLimit, async (req, res) => {
  try {
    const session = await registerAccount(req.body || {});
    await recordAuthEvent({ event: 'signup', userId: session.user.id, identifier: session.user.email, req });
    sendAuthSession(res, session, 201);
  } catch (error) { sendAuthError(res, error); }
});

app.post('/api/auth/login', loginIpLimit, async (req, res) => {
  const identifier = String(req.body?.identifier || '').trim().slice(0, 120);
  const lock = loginLockout.status(identifier);
  if (lock.locked) {
    res.setHeader('Retry-After', String(lock.retryAfterSeconds));
    await recordAuthEvent({ event: 'login_locked', identifier, req, detail: `retry_after=${lock.retryAfterSeconds}s` });
    return res.status(429).json({
      error: `تم قفل الحساب مؤقتاً بعد محاولات فاشلة. حاول بعد ${Math.max(1, Math.ceil(lock.retryAfterSeconds / 60))} دقيقة.`,
      code: 'account_locked', retryAfterSeconds: lock.retryAfterSeconds,
    });
  }
  try {
    const session = await loginAccount(req.body?.identifier, req.body?.password);
    loginLockout.reset(identifier);
    await recordAuthEvent({ event: 'login_success', userId: session.user.id, identifier, req });
    sendAuthSession(res, session);
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      const state = loginLockout.fail(identifier);
      await recordAuthEvent({ event: 'login_failed', identifier, req, detail: state.locked ? 'locked_out' : 'bad_credentials' });
    }
    sendAuthError(res, error);
  }
});

app.get('/api/auth/session', requireAuth, (req, res) => res.json({ user: req.auth.user }));

app.get('/api/auth/events', requireAuth, async (req, res) => {
  const limit = Number(req.query.limit || 20) || 20;
  const events = await readAuthEvents({ userId: req.auth.id, limit });
  res.setHeader('Cache-Control', 'no-store');
  res.json({ events });
});

function requireRole(role) {
  return function requireRoleMiddleware(req, res, next) {
    if (req.auth?.user?.role !== role) {
      return res.status(403).json({ error: 'ليست لديك صلاحية للوصول إلى هذا المورد.', code: 'forbidden' });
    }
    return next();
  };
}

app.get('/api/admin/stats', requireAuth, requireRole('admin'), async (_req, res) => {
  const db = await readDatabase();
  const admins = new Set(String(process.env.SIYAJ_ADMIN_EMAILS || '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean));
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    users: Object.keys(db.users).length,
    admins: Object.values(db.users).filter((user) => admins.has(String(user.email || '').toLowerCase())).length,
    activeSessions: Object.keys(db.sessions).length,
    panelAnalyses: Array.isArray(db.panel_analyses) ? db.panel_analyses.length : 0,
    authEvents: await readAuthEventCount(),
    recentEvents: await readAuthEvents({ limit: 25 }),
  });
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const endpoint = String(req.body?.endpoint || '');
  if (endpoint) await updateDatabase((db) => {
    db.push_subscriptions[req.auth.id] = (db.push_subscriptions[req.auth.id] || []).filter((item) => item.endpoint !== endpoint);
  });
  await removeSession(req.auth.tokenHash);
  await recordAuthEvent({ event: 'logout', userId: req.auth.id, identifier: req.auth.user.email, req });
  clearAuthCookie(res);
  res.json({ loggedOut: true });
});

app.get('/api/account/state', requireAuth, async (req, res) => {
  const db = await readDatabase();
  const saved = db.account_states[req.auth.id];
  const state = saved?.state ? { ...saved.state, lastCleanedAt: db.panel_data[req.auth.id]?.last_cleaned_at || saved.state.lastCleanedAt || null } : null;
  res.json({ state, updatedAt: saved?.updated_at || null });
});

app.put('/api/account/state', requireAuth, async (req, res) => {
  const state = req.body?.state;
  if (!state || typeof state !== 'object' || Array.isArray(state)) return res.status(400).json({ error: 'بيانات الحساب غير صالحة.' });
  const safeState = { ...state, user: null };
  const serialized = JSON.stringify(safeState);
  if (serialized.length > 2_000_000) return res.status(413).json({ error: 'بيانات الحساب كبيرة جداً للحفظ.' });
  const updatedAt = new Date().toISOString();
  await updateDatabase((db) => {
    safeState.lastCleanedAt = db.panel_data[req.auth.id]?.last_cleaned_at || null;
    db.account_states[req.auth.id] = { state: safeState, updated_at: updatedAt };
  });
  res.json({ saved: true, updatedAt });
});

app.get('/api/account/media', requireAuth, async (req, res) => {
  const db = await readDatabase();
  const files = Object.values(db.account_media).filter((item) => item.user_id === req.auth.id);
  res.json({ files });
});

app.post('/api/account/media/:mediaId', requireAuth, express.raw({ type: ['image/*', 'video/*'], limit: '25mb' }), async (req, res) => {
  const id = String(req.params.mediaId || '');
  const type = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const category = String(req.query.category || '');
  const name = String(req.query.name || 'attachment').split(/[\\/]/).pop().slice(0, 200);
  const allowedType = /^image\/(jpeg|png|webp)$/.test(type) || /^video\/(mp4|webm|quicktime)$/.test(type);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['panels', 'bill'].includes(category) || !allowedType || !Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ error: 'الملف أو بياناته غير مدعومة.' });
  }
  if (category === 'bill' && !type.startsWith('image/')) return res.status(400).json({ error: 'صورة الفاتورة يجب أن تكون صورة.' });
  const db = await readDatabase();
  const existing = db.account_media[id];
  if (existing && existing.user_id !== req.auth.id) return res.status(404).json({ error: 'لم يتم العثور على الملف.' });
  const usedBytes = Object.values(db.account_media)
    .filter((item) => item.user_id === req.auth.id && item.id !== id)
    .reduce((sum, item) => sum + Number(item.size_bytes || 0), 0);
  if (usedBytes + req.body.length > 250 * 1024 * 1024) return res.status(413).json({ error: 'تجاوزت مساحة مرفقات الحساب المتاحة.' });
  await saveAccountMedia(req.auth.id, id, req.body, type);
  const item = { id, user_id: req.auth.id, category, name, type, size_bytes: req.body.length, updated_at: new Date().toISOString() };
  await updateDatabase((tables) => { tables.account_media[id] = item; });
  res.status(existing ? 200 : 201).json({ file: item });
});

app.get('/api/account/media/:mediaId', requireAuth, async (req, res) => {
  const item = (await readDatabase()).account_media[String(req.params.mediaId || '')];
  if (!item || item.user_id !== req.auth.id) return res.status(404).json({ error: 'لم يتم العثور على الملف.' });
  try {
    const bytes = await readAccountMedia(req.auth.id, item.id);
    res.setHeader('Content-Type', item.type);
    res.setHeader('Content-Length', bytes.length);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(bytes);
  } catch { res.status(404).json({ error: 'ملف المرفق غير موجود على الخادم.' }); }
});

app.delete('/api/account/media/:mediaId', requireAuth, async (req, res) => {
  const id = String(req.params.mediaId || '');
  const db = await readDatabase();
  const item = db.account_media[id];
  if (!item || item.user_id !== req.auth.id) return res.status(404).json({ error: 'لم يتم العثور على الملف.' });
  await deleteAccountMedia(req.auth.id, id);
  await updateDatabase((tables) => { delete tables.account_media[id]; });
  res.json({ deleted: true });
});

app.post('/api/push/subscribe', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const subscription = req.body?.subscription;
  if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'بيانات الاشتراك بالتنبيهات غير مكتملة.' });
  }
  let endpoint;
  try { endpoint = new URL(subscription.endpoint); } catch { return res.status(400).json({ error: 'عنوان الإشعارات غير صالح.' }); }
  const host = endpoint.hostname.toLowerCase();
  const knownPushHost = ['fcm.googleapis.com', 'android.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(host)
    || host.endsWith('.push.apple.com') || host.endsWith('.notify.windows.com');
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || (endpoint.port && endpoint.port !== '443') || !knownPushHost
    || !/^[A-Za-z0-9_-]+={0,2}$/.test(subscription.keys.p256dh) || !/^[A-Za-z0-9_-]+={0,2}$/.test(subscription.keys.auth)
    || Buffer.from(subscription.keys.p256dh, 'base64url').length !== 65 || Buffer.from(subscription.keys.auth, 'base64url').length !== 16) {
    return res.status(400).json({ error: 'بيانات اشتراك المتصفح غير صالحة.' });
  }
  if (!getPushConfiguration().enabled) return res.status(503).json({ error: 'تنبيهات Push غير مهيأة على الخادم.' });
  await updateDatabase((db) => {
    // A browser endpoint belongs to its currently signed-in account only.
    for (const [owner, subscriptions] of Object.entries(db.push_subscriptions)) {
      db.push_subscriptions[owner] = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
    }
    const subscriptions = db.push_subscriptions[userId] || [];
    db.push_subscriptions[userId] = [...subscriptions.filter((item) => item.endpoint !== subscription.endpoint), subscription];
  });
  res.json({ saved: true });
});

app.post('/api/push/status', requireAuth, async (req, res) => {
  const endpoint = String(req.body?.endpoint || '');
  const db = await readDatabase();
  res.setHeader('Cache-Control', 'no-store');
  res.json({ subscribed: Boolean(endpoint && (db.push_subscriptions[req.auth.id] || []).some((item) => item.endpoint === endpoint)) });
});

app.post('/api/push/unsubscribe', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const endpoint = String(req.body?.endpoint || '');
  if (!userId || !endpoint) return res.status(400).json({ error: 'بيانات إيقاف التنبيهات غير مكتملة.' });
  await updateDatabase((db) => {
    db.push_subscriptions[userId] = (db.push_subscriptions[userId] || []).filter((item) => item.endpoint !== endpoint);
  });
  res.json({ removed: true });
});

app.post('/api/panel/sync', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const hasCoordinates = req.body?.latitude !== null && req.body?.latitude !== undefined && req.body?.longitude !== null && req.body?.longitude !== undefined && req.body?.latitude !== '' && req.body?.longitude !== '';
  const latitude = Number(req.body?.latitude);
  const longitude = Number(req.body?.longitude);
  const hasLocation = hasCoordinates && Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  await updateDatabase((db) => {
    const previous = db.panel_data[userId] || {};
    const active = Boolean(req.body?.onboarded) && hasLocation;
    // Cleaning is recorded by the dedicated authenticated action, not stale device state.
    const lastCleanedAt = previous.last_cleaned_at || null;
    db.panel_data[userId] = {
      ...previous,
      user_id: userId,
      active,
      location: String(req.body?.location || '').slice(0, 160),
      latitude: hasLocation ? latitude : null,
      longitude: hasLocation ? longitude : null,
      timezone: String(req.body?.timezone || previous.timezone || 'UTC').slice(0, 100),
      tilt_angle_degrees: req.body?.tilt !== null && req.body?.tilt !== undefined && req.body?.tilt !== '' && Number.isFinite(Number(req.body.tilt)) ? Number(req.body.tilt) : null,
      notifications_enabled: Boolean(req.body?.notifications),
      created_at: active ? (previous.active ? previous.created_at : new Date().toISOString()) : previous.created_at || null,
      last_cleaned_at: lastCleanedAt,
      last_daily_check_date: active && !previous.active ? null : previous.last_daily_check_date,
    };
  });
  res.json({ saved: true });
});

app.post('/api/panel/cleaned', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const cleanedAt = new Date().toISOString();
  await updateDatabase((db) => {
    const panel = db.panel_data[userId] || { user_id: userId, created_at: cleanedAt };
    panel.last_cleaned_at = cleanedAt;
    panel.last_daily_check_date = null;
    panel.heat_cleaning_warning = null;
    db.panel_data[userId] = panel;
    if (db.account_states[userId]) {
      db.account_states[userId].state.lastCleanedAt = cleanedAt;
      db.account_states[userId].updated_at = cleanedAt;
    }
  });
  res.json({ lastCleanedAt: cleanedAt });
});

app.post('/api/panel/analysis', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const monthlyProductionKwh = Number(req.body?.monthlyProductionKwh);
  const tariffOmrPerKwh = Number(req.body?.tariffOmrPerKwh);
  const rawDustLossPercent = req.body?.dustLossPercent;
  const dustLossPercent = rawDustLossPercent === null || rawDustLossPercent === undefined ? null : Number(rawDustLossPercent);
  const hasLatitude = req.body?.latitude !== null && req.body?.latitude !== undefined && req.body?.latitude !== '';
  const hasLongitude = req.body?.longitude !== null && req.body?.longitude !== undefined && req.body?.longitude !== '';
  const latitude = hasLatitude ? Number(req.body.latitude) : NaN;
  const longitude = hasLongitude ? Number(req.body.longitude) : NaN;
  const hasAmbientTemp = req.body?.ambientTempC !== null && req.body?.ambientTempC !== undefined && req.body?.ambientTempC !== '';
  const ambientTempC = hasAmbientTemp ? Number(req.body.ambientTempC) : NaN;
  if (!Number.isFinite(monthlyProductionKwh) || monthlyProductionKwh < 0 || !Number.isFinite(tariffOmrPerKwh) || tariffOmrPerKwh < 0 || (dustLossPercent !== null && (!Number.isFinite(dustLossPercent) || dustLossPercent < 0 || dustLossPercent > 100))) {
    return res.status(400).json({ error: 'بيانات حساب الخسارة غير صالحة.' });
  }
  try {
    const analysis = await createPanelAnalysis({
      userId, latitude: Number.isFinite(latitude) ? latitude : null, longitude: Number.isFinite(longitude) ? longitude : null,
      ambientTempC: Number.isFinite(ambientTempC) ? ambientTempC : null, monthlyProductionKwh, tariffOmrPerKwh,
      dustLossPercent, location: String(req.body?.location || '').slice(0, 160),
    });
    res.json({ analysis });
  } catch (error) {
    res.status(502).json({ error: error.message || 'تعذر حساب خسارة الحرارة.' });
  }
});

app.post('/api/panel/delete', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const dbBeforeDelete = await readDatabase();
  const mediaToDelete = Object.values(dbBeforeDelete.account_media).filter((item) => item.user_id === userId);
  await Promise.all(mediaToDelete.map((item) => deleteAccountMedia(userId, item.id)));
  await updateDatabase((db) => {
    delete db.panel_data[userId];
    delete db.push_subscriptions[userId];
    db.panel_analyses = db.panel_analyses.filter((item) => item.user_id !== userId);
    delete db.account_states[userId];
    for (const item of mediaToDelete) delete db.account_media[item.id];
  });
  res.json({ deleted: true });
});

app.post('/api/auth/google', authIpLimit, async (req, res) => {
  if (!googleClientId) return res.status(503).json({ error: 'أضف GOOGLE_CLIENT_ID إلى ملف .env لتفعيل تسجيل Google.' });
  const credential = String(req.body?.credential || '');
  if (!credential) return res.status(400).json({ error: 'لم يصل رمز تسجيل Google.' });
  try {
    const ticket = await googleAuthClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) return res.status(401).json({ error: 'تعذر التحقق من حساب Google.' });
    const session = await loginWithGoogle({ sub: payload.sub, email: payload.email, name: payload.name || payload.email.split('@')[0], picture: payload.picture || '' });
    await recordAuthEvent({ event: 'login_success', userId: session.user.id, identifier: payload.email, req, detail: 'google' });
    sendAuthSession(res, session);
  } catch (error) {
    if (error instanceof AuthError) return sendAuthError(res, error);
    res.status(401).json({ error: 'رمز Google غير صالح أو انتهت صلاحيته.' });
  }
});

async function proxyWeatherService(res, pathname, query) {
  const url = new URL(weatherServiceUrl + pathname);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  const upstream = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const body = await upstream.text();
  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.send(body);
}

app.get('/api/geocode', async (req, res) => {
  const name = String(req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'أدخل اسم مدينة للبحث.' });
  // Microservice mode: call the extracted weather service, fall back to the
  // in-process implementation if it is unavailable (resilience by design).
  if (weatherServiceUrl) {
    try { return await proxyWeatherService(res, '/geocode', { name }); }
    catch (error) { console.warn('Weather service unavailable (geocode); falling back in-process:', error.message); }
  }
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name, count: '6', language: 'ar', format: 'json' });
    const response = await fetch(url);
    if (!response.ok) throw new Error('تعذر الوصول إلى خدمة البحث عن المدن.');
    const data = await response.json();
    res.json({ results: (data.results || []).map((place) => ({
      name: place.name, country: place.country, admin1: place.admin1,
      latitude: place.latitude, longitude: place.longitude, timezone: place.timezone,
    })) });
  } catch (error) { res.status(502).json({ error: error.message || 'تعذر البحث عن المدينة.' }); }
});

app.get('/api/weather', async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  if (typeof req.query.latitude !== 'string' || !req.query.latitude.trim() || typeof req.query.longitude !== 'string' || !req.query.longitude.trim()
    || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return res.status(400).json({ error: 'إحداثيات الموقع غير صالحة.', code: 'INVALID_COORDINATES' });
  }
  if (weatherServiceUrl) {
    try { return await proxyWeatherService(res, '/weather', { latitude, longitude }); }
    catch (error) { console.warn('Weather service unavailable (weather); falling back in-process:', error.message); }
  }
  try {
    const snapshot = await fetchWeatherSnapshot(latitude, longitude);
    res.json(snapshot);
  } catch (error) {
    if (Number.isFinite(error.retryAfterSeconds)) res.set('Retry-After', String(error.retryAfterSeconds));
    res.status(502).json({ error: 'تعذر جلب بيانات الطقس الآن.', code: 'WEATHER_UPSTREAM_UNAVAILABLE', allowBrowserFallback: true,
      upstreamStatus: Number.isInteger(error.upstreamStatus) ? error.upstreamStatus : null });
  }
});

// Only measurement/context fields accepted by the physical model are retained.
function solarFacts(value = {}, reportInput = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const keys = ['latitude', 'longitude', 'tilt', 'panelTiltDegrees', 'panelAzimuthDegrees', 'captureAt', 'capturedAt',
    'systemPowerWatts', 'ambientTemperatureC', 'ambientTempC', 'measuredPanelTemperatureC', 'measuredCellTemperatureC',
    'irradianceWm2', 'nominalOperatingCellTemperatureC', 'performanceRatio', 'timezone'];
  const result = {};
  for (const key of keys) {
    const candidate = source[key];
    if ((typeof candidate === 'number' && Number.isFinite(candidate)) || (typeof candidate === 'string' && candidate.length <= 80)) result[key] = candidate;
  }
  for (const key of ['latitude', 'longitude', 'ambientTempC']) {
    if (result[key] === undefined && typeof reportInput[key] === 'number' && Number.isFinite(reportInput[key])) result[key] = reportInput[key];
  }
  return result;
}

function requestReport(body = {}) {
  const input = body.reportInput ?? body.report;
  return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

function validLegacyReport(input) {
  return ['monthlyProductionKwh', 'tariffOmrPerKwh'].every((key) =>
    typeof input[key] === 'number' && Number.isFinite(input[key]) && input[key] >= 0 && input[key] <= 1e12)
    && (input.dustLossPercent === null || input.dustLossPercent === undefined
      || (typeof input.dustLossPercent === 'number' && Number.isFinite(input.dustLossPercent)
        && input.dustLossPercent >= 0 && input.dustLossPercent <= 100));
}

async function monthlyAssessment(body, facts, analysis = {}) {
  const input = requestReport(body);
  // Use a reviewed energy unit rate, never a total-bill average.
  const tariff = input.tariff ?? input.monthlyTariffOmrPerKwh;
  const invoice = input.invoice && typeof input.invoice === 'object' ? input.invoice : null;
  return estimateMonthlyLoss({ facts, analysis, invoice, month: input.month ?? input.billMonth ?? body.month,
    tariff, expectedMonthlyKwh: input.expectedMonthlyKwh, actualMonthlyKwh: input.actualMonthlyKwh });
}

function sendAnalysisError(res, error) {
  if (error instanceof ClaudeAnalysisError || error instanceof AiUsageError) {
    if (error.retryAfterSeconds) res.setHeader('Retry-After', String(error.retryAfterSeconds));
    return res.status(error.status).json({ error: error.message, code: error.code });
  }
  return res.status(503).json({ error: 'تعذر إكمال التحليل الآن. حاول لاحقاً.', code: 'analysis_unavailable' });
}

app.post('/api/analyze', requireAuth, async (req, res) => {
  if (!getClaudeConfiguration().enabled) return res.status(503).json({ error: 'تحليل Claude لم يُفعّل بعد.', code: 'claude_not_configured' });
  const body = req.body || {};
  const reportInput = requestReport(body);
  if (!validLegacyReport(reportInput)) return res.status(400).json({ error: 'بيانات حساب الخسارة غير صالحة.' });
  const images = Array.isArray(body.images) ? body.images.map((dataUrl) => ({ dataUrl, timestampSeconds: null })) : [];
  const videoFrames = Array.isArray(body.frames) ? body.frames.map((frame) => ({
    dataUrl: frame?.image ?? frame?.dataUrl,
    timestampSeconds: frame?.timeSeconds ?? frame?.timestampSeconds ?? null,
  })) : [];
  const frames = [...images, ...videoFrames];
  if (!frames.length || frames.length > 8) return res.status(400).json({ error: 'أرفق من صورة واحدة إلى ثماني صور أو لقطات للألواح.' });
  const facts = solarFacts(body.facts, reportInput);
  const solarContext = buildSolarContext(facts);
  let release;
  res.setHeader('Cache-Control', 'no-store');
  try {
    validatePanelMedia(frames);
    release = await reserveClaudeRequest(req.auth.id);
    const result = await analyzePanelMedia({ frames, lang: (body.language ?? body.lang) === 'en' ? 'en' : 'ar', context: {
      capturedAt: solarContext.captureAt,
      panelTiltDegrees: solarContext.panel.tiltDegrees, panelAzimuthDegrees: solarContext.panel.azimuthDegrees,
      sunAzimuthDegrees: solarContext.sun.azimuthDegrees, sunElevationDegrees: solarContext.sun.elevationDegrees,
      ambientTempC: solarContext.temperature.ambientTemperatureC, panelTempC: solarContext.temperature.measuredPanelTemperatureC,
    } });
    const monthlyLoss = await monthlyAssessment(body, facts, result.analysis);
    const temperature = await resolveAnalysisTemperature(reportInput);
    const report = await updateDatabase((db) => {
      // Visible dusty area is never substituted for an energy-loss measurement.
      const record = buildPanelAnalysis({ ...reportInput, ...temperature, id: randomUUID(), userId: req.auth.id,
        createdAt: new Date().toISOString(), location: String(reportInput.location || '').slice(0, 160) }, db.app_settings);
      record.visual_analysis = result.analysis;
      record.solar_context = solarContext;
      record.monthly_loss = monthlyLoss;
      record.ai_provider = result.provider;
      record.ai_model = result.model;
      record.dust_loss_basis = record.dust_loss_percent === null ? 'unavailable' : 'manual_estimate_not_visual_coverage';
      db.panel_analyses.push(record);
      return record;
    });
    res.json({ analysis: result.analysis, report, provider: result.provider, model: result.model, solarContext, monthlyLoss });
  } catch (error) { sendAnalysisError(res, error); }
  finally { release?.(); }
});

app.post('/api/analyze-invoice', requireAuth, async (req, res) => {
  if (!getClaudeConfiguration().enabled) return res.status(503).json({ error: 'تحليل Claude لم يُفعّل بعد.', code: 'claude_not_configured' });
  const body = req.body || {};
  const images = Array.isArray(body.images) ? body.images.map((image) => ({ dataUrl: typeof image === 'string' ? image : image?.dataUrl }))
    : [{ dataUrl: body.image }];
  let release;
  res.setHeader('Cache-Control', 'no-store');
  try {
    validateInvoiceImages(images);
    release = await reserveClaudeRequest(req.auth.id);
    const result = await extractElectricityInvoice({ images, lang: (body.language ?? body.lang) === 'en' ? 'en' : 'ar' });
    // Review and confirmation happen before extracted fields become saved account data.
    res.json({ invoice: result.invoice, provider: result.provider, model: result.model });
  } catch (error) { sendAnalysisError(res, error); }
  finally { release?.(); }
});

const monthlyRequests = new Map();
app.post('/api/monthly-loss', requireAuth, async (req, res) => {
  const now = Date.now();
  if (monthlyRequests.size > 1000) for (const [id, entry] of monthlyRequests) if (now - entry.lastAt > 60000 && !entry.active) monthlyRequests.delete(id);
  const existing = monthlyRequests.get(req.auth.id);
  if (existing?.active || (existing && now - existing.lastAt < 5000)) {
    res.setHeader('Retry-After', '5');
    return res.status(429).json({ error: 'انتظر قليلاً قبل تحديث حساب الشهر.', code: 'monthly_rate_limit' });
  }
  const entry = { active: true, lastAt: now };
  monthlyRequests.set(req.auth.id, entry);
  const body = req.body || {};
  const facts = solarFacts(body.facts, requestReport(body));
  res.setHeader('Cache-Control', 'no-store');
  try {
    const monthlyLoss = await monthlyAssessment(body, facts);
    res.json({ monthlyLoss, solarContext: buildSolarContext(facts) });
  } catch { res.status(503).json({ error: 'تعذر تحديث حساب الشهر الآن.', code: 'monthly_unavailable' }); }
  finally { entry.active = false; }
});

const complaintRequests = new Map();
app.post('/api/complaints', async (req, res) => {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  const now = Date.now();
  if (complaintRequests.size > 2000) for (const [key, entry] of complaintRequests) if (now - entry.lastAt > 3600_000) complaintRequests.delete(key);
  const previous = complaintRequests.get(ip);
  if (previous && now - previous.lastAt < 30_000) {
    res.setHeader('Retry-After', '30');
    return res.status(429).json({ error: 'تم إرسال بلاغ قريباً؛ انتظر نصف دقيقة قبل إرسال بلاغ آخر.', code: 'complaint_rate_limit' });
  }
  const { complaint, errors } = normalizeComplaint(req.body || {});
  if (errors) return res.status(400).json({ error: 'أكمل جهة التواصل ونص البلاغ (10 أحرف على الأقل).', code: 'complaint_invalid' });
  complaintRequests.set(ip, { lastAt: now });
  res.setHeader('Cache-Control', 'no-store');
  const delivery = await sendComplaint(complaint);
  res.json({ received: true, delivered: delivery.delivered, reason: delivery.reason || null,
    email: getComplaintConfiguration().email, mailto: buildComplaintMailto(complaint), id: complaint.id });
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

async function startServer() {
  await initializeDataStore();
  httpServer = app.listen(port, () => console.log(`سياج يعمل على http://localhost:${port}`));
  startDustWindScheduler();
}

let httpServer;
let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`سياج: استلم ${signal} — بدء الإيقاف الآمن...`);
  const force = setTimeout(() => {
    console.error('Siyaj: forced exit after 10s.');
    process.exit(1);
  }, 10_000);
  force.unref();
  if (!httpServer) { process.exit(0); return; }
  httpServer.close(() => {
    console.log('Siyaj: closed cleanly.');
    process.exit(0);
  });
}

for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => shutdown(signal));

startServer().catch((error) => {
  console.error('Siyaj could not start:', error.message);
  process.exit(1);
});
