import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

// Blade Vale design law: rendered application UI contains no platform emoji.
// scripts/uix-emoji-check.js is the canonical implementation; this test wires
// the gate into `npm test` so reintroduction fails the suite.
test('no-emoji law: render paths and non-icon data fields are pictograph-free', () => {
  let out;
  try {
    out = execSync('node scripts/uix-emoji-check.js', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    assert.fail(`emoji gate failed:\n${e.stderr || e.message}`);
  }
  assert.match(out, /emoji gate: clean/);
});
