import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const html = await fs.readFile(path.join(root, 'public', 'index.html'), 'utf8');
const script = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');

test('guest form replaces login and signup in the existing auth card', () => {
  assert.match(html, /id="page-auth"/, 'the original auth page container must remain');
  assert.match(html, /class="panel auth-card"/, 'the original card design must remain');
  assert.match(html, /id="guest-name"/);
  assert.match(html, /id="guest-tribe"/);
  assert.doesNotMatch(html, /id="login-form"/);
  assert.doesNotMatch(html, /id="signup-form"/);
  assert.doesNotMatch(html, /id="auth-tabs"/);
  assert.doesNotMatch(html, /data-google-signin/);
});

test('the header no longer offers تسجيل الدخول', () => {
  const headerLine = html.split('\n').find((line) => line.includes('id="auth-nav"')) || '';
  assert.ok(headerLine, 'auth-nav must still exist so the guest name can be displayed');
  assert.doesNotMatch(headerLine, /تسجيل الدخول/);
  assert.doesNotMatch(headerLine, /data-page="auth"/);
});

test('client restores the guest session from local storage', () => {
  for (const needle of ['restoreGuestSession', 'siyaj_guest_token', 'siyaj_guest_profile', '/api/auth/guest']) {
    assert.ok(script.includes(needle), `app.js must contain ${needle}`);
  }
  assert.ok(!script.includes("el('login-form')"), 'app.js must not bind the removed login form');
});
