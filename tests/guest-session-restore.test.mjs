import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const script = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');

// Extract the real functions from app.js so the test exercises the shipped
// boot logic instead of merely looking for matching strings.
function extract(name, endMarker) {
  const match = script.indexOf(`function ${name}`);
  assert.ok(match >= 0, `${name} must exist`);
  const isAsync = script.slice(Math.max(0, match - 6), match) === 'async ';
  const start = isAsync ? match - 6 : match;
  const end = script.indexOf(endMarker, start);
  assert.ok(end > start, `${name} must end before ${endMarker}`);
  return script.slice(start, end);
}

const clearGuestIdentity = extract('clearGuestIdentity', '\nfunction renderAuth');
const restoreGuestSession = extract('restoreGuestSession', '\ninit();');

async function bootWithSessionResponse(status) {
  const store = {
    siyaj_guest_token: 'stale-token',
    siyaj_guest_profile: JSON.stringify({ name: 'سالم', tribe: 'البوشمي' }),
  };
  const calls = [];
  const context = {
    localStorage: {
      getItem: (key) => (key in store ? store[key] : null),
      removeItem: (key) => { delete store[key]; calls.push(`remove:${key}`); },
      setItem: (key, value) => { store[key] = value; },
    },
    GUEST_TOKEN_KEY: 'siyaj_guest_token',
    GUEST_PROFILE_KEY: 'siyaj_guest_profile',
    state: { user: { id: 'stale' } },
    authenticatedFetch: async () => ({ ok: status < 400, status }),
    renderAuth: () => calls.push('renderAuth'),
    syncHeader: () => calls.push('syncHeader'),
    showPage: (page) => calls.push(`showPage:${page}`),
    accountStorageKey: () => 'account-stale',
    loadState: () => null,
    finishServerAuth: async () => { calls.push('finishServerAuth'); },
    continueAfterAuth: async () => { calls.push('continueAfterAuth'); },
  };
  const source = `let currentAccount = { id: 'stale' };\n${clearGuestIdentity}\n${restoreGuestSession}\nrestoreGuestSession;`;
  const restore = vm.runInNewContext(source, context);
  await restore();
  return { store, calls, context };
}

for (const status of [401, 500]) {
  test(`a failed session probe (${status}) clears the local guest identity`, async () => {
    const { store, calls, context } = await bootWithSessionResponse(status);
    assert.equal(store.siyaj_guest_token, undefined, 'stale token must be removed');
    assert.equal(store.siyaj_guest_profile, undefined, 'stale profile must be removed');
    assert.equal(context.state.user, null);
    assert.ok(calls.includes('showPage:auth'), 'the guest form must be shown');
    assert.ok(!calls.includes('finishServerAuth'), 'a failed probe must not restore an account');
  });
}

test('a first visit renders the guest form without probing the server', async () => {
  const calls = [];
  const context = {
    localStorage: { getItem: () => null, removeItem: () => {}, setItem: () => {} },
    GUEST_TOKEN_KEY: 'siyaj_guest_token',
    GUEST_PROFILE_KEY: 'siyaj_guest_profile',
    state: { user: null },
    authenticatedFetch: async () => { calls.push('probe'); return { ok: true, status: 200 }; },
    renderAuth: () => calls.push('renderAuth'),
    syncHeader: () => {},
    showPage: (page) => calls.push(`showPage:${page}`),
  };
  const source = `let currentAccount = null;\n${clearGuestIdentity}\n${restoreGuestSession}\nrestoreGuestSession;`;
  await vm.runInNewContext(source, context)();
  assert.ok(calls.includes('renderAuth'));
  assert.ok(!calls.includes('probe'), 'no token means no session request');
});
