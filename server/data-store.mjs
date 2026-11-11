import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.join(here, '..');
const dataDirectory = process.env.SIYAJ_DATA_DIR
  ? path.resolve(process.env.SIYAJ_DATA_DIR)
  : path.join(projectDirectory, 'data');
const databasePath = path.join(dataDirectory, 'siyaj.sqlite');
const legacyJsonPath = path.join(dataDirectory, 'siyaj-db.json');
const require = createRequire(import.meta.url);
const wasmPath = path.join(path.dirname(require.resolve('sql.js')), 'sql-wasm.wasm');
const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const databasePassword = process.env.DATABASE_PASSWORD;
const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const supabaseSecretKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const mediaBucket = String(process.env.SUPABASE_STORAGE_BUCKET || 'siyaj-media').trim();
const remoteStorageRequested = Boolean(supabaseUrl || supabaseSecretKey);
const remoteStorageConfigured = Boolean(supabaseUrl && supabaseSecretKey && mediaBucket);
const databaseSslCa = String(process.env.DATABASE_SSL_CA || '').trim().replace(/\\n/g, '\n');
const databaseSslMode = String(process.env.DATABASE_SSL || '').trim().toLowerCase();
// "false" disables TLS (loopback networks only), "no-verify" keeps TLS but accepts
// managed-provider certificates that are not in Node's trust store (e.g. Render internal).
const databaseSsl = databaseSslMode === 'false'
  ? false
  : { rejectUnauthorized: databaseSslMode !== 'no-verify', ...(databaseSslCa ? { ca: databaseSslCa } : {}) };
function verifiedDatabaseConnectionString(value) {
  let url;
  try { url = new URL(value); }
  catch { throw new Error('DATABASE_URL must be a valid Postgres connection URL.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must be a Postgres connection URL.');
  }
  if (databasePassword !== undefined && databasePassword !== '') {
    // Keep the raw password exact, including whitespace; encode '%' as well as URL separators.
    url.password = encodeURIComponent(databasePassword);
  }
  // pg connection-string SSL options override the ssl object, so keep verification under server control.
  for (const option of ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslnegotiation', 'uselibpqcompat']) url.searchParams.delete(option);
  return url.toString();
}
const pool = databaseUrl ? new pg.Pool({
  connectionString: verifiedDatabaseConnectionString(databaseUrl),
  ssl: databaseSsl,
  max: 2,
  connectionTimeoutMillis: 12_000,
  idleTimeoutMillis: 30_000,
}) : null;
pool?.on('error', (error) => {
  console.warn(`Siyaj database idle connection failed (${error.code || 'connection error'}).`);
});

export const DEFAULT_APP_SETTINGS = Object.freeze({
  wind_speed_kmh: 27.5,
  low_humidity_percent: 30,
  dust_forecast_pm10_ug: 100,
  dust_alert_cooldown_days: 14,
  cleaning_cycle_days: 37,
  significant_rain_mm: 5,
  heat_warning_temp_c: 40,
  heat_no_clean_days: 3,
  panel_temperature_offset_c: 22,
  heat_loss_threshold_c: 35,
  heat_loss_percent_per_c: 0.4,
  tilt_min_degrees: 25,
  tilt_max_degrees: 35,
  tilt_target_degrees: 30,
  alert_check_lease_seconds: 300,
  alert_retry_minutes: 30,
  heat_warning_retry_hours: 24,
});

export function validateAppSettings(value = {}) {
  const settings = { ...DEFAULT_APP_SETTINGS, ...value };
  for (const key of Object.keys(DEFAULT_APP_SETTINGS)) {
    const raw = settings[key];
    if ((typeof raw !== 'number' && typeof raw !== 'string') || (typeof raw === 'string' && !raw.trim())) {
      throw new Error(`Invalid numeric app setting: ${key}.`);
    }
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric < 0) throw new Error(`Invalid numeric app setting: ${key}.`);
    settings[key] = numeric;
  }
  if (settings.low_humidity_percent > 100 || settings.heat_loss_percent_per_c > 100) {
    throw new Error('Percentage app settings must be between 0 and 100.');
  }
  if (settings.tilt_min_degrees > settings.tilt_target_degrees || settings.tilt_target_degrees > settings.tilt_max_degrees || settings.tilt_max_degrees > 90) {
    throw new Error('Panel tilt settings must satisfy 0 <= min <= target <= max <= 90.');
  }
  for (const key of ['alert_check_lease_seconds', 'alert_retry_minutes', 'heat_warning_retry_hours']) {
    if (settings[key] <= 0) throw new Error(`App setting must be greater than zero: ${key}.`);
  }
  return settings;
}

