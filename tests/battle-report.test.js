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

test('build diagnosis names what the fight and the gear actually did, and is display-only', async () => {
  const { classifyBuild, buildLabel, BUILD_ARCHETYPES } = await import('../js/data/buildDiagnosis.js');
  assert.equal(classifyBuild(null, []), null, 'no material, no label');
  const crit = classifyBuild({ dealt: 1000, kinds: { attack: 640, skill: 210, spell: 0, companion: 150, dot: 0 }, critRate: 0.38 }, [{ kind: 'critExtraAttack' }, { kind: 'critSpdBuff' }]);
  assert.equal(crit.primary.id, 'crit');
  assert.equal(buildLabel(classifyBuild({ dealt: 1000, kinds: { attack: 100, skill: 100, companion: 700, dot: 100 } }, [])), BUILD_ARCHETYPES.companion.name);
  assert.equal(classifyBuild(null, [{ kind: 'hitApplyDot' }, { kind: 'dotStackDmg' }]).primary.id, 'dot', 'gear alone is enough before any battle');
  // equipped-but-unused effects lose to what the battle actually shows
  const mixed = classifyBuild({ dealt: 1000, kinds: { attack: 50, skill: 0, spell: 900, companion: 50, dot: 0 }, critRate: 0 }, [{ kind: 'critAdd' }]);
  assert.equal(mixed.primary.id, 'spell');
  const src = fs.readFileSync(new URL('../js/data/buildDiagnosis.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /import .*state|localStorage|statMult|\.atk\s*[*+]?=/, 'a label never feeds back into stats or the save');
});

test('boss conditions: one readable condition per mortal chapter boss, paid once through existing rewards', async () => {
  const { bossConditionFor, evaluateBossCondition, bossConditionClaimId } = await import('../js/data/battleBossConditions.js');
  const { CHAPTERS } = await import('../js/data/stages.js');
  const { huntUniqueById } = await import('../js/data/huntUniques.js');
  const conds = CHAPTERS.slice(0, 15).map((ch) => bossConditionFor(ch.stages.find((s) => s.boss)));
  assert.ok(conds.every(Boolean));
  assert.ok(conds.every((c) => c.label.length > 0 && c.rewardText.length > 0), 'every condition is stated in words up front');
  assert.equal(new Set(conds.map((c) => c.type)).size, 4, 'all four condition kinds are used');
  const withUnique = conds.filter((c) => c.reward.itemId);
  assert.deepEqual(withUnique.map((c) => c.chapter), [4, 8, 12, 15], 'the last boss of each mortal region guarantees its regional unique');
  for (const c of withUnique) assert.ok(huntUniqueById(c.reward.itemId)?.regionId, 'reward is an existing regional Hunt Unique');
  assert.equal(new Set(withUnique.map((c) => c.type)).size > 1, true, 'region-ending bosses do not all share one condition');
  assert.equal(bossConditionFor(CHAPTERS[15].stages.find((s) => s.boss)), null, 'chapter 16+ is out of scope for now');
  assert.equal(bossConditionFor({ id: '1-2' }), null);
  const c1 = conds[0];
  assert.equal(evaluateBossCondition(c1, { rounds: c1.limit, itemsUsed: 9, hpRatio: 0, companionsDown: 3 }).met, true);
  assert.equal(evaluateBossCondition(c1, { rounds: c1.limit + 1, itemsUsed: 0, hpRatio: 1, companionsDown: 0 }).met, false);
  const runtime = fs.readFileSync(new URL('../js/patches/battleBossConditions.js', import.meta.url), 'utf8');
  assert.match(runtime, /state\.data\.claimedMilestones \|\|= \{\}/, 'claims live in the existing milestone table');
  assert.match(runtime, /if \(verdict\.met && !already\)/, 'the reward is granted only on the first achievement');
  assert.equal(bossConditionClaimId('1-5'), 'bosscond:1-5');
});

test('nemesis trail: a pursuit incident that exists only while a Nemesis is active and recurs per defeat', async () => {
  const { settlementIncidentEligible, settlementIncidentResolved, settlementIncidentResolveToken } = await import('../js/data/settlementIncidents.js');
  const trail = SETTLEMENT_INCIDENTS.find((x) => x.id === 'nemesisTrail');
  assert.equal(trail.kind, 'pursuit');
  assert.equal(settlementIncidentEligible(trail, { hall: 9 }), false, 'no Nemesis, no incident');
  const ctx = { hall: 9, nemesis: { id: 'b1', losses: 2 } };
  assert.equal(settlementIncidentEligible(trail, ctx), true);
  const token = settlementIncidentResolveToken(trail, ctx);
  assert.equal(settlementIncidentResolved(trail, token, ctx), true);
  assert.equal(settlementIncidentResolved(trail, token, { hall: 9, nemesis: { id: 'b1', losses: 3 } }), false, 'losing again reopens it');
  assert.equal(settlementIncidentResolved(trail, token, { hall: 9, nemesis: { id: 'b2', losses: 2 } }), false, 'a different Nemesis reopens it');
  // ordinary incidents are still once-only booleans
  const thief = SETTLEMENT_INCIDENTS.find((x) => x.id === 'nightThief');
  assert.equal(settlementIncidentResolveToken(thief, ctx), true);
  assert.equal(settlementIncidentResolved(thief, true, {}), true);
  const patch = fs.readFileSync(new URL('../js/patches/settlementIncidents.js', import.meta.url), 'utf8');
  assert.match(patch, /state\.applyNemesisEventFlag\?\.\(incident\.nemesisFlag\)/, 'the payoff goes through the existing Nemesis intel flag');
  assert.equal(trail.nemesisFlag, 'nemesisWeakness');
});

test('hunt chain: a session-only streak that scales the existing hunt launch options and never becomes a Hunt level', async () => {
  const { HUNT_LAYER, huntChainBonus } = await import('../js/data/balance.js');
  assert.deepEqual(huntChainBonus(0), { streak: 0, dropMult: 1, eliteAdd: 0, capped: false });
  assert.equal(huntChainBonus(99).streak, HUNT_LAYER.CHAIN_MAX);
  assert.ok(Math.abs(huntChainBonus(HUNT_LAYER.CHAIN_MAX).dropMult - (1 + HUNT_LAYER.CHAIN_DROP_PER_WIN * HUNT_LAYER.CHAIN_MAX)) < 1e-9);
  const src = fs.readFileSync(new URL('../js/patches/battleHuntChain.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /import .*state|localStorage|state\.data/, 'the streak is never saved');
  assert.match(src, /if \(!hunt\) \{ streak = 0;/, 'any non-hunt battle resets it');
  assert.match(src, /streak = result\?\.cleared \? Math\.min\(HUNT_LAYER\.CHAIN_MAX, streak \+ 1\) : 0;/, 'a loss or retreat resets only the multiplier');
});
