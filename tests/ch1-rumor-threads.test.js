import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CH1_RUMOR_THREADS, buildCh1RumorRecord, unlockedEntriesFor, ch1RumorStateId, mergeCh1RumorEntries } from '../js/data/ch1RumorThreads.js';
import { RUMOR_STATES } from '../js/data/systemDeepeningPackC.js';

const INITIAL_IDS = ['dried_meat', 'gate_scar', 'shining_one', 'wary_puddle', 'fixed_signpost', 'failed_blade'];
const EXPLORATION_IDS = ['seed_in_pouch', 'waiting_beast', 'valley_echo', 'extra_bowl'];
const FOLLOWUP_IDS = ['hidden_valley_signs', 'orcking_composure'];

function ctx(cleared = [], codex = {}) {
  const set = new Set(cleared);
  return { isStageCleared: (id) => set.has(id), codex };
}

function syncAll(clearedList, codex, discoveries = {}) {
  const c = ctx(clearedList, codex);
  for (const rumor of CH1_RUMOR_THREADS) {
    const id = `rumor:ch1_${rumor.id}`;
    const record = buildCh1RumorRecord(rumor, c, discoveries[id], RUMOR_STATES);
    if (record) discoveries[id] = record;
  }
  return discoveries;
}

test('exactly 12 Chapter 1 Rumor Threads are defined, matching the required split (6/4/2)', () => {
  assert.equal(CH1_RUMOR_THREADS.length, 12);
  const ids = CH1_RUMOR_THREADS.map((r) => r.id).sort();
  assert.deepEqual(ids, [...INITIAL_IDS, ...EXPLORATION_IDS, ...FOLLOWUP_IDS].sort());
  for (const rumor of CH1_RUMOR_THREADS) {
    assert.ok(rumor.entries.length >= 2, `${rumor.id} must have more than one entry (a Thread, not a single line)`);
  }
});

test('Fresh save: only the initial 6 Rumors are discovered, exploration/followup are not yet, and each initial Rumor has a readable opening entry', () => {
  const discoveries = syncAll([], {});
  const ch1 = Object.values(discoveries).filter((r) => r.ch1Thread);
  assert.equal(ch1.length, 6);
  for (const id of INITIAL_IDS) assert.ok(discoveries[`rumor:ch1_${id}`], `${id} must be readable from a fresh save`);
  for (const id of [...EXPLORATION_IDS, ...FOLLOWUP_IDS]) assert.equal(discoveries[`rumor:ch1_${id}`], undefined, `${id} must not exist yet on a fresh save`);
  for (const r of ch1) {
    assert.ok(r.hint && r.hint.length > 0);
    assert.notEqual(r.rumorState, 'resolved');
  }
});

test('Mid Chapter 1 (1-1..1-3 cleared): new Rumors appear, initial Rumors gain entries, past entries are kept, no duplicates', () => {
  const discoveries = syncAll(['1-1', '1-2', '1-3'], {});
  const ch1 = Object.values(discoveries).filter((r) => r.ch1Thread);
  assert.ok(ch1.length > 6, 'new (exploration/followup) Rumors must appear by mid Chapter 1');
  const driedMeat = discoveries['rumor:ch1_dried_meat'];
  const ids = driedMeat.entries.map((e) => e.id);
  assert.ok(ids.includes('initial'), 'the opening entry must never disappear');
  assert.ok(ids.length > 1, 'an initial Rumor must accumulate more entries as Chapter 1 progresses');
  assert.equal(new Set(ids).size, ids.length, 'no duplicate entries');
});