async function readPostgresSettings(client, lock = false) {
  const result = await client.query(`SELECT key, value_json FROM public.app_settings${lock ? ' FOR SHARE' : ''}`);
  return validateAppSettings(Object.fromEntries(result.rows.map((row) => [row.key, row.value_json])));
}

async function seedPostgresSettings(client, value) {
  const settings = validateAppSettings(value);
  for (const [key, setting] of Object.entries(settings)) {
    await client.query(
      'INSERT INTO public.app_settings (key, value_json) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING',
      [key, JSON.stringify(setting)],
    );
  }
}

function analysisSqlValues(analysis) {
  if (!analysis || !analysis.id || !analysis.user_id || !Number.isFinite(Date.parse(analysis.created_at))) {
    throw new Error('Invalid saved panel analysis identity or timestamp.');
  }
  const numeric = (key, max = Infinity) => {
    const raw = analysis[key];
    if (raw === null || raw === undefined) return null;
    if ((typeof raw !== 'number' && typeof raw !== 'string') || (typeof raw === 'string' && !raw.trim())) {
      throw new Error(`Invalid numeric panel analysis field: ${key}.`);
    }
    const number = Number(raw);
    if (!Number.isFinite(number) || number < 0 || number > max) throw new Error(`Invalid numeric panel analysis field: ${key}.`);
    return number;
  };
  return [
    String(analysis.id), String(analysis.user_id), analysis.created_at,
    numeric('dust_loss_percent', 100), numeric('dust_loss_omr'), numeric('heat_loss_percent'), numeric('heat_loss_omr'),
    JSON.stringify(analysis),
  ];
}

async function writePostgresAnalysis(client, analysis, insertOnly = false) {
  await client.query(`
    INSERT INTO public.panel_analyses
      (id, user_id, created_at, dust_loss_percent, dust_loss_omr, heat_loss_percent, heat_loss_omr, record_json)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    ON CONFLICT (id) ${insertOnly ? 'DO NOTHING' : `DO UPDATE SET
      user_id = EXCLUDED.user_id, created_at = EXCLUDED.created_at,
      dust_loss_percent = EXCLUDED.dust_loss_percent, dust_loss_omr = EXCLUDED.dust_loss_omr,
      heat_loss_percent = EXCLUDED.heat_loss_percent, heat_loss_omr = EXCLUDED.heat_loss_omr,
      record_json = EXCLUDED.record_json`}
  `, analysisSqlValues(analysis));
}

async function seedPostgresAnalyses(client, analyses) {
  if (!analyses.length) return;
  const existing = await client.query('SELECT id FROM public.panel_analyses WHERE id = ANY($1::text[])', [analyses.map((analysis) => String(analysis.id))]);
  const existingIds = new Set(existing.rows.map((row) => row.id));
  for (const analysis of analyses) {
    const id = String(analysis.id);
    if (existingIds.has(id)) continue;
    await writePostgresAnalysis(client, analysis, true);
    existingIds.add(id);
  }
}

