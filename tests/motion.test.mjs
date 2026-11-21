import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const css = await fs.readFile(path.join(root, 'public', 'motion.css'), 'utf8');
const script = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');
const html = await fs.readFile(path.join(root, 'public', 'index.html'), 'utf8');

test('motion.css defines the four approved behaviours', () => {
  assert.ok(css.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'slow-in curve missing');
  assert.ok(css.includes('cubic-bezier(0.7, 0, 0.84, 0)'), 'slow-out curve missing');
  assert.ok(css.includes('scaleX(1.1)') && css.includes('scaleY(0.9)'), 'squash/stretch missing');
  assert.ok(css.includes('scale(1.08)'), 'icon hover growth missing');
});

test('reduced motion disables animation without hiding content', () => {
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(css.includes('animation: none !important'));
  assert.ok(css.includes('transition: none !important'));
});

test('page navigation triggers the motion helper', () => {
  assert.ok(script.includes('SiyajMotion.playPageTransition'), 'showPage must call the motion helper');
  assert.ok(html.includes('/motion.css'));
  assert.ok(html.includes('/motion.js'));
});