test('Chapter 1 progressed (1-4/1-B/1-5 also cleared): field/return/followup entries land, all 12 threads eventually reachable', () => {
  const discoveries = syncAll(['1-1', '1-2', '1-3', '1-4', '1-B', '1-5'], { ch1_rare: { seen: true, kills: 1 } });
  const ch1 = Object.values(discoveries).filter((r) => r.ch1Thread);
  assert.equal(ch1.length, 12, 'all 12 threads must be reachable by the end of Chapter 1 + the Rare kill');
  assert.ok(discoveries['rumor:ch1_dried_meat'].entries.some((e) => e.type === 'followup'));
  assert.ok(discoveries['rumor:ch1_extra_bowl'].entries.some((e) => e.type === 'return'));
  assert.ok(discoveries['rumor:ch1_waiting_beast'].entries.some((e) => e.type === 'field'));
  // 1-B (隠し谷) must be a real, used unlock source per the task's own audit requirement.
  assert.ok(CH1_RUMOR_THREADS.some((r) => r.entries.some((e) => e.unlock.type === 'stage' && e.unlock.stageId === '1-B')));
  // Not every thread has to resolve -- "still don't know" is allowed.
  const unresolvedOrTracking = ch1.filter((r) => r.rumorState !== 'resolved').length;
  assert.ok(unresolvedOrTracking >= 8, 'most threads should stay open (not forced to resolve)');
});

test('The Rare Chapter 1 encounter thread only connects to the real existing Rare (ch1_rare / Golden Slime), and only resolves once actually defeated', () => {
  const seen = syncAll(['1-1'], { ch1_rare: { seen: true, kills: 0 } });
  const shiningSeen = seen['rumor:ch1_shining_one'];
  assert.ok(shiningSeen.entries.some((e) => e.id === 'testimony_glow'));
  assert.notEqual(shiningSeen.rumorState, 'resolved');
  const killed = syncAll(['1-1'], { ch1_rare: { seen: true, kills: 1 } }, seen);
  const shiningKilled = killed['rumor:ch1_shining_one'];
  assert.equal(shiningKilled.rumorState, 'resolved');
  assert.ok(shiningKilled.resolvedAt);
  // Every unlock referencing a Monster Codex entry must point at the real ch1_rare id (Golden Slime), never an invented species.
  for (const rumor of CH1_RUMOR_THREADS) {
    for (const entry of rumor.entries) {
      if (entry.unlock.type === 'codexSeen' || entry.unlock.type === 'codexKills') assert.equal(entry.unlock.enemyId, 'ch1_rare');
    }
  }
});

test('Existing save with unrelated Rumor/Discovery data: nothing is overwritten, Chapter 1 threads add on top, no duplicates', () => {
  const existing = {
    'rumor:nameless-king': { rumor: true, rumorId: 'nameless-king', name: '噂：無名の王', rumorState: 'unresolved', hint: '既存の噂' },
    'trace:phantom_beast_forest': { name: '痕跡', at: 12345 },
  };
  const before = JSON.stringify(existing['rumor:nameless-king']);
  syncAll(['1-1', '1-2'], {}, existing);
  assert.equal(JSON.stringify(existing['rumor:nameless-king']), before, 'unrelated existing Rumor must not be touched');
  assert.ok(existing['trace:phantom_beast_forest'], 'unrelated existing Discovery must not be dropped');
  const ch1Count = Object.keys(existing).filter((k) => k.startsWith('rumor:ch1_')).length;
  assert.ok(ch1Count >= 6);
  const snapshot = JSON.stringify(existing);
  syncAll(['1-1', '1-2'], {}, existing);
  assert.equal(JSON.stringify(existing), snapshot, 'no duplication on a repeated sync with unchanged progress');
});

test('Reload (serialize -> parse -> re-sync) preserves history and unlock state exactly', () => {
  const discoveries = syncAll(['1-1', '1-2', '1-3', '1-4', '1-B', '1-5'], { ch1_rare: { seen: true, kills: 1 } });
  const reloaded = JSON.parse(JSON.stringify(discoveries));
  syncAll(['1-1', '1-2', '1-3', '1-4', '1-B', '1-5'], { ch1_rare: { seen: true, kills: 1 } }, reloaded);
  assert.equal(JSON.stringify(reloaded), JSON.stringify(discoveries));
});

test('Rumor Thread progression never regresses / rewinds stageProgress-derived unlocks (order is fixed, entries only accumulate)', () => {
  const rumor = CH1_RUMOR_THREADS.find((r) => r.id === 'dried_meat');
  const stage1 = unlockedEntriesFor(rumor, ctx(['1-1']));
  const stage2 = unlockedEntriesFor(rumor, ctx(['1-1', '1-2']));
  assert.ok(stage2.length >= stage1.length);
  assert.deepEqual(stage1.map((e) => e.id), stage2.slice(0, stage1.length).map((e) => e.id));
});