async function syncPostgresChanges(client, beforeSettings, beforeAnalyses, tables) {
  const settings = validateAppSettings(tables.app_settings);
  tables.app_settings = settings;
  for (const [key, setting] of Object.entries(settings)) {
    if (beforeSettings.get(key) === JSON.stringify(setting)) continue;
    await client.query(`
      INSERT INTO public.app_settings (key, value_json) VALUES ($1, $2::jsonb)
      ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW()
    `, [key, JSON.stringify(setting)]);
  }
  for (const key of beforeSettings.keys()) {
    if (!Object.hasOwn(settings, key)) await client.query('DELETE FROM public.app_settings WHERE key = $1', [key]);
  }
  if (!Array.isArray(tables.panel_analyses)) throw new Error('Panel analyses must be an array.');
  const currentIds = new Set();
  for (const analysis of tables.panel_analyses) {
    const id = String(analysis?.id || '');
    if (!id || currentIds.has(id)) throw new Error('Panel analysis IDs must be unique.');
    currentIds.add(id);
    if (beforeAnalyses.get(id) !== JSON.stringify(analysis)) await writePostgresAnalysis(client, analysis);
  }
  for (const id of beforeAnalyses.keys()) {
    if (!currentIds.has(id)) await client.query('DELETE FROM public.panel_analyses WHERE id = $1', [id]);
  }
}

let sqlPromise;
let writeQueue = Promise.resolve();
let postgresInitPromise;

function getSql() {
  sqlPromise ||= initSqlJs({ locateFile: () => wasmPath });
  return sqlPromise;
}

function emptyDatabaseState() {
  return {
    app_settings: { ...DEFAULT_APP_SETTINGS },
    panel_data: {}, push_subscriptions: {}, panel_analyses: [], users: {},
    sessions: {}, account_states: {}, account_media: {}, ai_usage: {}, auth_events: [],
  };
}

function normalizeDatabaseState(value = {}) {
  return {
    app_settings: { ...DEFAULT_APP_SETTINGS, ...(value.app_settings || {}) },
    panel_data: value.panel_data && typeof value.panel_data === 'object' ? value.panel_data : {},
    push_subscriptions: value.push_subscriptions && typeof value.push_subscriptions === 'object' ? value.push_subscriptions : {},
    panel_analyses: Array.isArray(value.panel_analyses) ? value.panel_analyses : [],
    users: value.users && typeof value.users === 'object' ? value.users : {},
    sessions: value.sessions && typeof value.sessions === 'object' ? value.sessions : {},
    account_states: value.account_states && typeof value.account_states === 'object' ? value.account_states : {},
    account_media: value.account_media && typeof value.account_media === 'object' ? value.account_media : {},
    ai_usage: value.ai_usage && typeof value.ai_usage === 'object' && !Array.isArray(value.ai_usage) ? value.ai_usage : {},
    auth_events: Array.isArray(value.auth_events) ? value.auth_events : [],
  };
}

function assertRemoteConfiguration() {
  if (remoteStorageRequested && !remoteStorageConfigured) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY together to enable Supabase media storage.');
  }
}

