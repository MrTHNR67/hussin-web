// Authentication audit trail.
// Events are appended to the shared application state (works with both the
// SQLite and the Postgres backend, no schema migration needed). The list is
// capped so the state row cannot grow without bound.

import { randomUUID } from 'node:crypto';
import { readDatabase, updateDatabase } from './data-store.mjs';

const MAX_EVENTS = 2000;

function clean(value, max) {
  return String(value ?? '').slice(0, max);
}

export async function recordAuthEvent({ event, userId = null, identifier = '', req = null, detail = '' }) {
  const entry = {
    id: randomUUID(),
    at: new Date().toISOString(),
    event: clean(event, 40),
    user_id: userId ? clean(userId, 64) : null,
    identifier: clean(identifier, 120),
    ip: clean(req?.ip || req?.socket?.remoteAddress || '', 60),
    user_agent: clean(req?.headers?.['user-agent'] || '', 160),
    detail: clean(detail, 200),
  };
  try {
    await updateDatabase((db) => {
      if (!Array.isArray(db.auth_events)) db.auth_events = [];
      db.auth_events.push(entry);
      if (db.auth_events.length > MAX_EVENTS) db.auth_events.splice(0, db.auth_events.length - MAX_EVENTS);
    });
  } catch (error) {
    // Auditing must never break sign-in; log and continue.
    console.warn('Auth audit write failed:', error.message);
  }
  return entry;
}

export async function readAuthEvents({ userId = null, limit = 20 } = {}) {
  const db = await readDatabase();
  const events = Array.isArray(db.auth_events) ? db.auth_events : [];
  const filtered = userId ? events.filter((item) => item.user_id === userId) : events;
  return filtered.slice(-Math.max(1, Math.min(200, limit))).reverse();
}

export async function readAuthEventCount() {
  const db = await readDatabase();
  return Array.isArray(db.auth_events) ? db.auth_events.length : 0;
}

export const AUTH_EVENT_LIMIT = MAX_EVENTS;
