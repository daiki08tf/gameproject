// Hunt（巡回）モード — Session 2 の Story/Hunt 棲み分け。
// クリア済みStageの再挑戦は launchOpts 経由で「Elite出現率＋ドロップ倍率」
// を持つ Stage コピーとして走る。ここではその発火条件と、元Stageデータを
// 汚染しないことを検証する（Stage・報酬・敵生成はすべて既存 authority）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import { findStage, CHAPTERS } from '../js/data/stages.js';
import { ABYSS_EXPANSION_LAYER, HUNT_LAYER, ECONOMY } from '../js/data/balance.js';

function fresh() { state.data = state.defaultData ? state.defaultData() : state.data; }

test('launchOpts.hunt でElite化・報酬倍率・dropMultが有効になる', () => {
  fresh();
  const eng = new BattleEngine('1-1', null, { hunt: true, huntEliteChance: 1, dropMult: 2 });
  assert.equal(eng.stage.hunt, true);
  assert.equal(eng.stage.huntEliteChance, 1);
  const e = eng._spawnEnemy('grunt');
  assert.equal(e.elite, true);
  const normal = new BattleEngine('1-1')._spawnEnemy('grunt');
  assert.equal(e.hp, Math.round(normal.hp * ABYSS_EXPANSION_LAYER.ELITE_HP_MULT));
  assert.equal(e.xp, Math.round(normal.xp * ABYSS_EXPANSION_LAYER.ELITE_REWARD_MULT));
});

test('Hunt なしではEliteは出ず、元Stageデータも汚染されない', () => {
  fresh();
  new BattleEngine('1-1', null, { hunt: true, huntEliteChance: 1, dropMult: 9 });
  const found = findStage('1-1');
  assert.equal(found.stage.hunt, undefined, 'shared stage data must not be mutated');
  const eng2 = new BattleEngine('1-1');
  assert.equal(eng2.stage.hunt, undefined);
  const e = eng2._spawnEnemy('grunt');
  assert.equal(e.elite, false);
});

test('BossはHuntでもElite化しない（ボス曲線は別系統）', () => {
  fresh();
  const eng = new BattleEngine('1-5', null, { hunt: true, huntEliteChance: 1, dropMult: 2 });
  const boss = eng._spawnEnemy('boss_orcking');
  assert.equal(boss.boss, true);
  assert.equal(boss.elite, false);
});

test('HuntのdropMultがロール確率に乗る（実測の差分で検証）', () => {
  fresh();
  // _rollDrop を多数回呼んでドロップ発生率の差を検証する代わりに、
  // 抽選式そのものが stage.dropMult を参照することを実値で確認する。
  // 1-1 の dropTable は空でないため、dropMult=999 で必落にできる。
  const eng = new BattleEngine('1-1', null, { hunt: true, huntEliteChance: 0, dropMult: 999 });
  const drop = eng._rollDrop();
  assert.ok(drop, 'dropMult should make the drop roll effectively guaranteed');
  const eng2 = new BattleEngine('1-1');
  assert.equal(eng2.stage.dropMult, undefined);
});

test('AbyssではlaunchOpts.huntが無効（別軸のElite/drop系を保護）', () => {
  fresh();
  const eng = new BattleEngine('abyss-1', null, { hunt: true, huntEliteChance: 1, dropMult: 5 });
  assert.equal(eng.stage.hunt, undefined);
});