async function ensurePostgres() {
  if (!pool) return;
  postgresInitPromise ||= (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.siyaj_app_state (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          state JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.app_settings (
          key TEXT PRIMARY KEY,
          value_json JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.panel_analyses (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          dust_loss_percent NUMERIC,
          dust_loss_omr NUMERIC,
          heat_loss_percent NUMERIC,
          heat_loss_omr NUMERIC,
          record_json JSONB NOT NULL
        )
      `);
      // Accounts use Siyaj's server auth. Supabase's browser roles must never read the shared state.
      for (const table of ['siyaj_app_state', 'app_settings', 'panel_analyses']) {
        await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
        await client.query(`REVOKE ALL ON TABLE public.${table} FROM PUBLIC, anon, authenticated`);
      }
      await client.query(
        'INSERT INTO public.siyaj_app_state (id, state) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING',
        [JSON.stringify(emptyDatabaseState())],
      );
      const selected = await client.query('SELECT state FROM public.siyaj_app_state WHERE id = 1 FOR UPDATE');
      const savedState = normalizeDatabaseState(selected.rows[0]?.state);
      // A first local-to-cloud migration may contain calibrated settings. Existing SQL keys always win.
      const localSeed = hasStoredUserData(savedState) ? null : await readExistingLocalDatabase();
      await seedPostgresSettings(client, localSeed?.app_settings || savedState.app_settings);
      await seedPostgresAnalyses(client, savedState.panel_analyses);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  })().catch((error) => {
    postgresInitPromise = null;
    throw error;
  });
  return postgresInitPromise;
}

function hasStoredUserData(state) {
  return Boolean(
    Object.keys(state.users || {}).length || Object.keys(state.sessions || {}).length ||
    Object.keys(state.panel_data || {}).length || Object.keys(state.account_states || {}).length ||
    Object.keys(state.account_media || {}).length || Object.keys(state.push_subscriptions || {}).length ||
    (state.panel_analyses || []).length || Object.keys(state.ai_usage || {}).length ||
    Object.entries(state.app_settings || {}).some(([key, value]) => JSON.stringify(value) !== JSON.stringify(DEFAULT_APP_SETTINGS[key])),
  );
}

async function readExistingLocalDatabase() {
  let bytes;
  try { bytes = await fs.readFile(databasePath); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    try { return normalizeDatabaseState(JSON.parse(await fs.readFile(legacyJsonPath, 'utf8'))); }
    catch (legacyError) { if (legacyError.code === 'ENOENT') return null; throw legacyError; }
  }
  const SQL = await getSql();
  const db = new SQL.Database(new Uint8Array(bytes));
  try { return readTables(db); }
  finally { db.close(); }
}

function storageApiUrl(route) {
  return `${supabaseUrl}/storage/v1/${route}`;
}

function storageHeaders(extra = {}) {
  const headers = { apikey: supabaseSecretKey, ...extra };
  // New sb_secret keys belong only in the apikey header. Legacy service_role keys are JWTs.
  if (!supabaseSecretKey.startsWith('sb_secret_')) headers.Authorization = `Bearer ${supabaseSecretKey}`;
  return headers;
}

async function ensureMediaBucket() {
  const getResponse = await fetch(storageApiUrl(`bucket/${encodeURIComponent(mediaBucket)}`), {
    headers: storageHeaders(),
  });
  if (getResponse.ok) {
    const bucket = await getResponse.json().catch(() => null);
    if (bucket?.public !== false) throw new Error('The Siyaj media bucket must be private.');
    return;
  }
  // Some Supabase Storage versions return HTTP 400 with the actual missing-bucket code in JSON.
  const bucketError = getResponse.status === 400 ? await getResponse.json().catch(() => null) : null;
  const bucketIsMissing = getResponse.status === 404 || (
    getResponse.status === 400 &&
    (bucketError?.code === 'NoSuchBucket' || String(bucketError?.statusCode) === '404')
  );
  if (!bucketIsMissing) {
    throw new Error(`Supabase Storage could not be reached (HTTP ${getResponse.status}).`);
  }

  const createResponse = await fetch(storageApiUrl('bucket'), {
    method: 'POST',
    headers: storageHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id: mediaBucket,
      name: mediaBucket,
      public: false,
      file_size_limit: 25 * 1024 * 1024,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'],
    }),
  });
  if (createResponse.ok) return;

  // Another startup may have created the bucket between the check and create.
  const verifyResponse = await fetch(storageApiUrl(`bucket/${encodeURIComponent(mediaBucket)}`), {
    headers: storageHeaders(),
  });
  if (!verifyResponse.ok) throw new Error(`Supabase could not create the private media bucket (HTTP ${createResponse.status}).`);
  const bucket = await verifyResponse.json().catch(() => null);
  if (bucket?.public !== false) throw new Error('The Siyaj media bucket must be private.');
}

async function migrateLocalStateIfRemoteIsEmpty() {
  const localState = await readExistingLocalDatabase();
  if (!localState || !hasStoredUserData(localState)) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selected = await client.query('SELECT state FROM public.siyaj_app_state WHERE id = 1 FOR UPDATE');
    const remoteState = normalizeDatabaseState(selected.rows[0]?.state);
    if (hasStoredUserData(remoteState)) {
      await client.query('COMMIT');
      return;
    }
    const availableMedia = {};
    for (const [id, item] of Object.entries(localState.account_media)) {
      try {
        const bytes = await fs.readFile(getAccountMediaPath(item.user_id, id));
        await saveAccountMedia(item.user_id, id, bytes, item.type || 'application/octet-stream');
        availableMedia[id] = item;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`Skipped a missing local media file during Supabase migration: ${id}`);
          continue;
        }
        throw error;
      }
    }
    localState.account_media = availableMedia;
    await seedPostgresSettings(client, localState.app_settings);
    localState.app_settings = await readPostgresSettings(client, true);
    await seedPostgresAnalyses(client, localState.panel_analyses);
    await client.query(
      'UPDATE public.siyaj_app_state SET state = $1::jsonb, updated_at = NOW() WHERE id = 1',
      [JSON.stringify(normalizeDatabaseState(localState))],
    );
    await client.query('COMMIT');
    console.log('Siyaj migrated existing local account data to Supabase.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

function storageObjectPath(userId, id) {
  return `${encodeURIComponent(String(userId))}/${encodeURIComponent(String(id))}`;
}

async function storageFetch(route, options = {}) {
  const response = await fetch(storageApiUrl(route), {
    ...options,
    headers: storageHeaders(options.headers || {}),
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 240);
    throw new Error(`Supabase Storage request failed (HTTP ${response.status})${details ? `: ${details}` : ''}`);
  }
  return response;
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS panel_data (
      user_id TEXT PRIMARY KEY,
      last_cleaned_at TEXT,
      data_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      subscription_json TEXT NOT NULL,
      PRIMARY KEY (user_id, endpoint)
    );
    CREATE TABLE IF NOT EXISTS panel_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      dust_loss_percent REAL,
      dust_loss_omr REAL,
      heat_loss_percent REAL,
      heat_loss_omr REAL,
      record_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username_key TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phone_key TEXT UNIQUE,
      user_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT,
      last_seen_at TEXT
    );
    CREATE TABLE IF NOT EXISTS auth_events (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL,
      event TEXT NOT NULL,
      user_id TEXT,
      identifier TEXT,
      ip TEXT,
      user_agent TEXT,
      detail TEXT
    );
    CREATE TABLE IF NOT EXISTS account_states (
      user_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS account_media (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      metadata_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_usage (
      day TEXT PRIMARY KEY,
      request_count INTEGER NOT NULL CHECK (request_count >= 0),
      user_usage_json TEXT NOT NULL
    );
  `);
  // Migration for databases created before session activity tracking existed.
  const sessionColumns = new Set(queryRows(db, 'PRAGMA table_info(auth_sessions)').map((row) => row.name));
  if (!sessionColumns.has('created_at')) db.exec('ALTER TABLE auth_sessions ADD COLUMN created_at TEXT');
  if (!sessionColumns.has('last_seen_at')) db.exec('ALTER TABLE auth_sessions ADD COLUMN last_seen_at TEXT');
  const insert = db.prepare('INSERT OR IGNORE INTO app_settings (key, value_json) VALUES (?, ?)');
  for (const [key, value] of Object.entries(DEFAULT_APP_SETTINGS)) insert.run([key, JSON.stringify(value)]);
  insert.free();
}

const LOCKED_FILE_CODES = new Set(['EPERM', 'EACCES', 'EBUSY']);
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
// Windows can briefly lock a freshly written file (antivirus scans, cloud-sync folders),
// which makes the atomic rename fail even though the data was written correctly.
// Retry with a short backoff, then fall back to writing in place so a transient lock
// cannot take the whole server down.
async function replaceDatabaseFile(temporaryPath, contents) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rename(temporaryPath, databasePath);
      return;
    } catch (error) {
      lastError = error;
      if (!LOCKED_FILE_CODES.has(error.code)) throw error;
      await delay(50 * (attempt + 1));
    }
  }
  try {
    await fs.writeFile(databasePath, contents);
    await fs.rm(temporaryPath, { force: true });
    return;
  } catch { throw lastError; }
}
async function persistSqlite(db) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const temporaryPath = `${databasePath}.tmp`;
  const contents = Buffer.from(db.export());
  await fs.writeFile(temporaryPath, contents);
  await replaceDatabaseFile(temporaryPath, contents);
}

