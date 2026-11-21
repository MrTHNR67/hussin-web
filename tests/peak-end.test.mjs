import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const script = await fs.readFile(path.join(root, 'public', 'app.js'), 'utf8');
const css = await fs.readFile(path.join(root, 'public', 'motion.css'), 'utf8');

test('app.js defines the Peak-End celebration and the fake analysis handler', () => {
  assert.ok(script.includes('function playPeakEnd'), 'playPeakEnd() must exist');
  assert.ok(script.includes('function runFakeAnalysis'), 'runFakeAnalysis() must exist');
});

test('fake analysis is a 2.5 s client-only simulation', () => {
  // The existing /api/panel/analysis route stores monthly calculations and is
  // not AI; the constraint is that the *new fake handler* adds no request.
  const handler = script.slice(script.indexOf('async function runFakeAnalysis'), script.indexOf('function syncHeader'));
  assert.ok(handler.includes('2500'), 'the 2500 ms simulation delay must be present');
  assert.ok(handler.includes('analysisBusy'), 'the handler must guard against double clicks');
  assert.ok(!handler.includes('fetch(') && !handler.includes('/api/'), 'no backend AI endpoint may be added');
  assert.ok(!script.includes('runAnalysis({ useClaude: true })'), 'the panel button must not call the real AI path');
});

test('peak-burst uses a 40 ms stagger under 300 ms', () => {
  assert.ok(css.includes('@keyframes peak-burst'));
  assert.ok(css.includes('animation-delay: var(--delay'), 'children need a staggered delay');
  assert.ok(script.includes('40'), 'stagger step must be 40 ms');
});