test('mergeCh1RumorEntries preserves the resolves flag (regression: it was being dropped during merge)', () => {
  const fresh = [{ id: 'a', order: 1, resolves: false, text: 'x', source: 's', type: 'initial' }, { id: 'b', order: 2, resolves: true, text: 'y', source: 's', type: 'return' }];
  const merged = mergeCh1RumorEntries(undefined, fresh);
  assert.equal(merged.find((e) => e.id === 'b').resolves, true);
  assert.equal(ch1RumorStateId({ id: 'x' }, merged), 'resolved');
});

test('No new quest-board vocabulary, no kill quota, no new currency/save root, no daily/weekly', () => {
  const data = fs.readFileSync(new URL('../js/data/ch1RumorThreads.js', import.meta.url), 'utf8');
  const runtime = fs.readFileSync(new URL('../js/patches/ch1RumorThreads.js', import.meta.url), 'utf8');
  const ui = fs.readFileSync(new URL('../js/patches/ch1RumorThreadsCampfireUi.js', import.meta.url), 'utf8');
  for (const src of [data, runtime, ui]) {
    assert.doesNotMatch(src, /受注する|報告する|クエスト一覧/);
    assert.doesNotMatch(src, /rumorCurrency|rumorGold|rumorCoin|setInterval|new Date\(\)\.get(Day|Date)/);
  }
  // "kill quota" (N体倒せ) would show up as a numeric enemy-count unlock condition;
  // this Rumor Thread system's only unlock vocabulary is stage/codexSeen/codexKills(>=1 sighting-style presence check)/always.
  for (const rumor of CH1_RUMOR_THREADS) {
    for (const entry of rumor.entries) {
      assert.ok(['always', 'stage', 'anyStage', 'codexSeen', 'codexKills'].includes(entry.unlock.type));
      if (entry.unlock.type === 'codexKills') assert.equal(entry.unlock.min, 1, 'no accumulating kill-count quota, only a presence/first-kill check');
    }
  }
  assert.match(runtime, /world2\.discoveries/);
  assert.doesNotMatch(runtime, /state\.data\.rumor(Threads|Save)\s*=/);
});

test('Reuses the existing world2.discoveries authority and RUMOR_STATES; wired through homeNavigation.js in both layers', () => {
  const runtime = fs.readFileSync(new URL('../js/patches/ch1RumorThreads.js', import.meta.url), 'utf8');
  const nav = fs.readFileSync(new URL('../js/patches/homeNavigation.js', import.meta.url), 'utf8');
  assert.match(runtime, /RUMOR_STATES/);
  assert.match(runtime, /state\.rumorNotebook/);
  assert.match(nav, /ch1RumorThreads\.js/);
  assert.match(nav, /ch1RumorThreadsCampfireUi\.js/);
});

test('Campfire UI only shows before the Tavern unlocks, and follows the idempotent append pattern (no unconditional DOM rewrite)', () => {
  const ui = fs.readFileSync(new URL('../js/patches/ch1RumorThreadsCampfireUi.js', import.meta.url), 'utf8');
  assert.match(ui, /settlementTavernUnlocked/);
  assert.match(ui, /querySelector\(['"]\[data-ch1-campfire\]['"]\)/);
  assert.doesNotMatch(ui, /goHomeBtn|menu-card.*campfire|campfire.*menu-card/i);
});

test('No platform emoji introduced by the Rumor Thread content or UI', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  const data = fs.readFileSync(new URL('../js/data/ch1RumorThreads.js', import.meta.url), 'utf8');
  const runtime = fs.readFileSync(new URL('../js/patches/ch1RumorThreads.js', import.meta.url), 'utf8');
  const ui = fs.readFileSync(new URL('../js/patches/ch1RumorThreadsCampfireUi.js', import.meta.url), 'utf8');
  const packC = fs.readFileSync(new URL('../js/patches/systemDeepeningPackC.js', import.meta.url), 'utf8');
  for (const src of [data, runtime, ui, packC]) assert.doesNotMatch(src, PICTOGRAPH);
});
