// Session 3 — Discovery & Rare Content:
//   - Hunt Uniques（巡回/Rare/Eliteの固有ドロップ）
//   - Roamer（名もなき強敵）の出現・固有戦利品・Codex記録
//   - 巡回EliteへのElite Affix割当
//   - 呪い巡回（Cursed Hunt）のリスク/リターン乗算
//   - 匂い袋（item_lure）の出現率底上げ
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import { findStage } from '../js/data/stages.js';
import { getItem, allItems } from '../js/data/equipment.js';
import { HUNT_UNIQUES, huntUniquesForChapter, huntUniqueById } from '../js/data/huntUniques.js';
import { ROAMERS, pickRoamerForChapter, roamersForChapter, roamerTemplate } from '../js/data/roamers.js';
import { enemy2EcologyIdentity } from '../js/data/enemyCodex2Discovery.js';
import { ENEMY3_ELITE_AFFIXES } from '../js/data/enemy3EliteAffixes.js';
import { HUNT_LAYER } from '../js/data/balance.js';

function fresh() { state.data = state.defaultData ? state.defaultData() : state.data; }
function withRandom(fn, value) {
  const orig = Math.random;
  Math.random = () => value;
  try { return fn(); } finally { Math.random = orig; }
}

// ---- Hunt Uniques --------------------------------------------

test('Hunt Uniquesは装備カタログに登録され全て固有効果を持つ', () => {
  assert.ok(HUNT_UNIQUES.length >= 8);
  for (const item of HUNT_UNIQUES) {
    assert.equal(getItem(item.id), item, `${item.id} must resolve via getItem`);
    assert.equal(item.unique, true);
    assert.ok(item.effects?.length > 0, `${item.id} must carry a build-defining effect`);
    assert.ok(Array.isArray(item.huntChapters), `${item.id} needs a chapter range`);
  }
  // 全アイテムがallItems()（図鑑・装備一覧）に含まれる
  const ids = new Set(allItems().map(i => i.id));
  for (const item of HUNT_UNIQUES) assert.ok(ids.has(item.id));
});

test('huntUniquesForChapterは章レンジで候補を絞る', () => {
  const early = huntUniquesForChapter(3).map(i => i.id);
  assert.ok(early.includes('uq_hunt_bloodmist_knife'));
  assert.ok(!early.includes('uq_hunt_void_fang'), 'Ch3にCh16+の固有は出ない');
  const late = huntUniquesForChapter(30);
  assert.ok(late.length >= 3);
});

// ---- Roamers ---------------------------------------------------

test('Roamerは章条件で解禁され、章に応じてスケーリングする', () => {
  assert.equal(roamersForChapter(1).length, 0, 'Ch1にはRoamerが出ない');
  assert.ok(roamersForChapter(5).includes('gilt_maw'));
  assert.ok(roamersForChapter(15).includes('null_chant'));
  const low = roamerTemplate('gilt_maw', 3);
  const high = roamerTemplate('gilt_maw', 15);
  assert.ok(high.hp > low.hp && high.atk > low.atk, 'Roamer stats scale with chapter');
  for (const def of Object.values(ROAMERS)) {
    assert.ok(huntUniqueById(def.dropItemId), `${def.id} drop must be a hunt unique`);
    assert.ok(def.dropChance > 0 && def.dropChance <= 1);
  }
});

test('巡回中の非BossスロットがまれにRoamerへ差し替わる（1体/バトル）', () => {
  fresh();
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 0 });
  const orig = HUNT_LAYER.ROAMER_CHANCE;
  HUNT_LAYER.ROAMER_CHANCE = 1;
  try {
    const e = eng._spawnEnemy('grunt');
    assert.ok(e.roamerId, 'forced roll must produce a roamer');
    assert.equal(e.rareIdentity, true);
    const second = eng._spawnEnemy('grunt');
    assert.ok(!second.roamerId, 'roamer is capped at one per battle');
  } finally { HUNT_LAYER.ROAMER_CHANCE = orig; }
});

test('RoamerはStory（非巡回）戦闘では出ない', () => {
  fresh();
  const eng = new BattleEngine('2-1');
  const orig = HUNT_LAYER.ROAMER_CHANCE;
  HUNT_LAYER.ROAMER_CHANCE = 1;
  try {
    const e = eng._spawnEnemy('grunt');
    assert.ok(!e.roamerId);
  } finally { HUNT_LAYER.ROAMER_CHANCE = orig; }
});

