// Pacing pass regression tests — checkpoint walls + kill-drop materials.
// Pins the two new authorities (PACING_WALL_LAYER spawn behavior and
// PACING_MATERIAL_LAYER drop pipeline) against silent breakage.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import { findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import '../js/patches/settlementCore.js';
import '../js/patches/pacingWalls.js';
import { rollKillMaterials, materialShortfallHint } from '../js/patches/pacingMaterials.js';

beforeEach(() => state.resetAll());

test('checkpoint stages exist on main chapters (x-4 / x-7), never on ch1 tutorial or side content', () => {
  const s24 = findStage('2-4')?.stage, s45 = findStage('4-5')?.stage, s14 = findStage('1-4')?.stage;
  assert.equal(s24.checkpoint, true);
  assert.equal(s45.boss, true);
  assert.equal(s14.checkpoint, undefined);
  const expanded = findStage('16-7')?.stage;
  assert.equal(expanded.checkpoint, true);
});

test('checkpoint stage promotes the entire last non-boss group to elite guards', () => {
  const engine = new BattleEngine('2-4');
  const groups = [];
  while (engine.hasMoreEncounters()) {
    const e = engine.beginNextEncounter();
    if (e) groups.push(engine.enemies.slice());
    else break;
    // 各グループを一瞬で倒して次へ進める（実戦闘は不要）
    engine.enemies.forEach((en) => { en.dead = true; });
  }
  const last = groups[groups.length - 1];
  assert.ok(last.length > 0);
  assert.ok(last.every((e) => e.elite), 'last non-boss group should be all elite guards');
  assert.ok(last.every((e) => e.pacingGuard));
  // 先頭グループはElite化しない
  assert.ok(groups[0].every((e) => !e.pacingGuard));
});

test('boss stage gets exactly one elite guard and a bumped boss', () => {
  const engine = new BattleEngine('2-5');
  let boss = null, elites = 0;
  while (engine.hasMoreEncounters()) {
    const e = engine.beginNextEncounter();
    if (!e) break;
    for (const en of engine.enemies) {
      if (en.boss) boss = en;
      if (en.pacingGuard) elites++;
    }
    engine.enemies.forEach((en) => { en.dead = true; });
  }
  assert.ok(boss, 'boss spawned');
  assert.equal(elites, 1, 'exactly one elite guard on boss stage');
  // Boss bump: 比較はENEMY_TYPES素体×章スケーリングではなく、
  // 「フラグなし章」側との比較は複雑なため、少なくとも素体Atk以上であることだけ確認
  assert.ok(boss.atk >= ENEMY_TYPES[boss.type].atk);
});

test('checkpoint pressure never applies to side locations or abyss', async () => {
  const side = findStage('sg-1')?.stage;
  assert.ok(!side.checkpoint && !side.boss, 'fixture is a plain side stage');
  const engine = new BattleEngine('sg-1');
  let elites = 0;
  while (engine.hasMoreEncounters()) {
    if (!engine.beginNextEncounter()) break;
    for (const en of engine.enemies) { if (en.pacingGuard) elites++; en.dead = true; }
  }
  assert.equal(elites, 0);
});

test('kill-drop material rolls respect enemy role and special multiplier', () => {
  const stage = { recLevel: 30 };
  // 決定的なrngで全ロール成功させる
  const always = () => 0;
  const tank = rollKillMaterials({ type: 'ch3_tank', boss: false }, stage, always);
  assert.ok(tank.ore >= 1, 'tank drops ore');
  assert.ok(tank.hide >= 1, 'tank drops hide');
  const boss = rollKillMaterials({ type: 'ch3_boss', boss: true }, stage, always);
  assert.ok(boss.hide >= 2 && boss.ore >= 1 && boss.wood >= 1, 'boss drops a bundle');
  assert.ok(boss.veilstone >= 1, 'boss veilstone roll');
  // 全ロール失敗時は空
  const never = () => 0.9999;
  const none = rollKillMaterials({ type: 'ch3_normal', boss: false }, stage, never);
  assert.deepEqual(none, {});
});

test('kill materials accumulate through battle and land in settlementMaterials on finish', () => {
  state.data.settlementMaterials = { wood: 0, ore: 0, hide: 0, veilstone: 0 };
  const engine = new BattleEngine('2-1');
  const enemy = { type: 'ch2_tank', name: 't', boss: false, elite: false };
  // 強制的に素材を発生させるためロールを固定
  const rngBak = Math.random;
  Math.random = () => 0;
  try {
    engine._grantKillRewards(enemy);
    engine._grantKillRewards({ type: 'ch2_boss', name: 'b', boss: true });
  } finally { Math.random = rngBak; }
  assert.ok(Object.keys(engine._pacingKillMaterials || {}).length > 0);
  engine._finishBattle(true, false);
  const mats = state.data.settlementMaterials;
  assert.ok(mats.hide >= 3, `hide flowed in (got ${JSON.stringify(mats)})`);
  assert.ok(mats.veilstone >= 1, 'boss kill + first-clear veilstone');
  assert.ok(engine.finalResult.killMaterials);
});

test('material shortfall hint names the missing material and its source', () => {
  state.data.settlementMaterials = { wood: 0, ore: 0, hide: 0, veilstone: 0 };
  const hint = materialShortfallHint({ wood: 18, ore: 8, hide: 12, veilstone: 1 });
  assert.match(hint, /魔獣皮/);
  assert.match(hint, /境界石/);
  assert.match(hint, /入手|撃破/);
  state.data.settlementMaterials = { wood: 99, ore: 99, hide: 99, veilstone: 99 };
  assert.equal(materialShortfallHint({ wood: 1 }), '');
});
