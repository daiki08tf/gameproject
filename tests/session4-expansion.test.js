// Session 4 — Story × Monster Companions × Player Skill Tree:
//   - 外伝「獣径」(7 Stage + 確定Rare遭遇 + 名付き番獣 DENLORD)
//   - Rare / Roamer / Elite 個体が「倒した姿のまま」仲間になる
//     （inheritedTraits + 出自別rarity下限 + regen/lifesteal特性）
//   - 旅人星盤：職業非依存の恒久Skill Tree（SP導出・前提・無料リセット）
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { CHAPTERS, findStage, isChapterUnlocked, isAbyssUnlocked, finalStageOf } from '../js/data/stages.js';
import { COMPANION_SPECIES, companionTraitEffect, COMPANION_RARITY } from '../js/data/companions.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE, ROAMER_COMPANION_IDS } from '../js/data/monsterRanchSpecies.js';
import { PLAYER_SKILL_TREE, playerTreeNode } from '../js/data/playerSkillTree.js';

// companionFoundationはimport時にUIをinstallするので、node:test用の
// 最小限のdocumentスタブを立ててから動的importで読み込む。
const el = () => ({ id: '', className: '', innerHTML: '', dataset: {}, appendChild() {}, insertBefore() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], style: {} });
const registry = new Map();
globalThis.document ??= {
  querySelector: () => null, querySelectorAll: () => [],
  getElementById: id => registry.get(id) || (registry.set(id, el()), registry.get(id)),
  createElement: el, createTextNode: () => ({}),
  body: { insertBefore() {}, appendChild() {} }, head: { appendChild() {} },
};

const { resolveRecruitCandidate } = await import('../js/patches/companionRecruitment.js');
await import('../js/patches/companionFoundation.js');
await import('../js/patches/companionSynergy.js');
await import('../js/patches/monsterRanchCore.js');
await import('../js/patches/playerSkillTree.js');
const lastInstance = () => Object.values(state.data.companionInstances || {}).at(-1);

function fresh() { state.data = state.defaultData ? state.defaultData() : { ...state.data, stageProgress: {}, jobs: {}, companionInstances: [], playerSkillTree: [] }; }
const cleared = id => state.isStageCleared(id);

// ---- 外伝 獣径 ---------------------------------------------------------------

test('獣径は7 Stageで構成され findStage が全て解決する', () => {
  const chapter = CHAPTERS.find(ch => ch.id === 'gaiden_beasttrail');
  assert.ok(chapter, 'gaiden chapter must exist');
  assert.equal(chapter.gaiden, true);
  assert.equal(chapter.stages.length, 7);
  for (const s of chapter.stages) {
    const found = findStage(s.id);
    assert.equal(found?.stage.id, s.id, `${s.id} must resolve via findStage`);
    assert.equal(found?.chapter.id, 'gaiden_beasttrail');
  }
});

test('獣径は2-5クリアで解放され本編進行・Abyss解禁に干渉しない', () => {
  fresh();
  const idx = CHAPTERS.findIndex(ch => ch.id === 'gaiden_beasttrail');
  assert.ok(idx > 0);
  assert.equal(isChapterUnlocked(idx, cleared), false, 'locked before 2-5');
  state.data.stageProgress['2-5'] = { cleared: true };
  assert.equal(isChapterUnlocked(idx, cleared), true, 'unlocks after 2-5');
  // Abyss解禁はgaidenを条件に含めない：ch25までの最終Stageだけが問われる
  fresh();
  for (const ch of CHAPTERS.filter(c => c.num <= 25 && !c.gaiden)) state.data.stageProgress[finalStageOf(ch).id] = { cleared: true };
  assert.equal(isAbyssUnlocked(cleared), true);
});

