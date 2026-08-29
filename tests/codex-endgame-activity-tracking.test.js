import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { state } from '../js/state.js';
import { ensureCodexEntry, CODEX_MILESTONES, codexEntryPoints } from '../js/data/codex.js';
import { enemy2ActivityId } from '../js/data/enemyCodex2Discovery.js';
import '../js/patches/codexFoundation.js';

async function src(p) { return readFile(new URL(`../${p}`, import.meta.url), 'utf8'); }

function withCodex(fn) {
  const previous = state.data.monsterCodex;
  state.data.monsterCodex = {};
  try { return fn(state.data.monsterCodex); } finally { state.data.monsterCodex = previous; }
}

test('ensureCodexEntry defaults to an empty activities list and does not touch old saves\' shape otherwise', () => {
  const entries = {};
  const e = ensureCodexEntry(entries, 'grunt', 'Grunt');
  assert.deepEqual(e.activities, []);

  // An entry created before this feature existed has no `activities` field at
  // all. ensureCodexEntry must backfill it instead of crashing later reads.
  const legacyEntries = { grunt: { name: 'Grunt', seen: true, kills: 3, recruited: false, rare: false, legendary: false } };
  const legacy = ensureCodexEntry(legacyEntries, 'grunt');
  assert.deepEqual(legacy.activities, []);
  assert.equal(legacy.kills, 3, 'existing fields must survive untouched');
});

test('activities is not a Codex milestone and never changes completion points', () => {
  assert.equal(CODEX_MILESTONES.some(m => m.id === 'activities' || /activit/i.test(m.id)), false);
  const withActivities = { seen: true, kills: 1, activities: ['abyss', 'rift', 'secret', 'survey', 'story'] };
  const withoutActivities = { seen: true, kills: 1 };
  assert.equal(codexEntryPoints(withActivities), codexEntryPoints(withoutActivities));
});

test('markCodexSeen/markCodexKill record the endgame mode a Boss was actually fought in, which the ecology roll-up intentionally skips', () => {
  withCodex((entries) => {
    const boss = { type: 'test_apex_boss', name: 'テスト・エイペックス', boss: true };
    state.markCodexSeen(boss, { isAbyss: true });
    state.markCodexKill(boss, { isRift: true });
    state.markCodexSeen(boss, { secretRealm: true });
    state.markCodexSeen(boss, { postCp3DeepSurvey: true });
    state.markCodexSeen(boss, null);
    const e = entries.test_apex_boss;
    assert.ok(e, 'boss must still get a normal per-enemy Codex entry');
    assert.deepEqual(e.activities, ['abyss', 'rift', 'secret', 'survey', 'story']);

    // Repeating the same mode must not duplicate the entry.
    state.markCodexSeen(boss, { isAbyss: true });
    assert.equal(e.activities.filter(a => a === 'abyss').length, 1);
  });
});

test('recordEndgameActivity reuses the existing enemy2ActivityId classifier instead of re-checking stage flags', async () => {
  const s = await src('js/patches/codexFoundation.js');
  assert.match(s, /import\s*\{[^}]*\benemy2ActivityId\b[^}]*\}\s*from\s*'\.\.\/data\/enemyCodex2Discovery\.js'/);
  assert.match(s, /function recordEndgameActivity\(e,stage\)\{const id=enemy2ActivityId\(stage\);/);
  // The function body itself must not re-derive isAbyss/isRift/secretRealm/postCp3DeepSurvey.
  const fn = s.match(/function recordEndgameActivity[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(fn, /isAbyss|isRift|secretRealm|postCp3DeepSurvey/);
});

test('enemy2ActivityId itself is unchanged by this feature (still the single source of mode classification)', () => {
  assert.equal(enemy2ActivityId({ isAbyss: true }), 'abyss');
  assert.equal(enemy2ActivityId({ isRift: true }), 'rift');
  assert.equal(enemy2ActivityId({ secretRealm: true }), 'secret');
  assert.equal(enemy2ActivityId({ postCp3DeepSurvey: true }), 'survey');
  assert.equal(enemy2ActivityId(null), 'story');
});

test('Codex UI shows observed endgame modes per enemy using the existing activity labels, skipping plain story', async () => {
  const s = await src('js/patches/codexUi.js');
  assert.match(s, /ENEMY2_ACTIVITY_LABELS/);
  assert.match(s, /function activityRow\(e\)\{const modes=\(e\.activities\|\|\[\]\)\.filter\(id=>id!=='story'\);/);
  assert.match(s, /観測モード：/);
  assert.match(s, /\$\{activityRow\(e\)\}/, 'activityRow must be wired into the per-enemy knowledge block');
});
