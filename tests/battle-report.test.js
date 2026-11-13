// Battle Report (EXP-4) and the pursuit incident (C7 third archetype) both
// read battle output without owning any battle rule. Pin the two contracts
// that are easy to break silently: who counts as a damage source, and that
// the pursuit incident adds no enemy/stage/reward data of its own.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBattleReport, recordBattleEvents, summarizeBattleReport } from '../js/data/battleReport.js';
import { SETTLEMENT_INCIDENTS, pursuitRoundLimit } from '../js/data/settlementIncidents.js';
import { BEGINNER_GUIDE_STEPS, beginnerGuideProgress } from '../js/data/beginnerGuide.js';

test('battle report attributes damage by source and ignores enemy-hits-companion log entries', () => {
  const report = createBattleReport();
  recordBattleEvents(report, [
    { type: 'playerAction', result: { action: 'attack', damage: 60, hitCount: 2, criticalCount: 1 } },
    { type: 'playerAction', result: { action: 'skill', name: '渾身の一撃', techType: 'damage', targets: [{ targetId: 'e1', damage: 30, critical: false }] } },
    { type: 'playerAction', result: { action: 'skill', companion: true, companionName: 'スライム', name: 'たいあたり', targets: [{ targetId: 'e1', damage: 10 }] } },
    // companionBattle logs "an enemy hit a companion" as a playerAction whose targets carry no targetId
    { type: 'playerAction', result: { action: 'skill', name: 'ゴブリンの攻撃', targets: [{ targetName: 'スライム', damage: 999 }] } },
    { type: 'playerAction', result: { action: 'skill', blocked: true } },
    { type: 'enemyAction', result: { name: '【前衛】ゴブリン', kind: 'attack', damage: 12 } },
    { type: 'enemyAction', result: { name: 'オーガ', kind: 'special', damage: 28 } },
    { type: 'enemyAction', result: { name: 'ゴブリン', kind: 'attack', damage: 0, evaded: true } },
  ]);
  const s = summarizeBattleReport(report, { rounds: 4, maxHp: 100 });
  assert.equal(s.dealt, 100);
  assert.deepEqual(s.sources.map((x) => [x.label, x.amount]), [['こうげき', 60], ['渾身の一撃', 30], ['仲間：スライム', 10]]);
  assert.equal(s.dealtPerRound, 25);
  assert.equal(s.taken, 40);
  assert.equal(s.takenVsMaxHp, 0.4);
  assert.deepEqual(s.threats.map((x) => x.label), ['オーガ', 'ゴブリン'], 'formation prefixes are stripped so one enemy is one row');
  assert.equal(s.biggestTaken.label, 'オーガ');
  assert.equal(s.biggestTaken.special, true);
});

test('battle report patch only reads engine output and adds one field to the result', () => {
  const src = fs.readFileSync(new URL('../js/patches/battleReport.js', import.meta.url), 'utf8');
  assert.match(src, /result\.battleReport = summarizeBattleReport/);
  assert.doesNotMatch(src, /state\.|localStorage|\.hp\s*[-+*]?=|events\.push/);
});

test('pursuit incident borrows an existing stage and the defense battle entry instead of adding its own', () => {
  const pursuit = SETTLEMENT_INCIDENTS.find((x) => x.kind === 'pursuit');
  assert.ok(pursuit, 'third archetype exists');
  assert.deepEqual([...new Set(SETTLEMENT_INCIDENTS.map((x) => x.kind))].sort(), ['archaeology', 'investigation', 'pursuit']);
  for (const key of ['waves', 'enemies', 'stageId', 'dropTable']) assert.equal(pursuit[key], undefined, `no authored ${key}`);
  assert.equal(pursuitRoundLimit(pursuit, { waves: [{ count: 4 }, { count: 3 }, { count: 2 }] }), 11);
  assert.ok(pursuitRoundLimit(pursuit, { waves: [] }) >= 3);
  const patch = fs.readFileSync(new URL('../js/patches/settlementIncidents.js', import.meta.url), 'utf8');
  assert.match(patch, /state\.prepareSettlementDefenseBattle = function prepareIncidentOrDefense/);
  assert.match(patch, /if \(base\?\.kind !== 'pursuit'\) return previousPrepareDefense\?\.call\(this, id\)/, 'defense incidents still reach the original handler');
  assert.match(patch, /return \{ \.\.\.stage, settlementDefenseIncidentId: id \}/, 'shared Stage data is copied, not mutated');
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.equal(main.match(/addEventListener\('settlement-[a-z]+-start'/g).length, 2, 'no new battle entry point in main.js');
});

test('beginner guide is derived from existing state and ends at the chapter 1 boss', () => {
  const ctx = (over = {}) => ({ cleared: (id) => (over.cleared || []).includes(id), equippedArmor: 0, maxEnhance: 0, healItems: 0, ...over, cleared: (id) => (over.cleared || []).includes(id) });
  const fresh = beginnerGuideProgress(ctx());
  assert.equal(fresh.active, true);
  assert.equal(fresh.next.id, 'first_clear');
  const mid = beginnerGuideProgress(ctx({ cleared: ['1-1'], equippedArmor: 2 }));
  assert.equal(mid.doneCount, 2);
  assert.equal(mid.next.id, 'enhance');
  assert.equal(beginnerGuideProgress(ctx({ cleared: ['1-1', '1-5'] })).active, false, 'veterans never see it, even with steps undone');
  for (const step of BEGINNER_GUIDE_STEPS) assert.match(step.target, /^go[A-Z]\w+Btn$/);
  const ui = fs.readFileSync(new URL('../js/patches/beginnerGuideUi.js', import.meta.url), 'utf8');
  assert.doesNotMatch(ui, /state\.save\(|state\.data\.[a-zA-Z0-9_.]+\s*=[^=]/, 'the guide writes nothing to the save');
});