test('Roamer撃破は固有戦利品＋必落装備を抽選する', () => {
  fresh();
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 0 });
  const roamer = { roamerId: 'gilt_maw', rank: 'rare', rareIdentity: true, boss: false, elite: false };
  const drops = withRandom(() => eng._rollChaseDrops(roamer, { depth: 0 }), 0.01);
  const names = drops.map(d => d.itemId);
  assert.ok(names.includes('uq_hunt_slayer_sigil'), 'roamer should drop its carried unique');
  // Rare枠：必落の装備ドロップも積まれる
  assert.ok(drops.length >= 2);
});

test('RoamerはCodex生態記録で徘徊者として識別される', () => {
  const id = enemy2EcologyIdentity({ roamerId: 'null_chant', type: 'roamer:null_chant', name: '名を持たぬ詠唱者・NULL CHANT' });
  assert.equal(id.kind, 'roamer');
  assert.equal(id.key, 'roamer:null_chant');
});

// ---- Chase drops / Elite affixes -------------------------------

test('Rare撃破は必ず装備を1つ落とし、固有抽選を持つ', () => {
  fresh();
  const eng = new BattleEngine('2-1');
  const rare = { rank: 'rare', rareIdentity: true, boss: false, elite: false };
  // random=0.5: 固有抽選(0.15)は外れるが必落装備だけは出る
  const drops = withRandom(() => eng._rollChaseDrops(rare, { depth: 0 }), 0.5);
  assert.ok(drops.length >= 1, 'rare kill must always grant the guaranteed equipment roll');
  // random=0.01: 固有抽選(0.15)に当たる
  const lucky = withRandom(() => eng._rollChaseDrops(rare, { depth: 0 }), 0.01);
  assert.ok(lucky.some(d => HUNT_UNIQUES.some(u => u.id === d.itemId)), 'rare kill can drop a hunt unique');
});

test('巡回EliteはElite Affix（再生/狂乱/鉄壁/迅速）を持つ', () => {
  fresh();
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 1 });
  const e = eng._spawnEnemy('grunt');
  assert.equal(e.elite, true);
  assert.ok(e.enemy3EliteAffixId && ENEMY3_ELITE_AFFIXES[e.enemy3EliteAffixId], 'hunt elite must carry an affix');
});

test('巡回Elite撃破は固有装備を一定率で落とす', () => {
  fresh();
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 1 });
  const elite = { elite: true, boss: false };
  const drops = withRandom(() => eng._rollChaseDrops(elite, { depth: 0 }), 0.01);
  assert.ok(drops.some(d => HUNT_UNIQUES.some(u => u.id === d.itemId)));
  const unlucky = withRandom(() => eng._rollChaseDrops(elite, { depth: 0 }), 0.99);
  assert.equal(unlucky.length, 0);
});

// ---- Cursed Hunt ------------------------------------------------

test('呪い巡回は被ダメージ・ドロップ・Elite密度を同時に変える', () => {
  fresh();
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 0.2, dropMult: 1.5, cursed: true });
  assert.equal(eng.stage.cursed, true);
  assert.equal(eng.stage.dropMult, 1.5 * HUNT_LAYER.CURSED_DROP_BONUS);
  assert.ok(Math.abs(eng.stage.huntEliteChance - (0.2 + HUNT_LAYER.CURSED_ELITE_BONUS)) < 1e-9);
  // 被ダメージ乗算（同一stateなので倍率比較で検証）
  const normal = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 0.2 });
  const a = eng._enemyAttackDamage(100);
  const b = normal._enemyAttackDamage(100);
  assert.ok(a / b > 1.2, `cursed should raise damage taken (got ${a} vs ${b})`);
});

// ---- Lure ------------------------------------------------------

test('匂い袋はRoamer出現率を上げ、共有Stageデータを汚染しない', () => {
  fresh();
  state.data.inventory.item_lure = 1;
  const eng = new BattleEngine('2-1', null, { hunt: true, huntEliteChance: 0 });
  const before = HUNT_LAYER.ROAMER_CHANCE;
  const result = eng._playerUseItem('item_lure');
  assert.equal(result.lured, true);
  assert.equal(eng._lureBonus, HUNT_LAYER.ROAMER_LURE_BONUS);
  assert.ok(eng._lureBonus > before);
  // 共有StageのencounterPoolは変化していないこと
  const shared = findStage('2-1').stage.encounterPool;
  if (shared && eng.stage.encounterPool) {
    assert.equal(shared.rareChance + HUNT_LAYER.LURE_RARE_BONUS, eng.stage.encounterPool.rareChance);
    assert.equal(findStage('2-1').stage.encounterPool.rareChance, shared.rareChance);
  }
  assert.equal(state.consumableCount('item_lure'), 0, 'item is consumed');
});
