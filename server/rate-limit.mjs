// In-memory rate limiting and account lockout.
// Per-process by design: with N replicas the effective quota is N x the limit.
// A shared store (Redis) would be the next step for a multi-region deployment.

const buckets = new Map();
const MAX_BUCKETS = 20_000;

function sweep(now) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || 'unknown');
}

/**
 * Fixed-window limiter.
 * @param {{windowMs?: number, max?: number, message?: string, key?: (req: any) => string}} options
 */
export function rateLimit({ windowMs = 60_000, max = 30, message = 'طلبات كثيرة جداً؛ حاول بعد قليل.', key = clientIp } = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    sweep(now);
    const id = String(key(req));
    let bucket = buckets.get(id);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(id, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: message, code: 'rate_limited', retryAfterSeconds: retryAfter });
    }
    return next();
  };
}

/**
 * Failure counter that locks an identifier (username/email) after too many
 * failed sign-in attempts. Unlike an IP quota this also covers distributed
 * guessing from many addresses.
 */
export function createLockout({ failWindowMs = 15 * 60_000, failLimit = 10, lockMs = 15 * 60_000 } = {}) {
  const entries = new Map();

  function status(identifier) {
    const id = String(identifier || '').trim().toLowerCase();
    if (!id) return { locked: false, retryAfterSeconds: 0 };
    const now = Date.now();
    const entry = entries.get(id);
    if (!entry) return { locked: false, retryAfterSeconds: 0 };
    if (entry.lockUntil > now) {
      return { locked: true, retryAfterSeconds: Math.max(1, Math.ceil((entry.lockUntil - now) / 1000)) };
    }
    if (entry.resetAt <= now) entries.delete(id);
    return { locked: false, retryAfterSeconds: 0 };
  }

  function fail(identifier) {
    const id = String(identifier || '').trim().toLowerCase();
    if (!id) return { locked: false, retryAfterSeconds: 0 };
    const now = Date.now();
    let entry = entries.get(id);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + failWindowMs, lockUntil: 0 };
    }
    entry.count += 1;
    if (entry.count >= failLimit) {
      entry.lockUntil = now + lockMs;
      entry.count = 0;
      entry.resetAt = now + lockMs;
    }
    entries.set(id, entry);
    return { locked: entry.lockUntil > now, retryAfterSeconds: Math.ceil(Math.max(0, entry.lockUntil - now) / 1000) };
  }

  function reset(identifier) {
    entries.delete(String(identifier || '').trim().toLowerCase());
  }

  function size() {
    return entries.size;
  }

  return { status, fail, reset, size };
}