test('bt-2以降に確定Rare遭遇、bt-7に勧誘可能な番獣がいる', () => {
  const chapter = CHAPTERS.find(ch => ch.id === 'gaiden_beasttrail');
  for (const s of chapter.stages.slice(1)) {
    const rareWave = s.waves.find(w => ENEMY_TYPES[w.type]?.rareIdentity);
    assert.ok(rareWave, `${s.id} must carry a guaranteed rare-identity wave`);
  }
  const finale = chapter.stages.at(-1);
  assert.ok(finale.boss, 'finale is the chapter boss stage');
  const denlord = ENEMY_TYPES.bt_denlord;
  assert.ok(denlord, 'bt_denlord enemy type exists');
  assert.equal(denlord.boss, undefined, 'denlord must stay non-boss so it can be recruited');
  assert.equal(denlord.rareIdentity, true);
  assert.ok(finale.waves.some(w => w.type === 'bt_denlord'));
});

// ---- Rare / Roamer / Denlord → companion ------------------------------------

test('Rare・Roamer・番獣が勧誘マップに登録されている', () => {
  assert.ok(RANCH_RECRUIT_BY_ENEMY_TYPE.ch5_rare, 'regional rare species');
  assert.equal(RANCH_RECRUIT_BY_ENEMY_TYPE.bt_denlord, 'bt_denlord');
  for (const speciesId of ROAMER_COMPANION_IDS) {
    const species = COMPANION_SPECIES[speciesId];
    assert.ok(species, `${speciesId} species exists`);
    assert.equal(RANCH_RECRUIT_BY_ENEMY_TYPE[species.enemyType], speciesId, `${species.enemyType} recruits ${speciesId}`);
  }
  assert.ok(ROAMER_COMPANION_IDS.length >= 5);
});

test('倒した個体の出自でrarity下限とoriginが決まり特性が継承される', () => {
  fresh();
  state.data.magicite = 0;
  const roamer = resolveRecruitCandidate({ speciesId: 'roamer_gilt_maw', enemyType: 'roamer:gilt_maw', name: 'x', chance: 1, roamerId: 'gilt_maw', rareBehaviorName: '狩人' });
  assert.equal(roamer.accepted, true);
  const inst = lastInstance();
  assert.ok(COMPANION_RARITY.indexOf(inst.rarity) >= COMPANION_RARITY.indexOf('epic'), 'roamer recruits at epic floor');
  assert.equal(inst.origin, 'roamerRecruit');
  assert.ok(inst.inheritedTraits.includes('狩人'), 'rare behavior survives recruitment');

  const rare = resolveRecruitCandidate({ speciesId: 'ch5_rare', enemyType: 'ch5_rare', name: 'x', chance: 1, rankRare: true, eliteAffixName: '再生' });
  assert.equal(rare.accepted, true);
  const inst2 = lastInstance();
  assert.ok(COMPANION_RARITY.indexOf(inst2.rarity) >= COMPANION_RARITY.indexOf('rare'), 'rare recruits at rare floor');
  assert.equal(inst2.origin, 'rareRecruit');
  assert.ok(inst2.inheritedTraits.includes('再生'), 'elite affix survives recruitment');
});

test('継承特性は既存の特性語彙（regen/lifesteal/initiativeSpd等）で機能する', () => {
  for (const name of ['再生', '吸命', '狩人', '鉄壁', '迅速', '急襲', '狂乱', '窮地']) {
    assert.ok(companionTraitEffect(name), `${name} must map to a trait effect`);
  }
  assert.equal(companionTraitEffect('再生').kind, 'regen');
  assert.equal(companionTraitEffect('吸命').kind, 'lifesteal');
});

// ---- 旅人星盤 -----------------------------------------------------------------

test('旅人星盤は4分岐+根の実ツリーで前提チェーンを持つ', () => {
  const branches = new Set(PLAYER_SKILL_TREE.map(n => n.branch));
  for (const b of ['root', 'blade', 'aegis', 'beast', 'hunt']) assert.ok(branches.has(b), `${b} branch`);
  assert.ok(PLAYER_SKILL_TREE.length >= 19);
  assert.ok(PLAYER_SKILL_TREE.filter(n => n.kind === 'keystone').length >= 4, 'each branch has a keystone');
  assert.ok(PLAYER_SKILL_TREE.every(n => n.branch === 'root' || n.requires.length > 0), 'every non-root node has prerequisites');
  assert.ok(PLAYER_SKILL_TREE.every(n => n.requires.every(r => playerTreeNode(r))), 'all prerequisites resolve');
});

