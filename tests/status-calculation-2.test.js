import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Status Calculation 2.0 makes Character Lv the stat-growth axis', async () => {
  const text = await source('js/patches/statusCalculationCore.js');
  assert.match(text, /get\(\) \{ return this\.characterLevel; \}/);
  assert.match(text, /legacyGetStats/);
  assert.match(text, /legacyGetStatBreakdown/);
});

test('status layer schema reserves Inheritance, Codex and Rune 2.0 slots', async () => {
  const text = await source('js/patches/statusCalculationCore.js');
  for (const layer of ['characterJobBase', 'inheritance', 'equipment', 'permanent', 'affix', 'codex', 'rune', 'special']) {
    assert.match(text, new RegExp(`'${layer}'`));
  }
  assert.match(text, /const inheritance = 0/);
  assert.match(text, /const codex = 0/);
  assert.match(text, /const rune = 0/);
  assert.match(text, /total - accounted/);
});

test('status calculation core loads immediately after progression core', async () => {
  const text = await source('js/main.js');
  const progression = text.indexOf("./patches/progressionCore.js");
  const status = text.indexOf("./patches/statusCalculationCore.js");
  const weapons = text.indexOf("./patches/weaponInstanceFoundation.js");
  assert.ok(progression >= 0 && status > progression, 'status calculation must load after character progression');
  assert.ok(weapons > status, 'status calculation must be installed before gameplay integration patches');
});

test('legacy job level remains available for job-specific progression', async () => {
  const progression = await source('js/patches/progressionCore.js');
  assert.match(progression, /currentJobLevel/);
  assert.match(progression, /currentJobExp/);
  assert.match(progression, /characterLevel/);
});
