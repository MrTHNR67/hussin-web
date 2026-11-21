import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// The data store resolves SIYAJ_DATA_DIR at module load, so set the environment
// before importing any server module. No DATABASE_URL -> local sql.js store.
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'siyaj-guest-'));
process.env.SIYAJ_TEST = '1';
process.env.SIYAJ_DATA_DIR = tempDir;
delete process.env.DATABASE_URL;
delete process.env.DATABASE_PASSWORD;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SECRET_KEY;

const { initializeDataStore } = await import('../server/data-store.mjs');
const { default: app } = await import('../server.mjs');

assert.ok(app, 'server.mjs must export the Express app as its default export');

let server;
let base;

test.before(async () => {
  await initializeDataStore();
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await fs.rm(tempDir, { recursive: true, force: true });
});

async function postGuest(body) {
  return fetch(`${base}/api/auth/guest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('POST /api/auth/guest creates a guest session with name and tribe', async () => {
  const response = await postGuest({ name: 'سالم', tribe: 'البوشمي' });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.user.role, 'guest');
  assert.equal(body.user.name, 'سالم');
  assert.equal(body.user.tribe, 'البوشمي');
  assert.ok(body.user.id);
  assert.match(String(response.headers.get('set-cookie')), /siyaj_session=/);
});

test('POST /api/auth/guest rejects empty and oversized values', async () => {
  for (const body of [
    { name: '', tribe: 'البوشمي' },
    { name: 'سالم', tribe: '   ' },
    { name: 'س'.repeat(200), tribe: 'البوشمي' },
    { name: 'سالم', tribe: 'ق'.repeat(200) },
  ]) {
    const response = await postGuest(body);
    assert.equal(response.status, 400, `expected 400 for ${JSON.stringify(body).slice(0, 40)}`);
  }
});

test('a guest session can read its own session but cannot reach admin stats', async () => {
  const created = await postGuest({ name: 'نورة', tribe: 'الحراسين' });
  const cookie = String(created.headers.get('set-cookie')).split(';')[0];

  const sessionResponse = await fetch(`${base}/api/auth/session`, { headers: { cookie } });
  assert.equal(sessionResponse.status, 200);
  const session = await sessionResponse.json();
  assert.equal(session.user.role, 'guest');
  assert.equal(session.user.tribe, 'الحراسين');

  const adminResponse = await fetch(`${base}/api/admin/stats`, { headers: { cookie } });
  assert.equal(adminResponse.status, 403);
});