async function readLegacyJson() {
  try { return JSON.parse(await fs.readFile(legacyJsonPath, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function queryRows(db, sql) {
  const statement = db.prepare(sql);
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

function readTables(db) {
  const app_settings = {};
  for (const row of queryRows(db, 'SELECT key, value_json FROM app_settings')) app_settings[row.key] = JSON.parse(row.value_json);
  const panel_data = {};
  for (const row of queryRows(db, 'SELECT user_id, last_cleaned_at, data_json FROM panel_data')) {
    panel_data[row.user_id] = { ...JSON.parse(row.data_json), last_cleaned_at: row.last_cleaned_at };
  }
  const push_subscriptions = {};
  for (const row of queryRows(db, 'SELECT user_id, subscription_json FROM push_subscriptions')) {
    (push_subscriptions[row.user_id] ||= []).push(JSON.parse(row.subscription_json));
  }
  const panel_analyses = queryRows(db, 'SELECT record_json FROM panel_analyses').map((row) => JSON.parse(row.record_json));
  const users = {};
  for (const row of queryRows(db, 'SELECT id, user_json FROM users')) users[row.id] = JSON.parse(row.user_json);
  const sessions = {};
  for (const row of queryRows(db, 'SELECT token_hash, user_id, expires_at, created_at, last_seen_at FROM auth_sessions')) {
    sessions[row.token_hash] = { user_id: row.user_id, expires_at: row.expires_at };
    if (row.created_at) sessions[row.token_hash].created_at = row.created_at;
    if (row.last_seen_at) sessions[row.token_hash].last_seen_at = row.last_seen_at;
  }
  const account_states = {};
  for (const row of queryRows(db, 'SELECT user_id, state_json, updated_at FROM account_states')) account_states[row.user_id] = { state: JSON.parse(row.state_json), updated_at: row.updated_at };
  const account_media = {};
  for (const row of queryRows(db, 'SELECT id, metadata_json FROM account_media')) account_media[row.id] = JSON.parse(row.metadata_json);
  const ai_usage = {};
  // Older local databases can be read for cloud migration before openDatabase creates the new table.
  if (queryRows(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ai_usage'").length) {
    for (const row of queryRows(db, 'SELECT day, request_count, user_usage_json FROM ai_usage')) {
      ai_usage[row.day] = { request_count: row.request_count, users: JSON.parse(row.user_usage_json) };
    }
  }
  const auth_events = queryRows(db, 'SELECT id, at, event, user_id, identifier, ip, user_agent, detail FROM auth_events')
    .map((row) => ({ ...row }));
  return { app_settings, panel_data, push_subscriptions, panel_analyses, users, sessions, account_states, account_media, ai_usage, auth_events };
}

function replaceTables(db, value) {
  const current = {
    app_settings: { ...DEFAULT_APP_SETTINGS, ...(value.app_settings || {}) },
    panel_data: value.panel_data || {},
    push_subscriptions: value.push_subscriptions || {},
    panel_analyses: Array.isArray(value.panel_analyses) ? value.panel_analyses : [],
    users: value.users || {},
    sessions: value.sessions || {},
    account_states: value.account_states || {},
    account_media: value.account_media || {},
    ai_usage: value.ai_usage || {},
    auth_events: Array.isArray(value.auth_events) ? value.auth_events : [],
  };
  db.exec('BEGIN TRANSACTION');
  try {
    db.exec('DELETE FROM app_settings; DELETE FROM panel_data; DELETE FROM push_subscriptions; DELETE FROM panel_analyses; DELETE FROM users; DELETE FROM auth_sessions; DELETE FROM account_states; DELETE FROM account_media; DELETE FROM ai_usage; DELETE FROM auth_events;');
    const settingInsert = db.prepare('INSERT INTO app_settings (key, value_json) VALUES (?, ?)');
    for (const [key, setting] of Object.entries(current.app_settings)) settingInsert.run([key, JSON.stringify(setting)]);
    settingInsert.free();

    const panelInsert = db.prepare('INSERT INTO panel_data (user_id, last_cleaned_at, data_json) VALUES (?, ?, ?)');
    for (const [userId, panel] of Object.entries(current.panel_data)) {
      panelInsert.run([userId, panel.last_cleaned_at || null, JSON.stringify(panel)]);
    }
    panelInsert.free();

    const subscriptionInsert = db.prepare('INSERT INTO push_subscriptions (user_id, endpoint, subscription_json) VALUES (?, ?, ?)');
    for (const [userId, subscriptions] of Object.entries(current.push_subscriptions)) {
      for (const subscription of subscriptions || []) subscriptionInsert.run([userId, subscription.endpoint, JSON.stringify(subscription)]);
    }
    subscriptionInsert.free();

    const analysisInsert = db.prepare(`INSERT INTO panel_analyses
      (id, user_id, created_at, dust_loss_percent, dust_loss_omr, heat_loss_percent, heat_loss_omr, record_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const analysis of current.panel_analyses) {
      analysisInsert.run([
        analysis.id, analysis.user_id, analysis.created_at,
        analysis.dust_loss_percent ?? null, analysis.dust_loss_omr ?? null,
        analysis.heat_loss_percent ?? null, analysis.heat_loss_omr ?? null,
        JSON.stringify(analysis),
      ]);
    }
    analysisInsert.free();
    const userInsert = db.prepare('INSERT INTO users (id, username_key, email, phone_key, user_json) VALUES (?, ?, ?, ?, ?)');
    for (const [id, user] of Object.entries(current.users)) userInsert.run([id, user.username_key, user.email, user.phone_key || null, JSON.stringify(user)]);
    userInsert.free();

    const sessionInsert = db.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)');
    for (const [tokenHash, session] of Object.entries(current.sessions)) {
      sessionInsert.run([tokenHash, session.user_id, session.expires_at, session.created_at || null, session.last_seen_at || null]);
    }
    sessionInsert.free();

    const stateInsert = db.prepare('INSERT INTO account_states (user_id, state_json, updated_at) VALUES (?, ?, ?)');
    for (const [userId, saved] of Object.entries(current.account_states)) stateInsert.run([userId, JSON.stringify(saved.state), saved.updated_at]);
    stateInsert.free();

    const mediaInsert = db.prepare('INSERT INTO account_media (id, user_id, metadata_json) VALUES (?, ?, ?)');
    for (const [id, item] of Object.entries(current.account_media)) mediaInsert.run([id, item.user_id, JSON.stringify(item)]);
    mediaInsert.free();
    const usageInsert = db.prepare('INSERT INTO ai_usage (day, request_count, user_usage_json) VALUES (?, ?, ?)');
    for (const [day, usage] of Object.entries(current.ai_usage)) usageInsert.run([day, usage.request_count, JSON.stringify(usage.users || {})]);
    usageInsert.free();

    const eventInsert = db.prepare('INSERT OR IGNORE INTO auth_events (id, at, event, user_id, identifier, ip, user_agent, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of current.auth_events) {
      eventInsert.run([item.id, item.at, item.event, item.user_id || null, item.identifier || null, item.ip || null, item.user_agent || null, item.detail || null]);
    }
    eventInsert.free();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

async function openDatabase() {
  await fs.mkdir(dataDirectory, { recursive: true });
  const SQL = await getSql();
  let db;
  try {
    db = new SQL.Database(new Uint8Array(await fs.readFile(databasePath)));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    db = new SQL.Database();
    createSchema(db);
    const legacy = await readLegacyJson();
    if (legacy) replaceTables(db, legacy);
    await persistSqlite(db);
  }
  createSchema(db);
  return db;
}

export async function readDatabase() {
  assertRemoteConfiguration();
  if (pool) {
    await ensurePostgres();
    const result = await pool.query('SELECT state FROM public.siyaj_app_state WHERE id = 1');
    const tables = normalizeDatabaseState(result.rows[0]?.state);
    tables.app_settings = await readPostgresSettings(pool);
    return tables;
  }
  const db = await openDatabase();
  try {
    const tables = readTables(db);
    tables.app_settings = validateAppSettings(tables.app_settings);
    return tables;
  }
  finally { db.close(); }
}

export async function initializeDataStore() {
  assertRemoteConfiguration();
  if (pool) {
    await ensurePostgres();
    if (remoteStorageConfigured) await ensureMediaBucket();
    await migrateLocalStateIfRemoteIsEmpty();
    console.log(remoteStorageConfigured
      ? 'Siyaj data store: Postgres and private Supabase Storage are ready.'
      : 'Siyaj data store: Postgres is ready; media is stored on the shared filesystem.');
    return;
  }
  const db = await openDatabase();
  db.close();
  console.log('Siyaj data store: local SQLite and filesystem are ready.');
}

export function getAccountMediaPath(userId, id) {
  return path.join(dataDirectory, 'uploads', userId, id);
}

export async function saveAccountMedia(userId, id, bytes, contentType) {
  assertRemoteConfiguration();
  if (remoteStorageConfigured) {
    await storageFetch(`object/${encodeURIComponent(mediaBucket)}/${storageObjectPath(userId, id)}`, {
      method: 'POST',
      headers: { 'Content-Type': contentType, 'x-upsert': 'true', 'cache-control': '0' },
      body: bytes,
    });
    return;
  }
  const filePath = getAccountMediaPath(userId, id);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, bytes);
  await fs.rename(temporaryPath, filePath);
}

export async function readAccountMedia(userId, id) {
  assertRemoteConfiguration();
  if (remoteStorageConfigured) {
    const response = await storageFetch(`object/${encodeURIComponent(mediaBucket)}/${storageObjectPath(userId, id)}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return fs.readFile(getAccountMediaPath(userId, id));
}

export async function deleteAccountMedia(userId, id) {
  assertRemoteConfiguration();
  if (remoteStorageConfigured) {
    await storageFetch(`object/${encodeURIComponent(mediaBucket)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: [storageObjectPath(userId, id)] }),
    });
    return;
  }
  await fs.rm(getAccountMediaPath(userId, id), { force: true });
}

export function updateDatabase(mutator) {
  const operation = writeQueue.then(async () => {
    assertRemoteConfiguration();
    if (pool) {
      await ensurePostgres();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const selected = await client.query('SELECT state FROM public.siyaj_app_state WHERE id = 1 FOR UPDATE');
        const tables = normalizeDatabaseState(selected.rows[0]?.state);
        tables.app_settings = await readPostgresSettings(client, true);
        const beforeSettings = new Map(Object.entries(tables.app_settings).map(([key, value]) => [key, JSON.stringify(value)]));
        const beforeAnalyses = new Map(tables.panel_analyses.map((analysis) => [String(analysis.id), JSON.stringify(analysis)]));
        const result = await mutator(tables);
        await syncPostgresChanges(client, beforeSettings, beforeAnalyses, tables);
        await client.query(
          'UPDATE public.siyaj_app_state SET state = $1::jsonb, updated_at = NOW() WHERE id = 1',
          [JSON.stringify(tables)],
        );
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    }
    const db = await openDatabase();
    try {
      const tables = readTables(db);
      tables.app_settings = validateAppSettings(tables.app_settings);
      const result = await mutator(tables);
      tables.app_settings = validateAppSettings(tables.app_settings);
      replaceTables(db, tables);
      await persistSqlite(db);
      return result;
    } finally { db.close(); }
  });
  writeQueue = operation.catch(() => {});
  return operation;
}
