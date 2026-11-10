import { updateDatabase } from './data-store.mjs';

const MAX_CONCURRENT_REQUESTS = 2;
const USER_COOLDOWN_MS = 30_000;
const DAY_MS = 86_400_000;
let activeRequests = 0;
const activeUserIds = new Set();

export class AiUsageError extends Error {
  constructor(message, { retryAfterSeconds, reason = 'quota' } = {}) {
    super(message);
    this.name = 'AiUsageError';
    this.status = 429;
    this.code = 'siyaj_ai_limit';
    this.reason = reason;
    if (Number.isFinite(retryAfterSeconds)) this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}

function dailyLimit(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000 ? value : fallback;
}

function safeCount(value) { return Number.isSafeInteger(value) && value >= 0; }
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }

function integrityError() {
  return new AiUsageError('تعذر التحقق من حد استخدام التحليل الآن. أعد المحاولة لاحقاً.', { reason: 'ledger_unavailable', retryAfterSeconds: 60 });
}

function retainedLedger(value, knownUsers, today, yesterday) {
  const result = {};
  if (value === undefined || value === null) return result;
  if (!object(value)) throw integrityError();
  for (const day of [yesterday, today]) {
    const daily = value[day];
    if (daily === undefined) continue;
    if (!object(daily) || !safeCount(daily.request_count) || !object(daily.users)) throw integrityError();
    const users = Object.create(null);
    let retainedRequests = 0;
    for (const [userId, usage] of Object.entries(daily.users)) {
      // Remove account IDs after deletion; preserve the aggregate global count.
      if (!Object.hasOwn(knownUsers, userId)) continue;
      if (!object(usage) || !safeCount(usage.request_count) || typeof usage.last_reserved_at !== 'string' || !Number.isFinite(Date.parse(usage.last_reserved_at))) throw integrityError();
      users[userId] = { request_count: usage.request_count, last_reserved_at: usage.last_reserved_at };
      retainedRequests += usage.request_count;
    }
    if (!Number.isSafeInteger(retainedRequests) || retainedRequests > daily.request_count) throw integrityError();
    result[day] = { request_count: daily.request_count, users };
  }
  return result;
}

// Call only after authentication, request validation and provider configuration.
// The reservation is durable and consumed even if the provider call fails.
export async function reserveClaudeRequest(userId) {
  const id = typeof userId === 'string' ? userId : '';
  if (!id || id.length > 200) throw new AiUsageError('سجّل الدخول قبل استخدام التحليل.', { reason: 'user_unavailable' });
  const userLimit = dailyLimit('CLAUDE_USER_DAILY_LIMIT', 10);
  const globalLimit = dailyLimit('CLAUDE_GLOBAL_DAILY_LIMIT', 100);
  if (userLimit === 0 || globalLimit === 0) throw new AiUsageError('التحليل الذكي متوقف حالياً وفق إعدادات الاستخدام.', { reason: 'disabled' });
  if (activeUserIds.has(id)) throw new AiUsageError('يوجد تحليل لحسابك قيد التنفيذ. انتظر اكتماله.', { reason: 'user_concurrency', retryAfterSeconds: 30 });
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) throw new AiUsageError('التحليل مشغول حالياً. أعد المحاولة بعد قليل.', { reason: 'server_concurrency', retryAfterSeconds: 30 });

  // Reserve the local slot synchronously before awaiting the shared database lock.
  activeRequests += 1;
  activeUserIds.add(id);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    activeUserIds.delete(id);
    activeRequests = Math.max(0, activeRequests - 1);
  };
  try {
    await updateDatabase((db) => {
      if (!Object.hasOwn(db.users || {}, id)) throw new AiUsageError('سجّل الدخول قبل استخدام التحليل.', { reason: 'user_unavailable' });
      const now = new Date();
      const timestamp = now.toISOString();
      const today = timestamp.slice(0, 10);
      const yesterday = new Date(now.getTime() - DAY_MS).toISOString().slice(0, 10);
      const ledger = retainedLedger(db.ai_usage, db.users, today, yesterday);
      const daily = ledger[today] || { request_count: 0, users: Object.create(null) };
      const user = daily.users[id] || { request_count: 0, last_reserved_at: null };
      const secondsToTomorrow = (Date.parse(`${today}T00:00:00Z`) + DAY_MS - now.getTime()) / 1000;
      if (user.request_count >= userLimit) throw new AiUsageError('وصلت إلى حد التحليل اليومي لحسابك. يتجدد الحد عند منتصف الليل بتوقيت UTC.', { reason: 'user_daily_limit', retryAfterSeconds: secondsToTomorrow });
      if (daily.request_count >= globalLimit) throw new AiUsageError('وصل الموقع إلى حد التحليل اليومي. يتجدد الحد عند منتصف الليل بتوقيت UTC.', { reason: 'global_daily_limit', retryAfterSeconds: secondsToTomorrow });
      const previous = ledger[yesterday]?.users[id];
      const lastReservation = Math.max(user.last_reserved_at ? Date.parse(user.last_reserved_at) : 0, previous?.last_reserved_at ? Date.parse(previous.last_reserved_at) : 0);
      if (lastReservation && now.getTime() - lastReservation < USER_COOLDOWN_MS) {
        throw new AiUsageError('انتظر 30 ثانية بين طلبات التحليل.', { reason: 'user_cooldown', retryAfterSeconds: (USER_COOLDOWN_MS - (now.getTime() - lastReservation)) / 1000 });
      }
      daily.request_count += 1;
      daily.users[id] = { request_count: user.request_count + 1, last_reserved_at: timestamp };
      ledger[today] = daily;
      db.ai_usage = ledger;
    });
    return release;
  } catch (error) {
    release();
    if (error instanceof AiUsageError) throw error;
    // A failed durable reservation must never fall back to an unmetered paid request.
    throw integrityError();
  }
}
