import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const FILES = {
  'codexUi.js': '../js/patches/codexUi.js',
  'enemy3CodexUi.js': '../js/patches/enemy3CodexUi.js',
  'contentPackIIE.js': '../js/patches/contentPackIIE.js',
  'phase12FinaleRuntime.js': '../js/patches/phase12FinaleRuntime.js',
  'systemDeepeningPackB.js': '../js/patches/systemDeepeningPackB.js',
  'systemDeepeningPackC.js': '../js/patches/systemDeepeningPackC.js',
  'combat3EnemyAI.js': '../js/patches/combat3EnemyAI.js',
  'spellScreen.js': '../js/screens/spellScreen.js',
  'jobCodexUi.js': '../js/patches/jobCodexUi.js',
};

const sources = Object.fromEntries(
  Object.entries(FILES).map(([name, path]) => [name, readFileSync(new URL(path, import.meta.url), 'utf8')])
);

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-6 batch 4 removes rendered-UI emoji from Monster Codex, its Rumor Notebook/Field Guide decorators, and the Spell (save code) screen', () => {
  for (const [name, source] of Object.entries(sources)) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-6 batch 4 stops rendering element/role icon fields (category 2) at every Codex render site, without touching canonical data', () => {
  assert.doesNotMatch(sources['codexUi.js'], /d\.icon|k\.role\.icon/);
  assert.match(sources['codexUi.js'], /function elementName\(id\)\{const d=COMBAT2_ELEMENTS\[id\];return d\?d\.name:id;\}/);
  assert.match(sources['codexUi.js'], /const role=k\.roleKnown\?k\.role\.name:'？？？'/);
  assert.doesNotMatch(sources['systemDeepeningPackB.js'], /g\.role\.icon/);
  assert.match(sources['systemDeepeningPackB.js'], /役割: \$\{g\.role\.name\}<br>/);
});

test('UIX-6 batch 4 drops the Rumor Notebook panel\'s map-icon title, keeping plain RUMORS text', () => {
  assert.doesNotMatch(sources['systemDeepeningPackC.js'], /🗺/);
  assert.match(sources['systemDeepeningPackC.js'], /forge-card-name">RUMORS \$\{summary\.resolved\}/);
});

test('UIX-6 batch 4 replaces the Battle-screen researched-role name prefix with a text tag instead of dropping the reward signal', () => {
  // js/patches/combat3EnemyAI.js is Battle-engine-owned, not a Codex file,
  // but this exact line was flagged in UIX0_SOURCE_AND_OWNERSHIP_AUDIT.md
  // §15 as debt for whichever pass reviews Battle/Codex presentation next —
  // this batch (Codex) is that pass. tests/codex-enemy-knowledge.test.js's
  // existing assertions only check the conditional+assignment shape, not
  // the icon literal, so they remain valid unchanged.
  assert.doesNotMatch(sources['combat3EnemyAI.js'], /role\.icon/);
  assert.match(sources['combat3EnemyAI.js'], /if\(known\?\.roleKnown\|\|known\?\.analyzed\)e\.name=`【\$\{role\.name\}】\$\{e\.name\}`/);
});

test('UIX-6 batch 4 drops decorative warning/success prefixes on the Spell (save code) screen\'s status messages', () => {
  assert.doesNotMatch(sources['spellScreen.js'], /⚠|✨/);
  assert.match(sources['spellScreen.js'], /msg\.textContent = '保存に失敗しました/);
  assert.match(sources['spellScreen.js'], /msg\.textContent = 'ふっかつした！'/);
  assert.match(sources['spellScreen.js'], /msg\.textContent = result\.error;/);
});

test('UIX-6 batch 4 gives jobCodexUi.js\'s progress bar (deferred from UIX-6 batch 1) Dark Chronicle tokens', () => {
  assert.match(sources['jobCodexUi.js'], /background:var\(--dc-ink-900, #242735\)/);
  assert.match(sources['jobCodexUi.js'], /background:var\(--dc-brass-300, #d7b35c\)/);
});

test('UIX-6 batch 4 introduces no new calculation authority — Codex/Spell screens read existing state only', () => {
  for (const [name, source] of Object.entries(sources)) {
    if (name === 'spellScreen.js') continue; // the save import/export screen legitimately touches localStorage
    assert.doesNotMatch(source, /localStorage/, `${name} must not add its own persistence`);
  }
  // spellScreen.js is the one legitimate localStorage user in this batch —
  // it IS the save import/export mechanism, so it reads/writes the existing
  // save key directly rather than introducing a new one.
  assert.match(sources['spellScreen.js'], /SPELL_TARGET_SAVE_KEY = 'bladevale_save_v1'/);
  assert.match(sources['codexUi.js'], /state\.codexSummary\?\.\(\)/);
});