test('SPは章ボス撃破+最高職業Lvから導出され購入・前提・無料リセットが機能する', () => {
  fresh();
  assert.equal(state.playerTreeEarned(), 0);
  state.data.jobs.warrior = { level: 25, xp: 0 };
  state.data.stageProgress['1-5'] = { cleared: true };
  assert.equal(state.playerTreeEarned(), 3, '1 boss + floor(25/10)');
  // rootが前提
  assert.equal(state.playerTreeNodeStatus('wt_blade_edge').canBuy, false, 'edge requires root');
  assert.equal(state.buyPlayerTreeNode('wt_root'), true);
  assert.equal(state.buyPlayerTreeNode('wt_blade_edge'), true);
  assert.equal(state.buyPlayerTreeNode('wt_blade_crit'), true, 'chain purchase with 3 SP');
  assert.equal(state.playerTreeAvailable(), 0);
  assert.equal(state.buyPlayerTreeNode('wt_blade_opener'), false, 'no SP left');
  // 無料リセット
  assert.equal(state.resetPlayerTree(), true);
  assert.equal(state.playerTreeAvailable(), 3);
  assert.equal(state.playerTreeSpent(), 0);
});

test('旅人星盤の効果はステータス・仲間・巡回のcanonical stateに効く', () => {
  fresh();
  state.data.jobs.warrior = { level: 100, xp: 0 };
  for (let i = 0; i < 10; i++) state.data.stageProgress[`${i + 1}-5`] = { cleared: true };
  const base = state.getStats();
  // 背水の刃（ATK+18%/DEF-10% keystone）まで買う
  for (const id of ['wt_root', 'wt_blade_edge', 'wt_blade_crit', 'wt_blade_opener', 'wt_blade_keystone']) assert.ok(state.buyPlayerTreeNode(id), `buy ${id}`);
  const after = state.getStats();
  assert.ok(after.atk > base.atk * 1.15, 'keystone atk applies via getStats');
  assert.ok(after.def < base.def, 'keystone def tradeoff applies');
  // 獣・狩ブランチの集計経路
  for (const id of ['wt_beast_bond', 'wt_beast_pack', 'wt_beast_scent', 'wt_beast_raise', 'wt_beast_keystone', 'wt_hunt_tracker']) assert.ok(state.buyPlayerTreeNode(id), `buy ${id}`);
  const comp = state.playerTreeCompanionBonuses();
  assert.ok(comp.atkMult > 1.13, 'companion atk mult stacks');
  assert.ok(comp.takenMult < 0.85, 'keystone taken mult applies');
  assert.ok(comp.expMult > 1.1, 'exp mult applies');
  const hunt = state.playerTreeHuntBonuses();
  assert.ok(hunt.recruitChanceBonus > 0, 'recruit bonus feeds rollRecruitCandidate');
  assert.ok(hunt.dropMultBonus > 0, 'drop mult bonus feeds _rollDrop');
});

test('旅人星盤は既存セーブ互換（購入配列だけを既存root下に持つ）', () => {
  fresh();
  assert.deepEqual(state.data.playerSkillTree, []);
  state.data.jobs.warrior = { level: 20, xp: 0 };
  assert.ok(state.buyPlayerTreeNode('wt_root'));
  assert.deepEqual(state.data.playerSkillTree, ['wt_root']);
  // 古いセーブ（フィールド欠損）は自動初期化される
  delete state.data.playerSkillTree;
  assert.equal(state.playerTreeAvailable() >= 0, true);
  assert.deepEqual(state.data.playerSkillTree, []);
});
