// Session 6 — World Exploration × Monster Mastery × Loot Evolution:
//   - 8 探索地点（sideLocation章）の登録・解放条件・参照整合・進行非混入
//   - Species Mastery（種族熟練）の境界値と恩恵キャップ
//   - Codex 2.0 収集の里程標（一回限りの受け取り）
//   - 仲間号令（1戦闘各1回・そのターン限り）
//   - Roamer 覚醒の絆ゲート
//   - Boss phase profiles（sd_warden / 再臨Denlord / Arc VII）
//   - 探索地点ドロップ品質補正の上限
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { CHAPTERS, findStage, isChapterUnlocked, finalStageOf } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { getRune } from '../js/data/runes.js';
import { getCompanionSpecies } from '../js/data/companions.js';
import { nextStageAfter } from '../js/data/resultNextStage.js';
import { SIDE_LOCATION_CHAPTERS, sideLocationVisible } from '../js/data/sideLocations.js';
import { SPECIES_MASTERY, speciesMasteryLevelFor, speciesMasteryKillXp } from '../js/data/speciesMastery.js';
import { COLLECTION_MILESTONES } from '../js/data/collectionMilestones.js';
import { pushCompanionMemory, COMPANION_MEMORY_MAX } from '../js/data/companionMemory.js';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';
import { COMPANION_ORDERS } from '../js/patches/companionBattle.js';
import { BattleEngine } from '../js/battleEngine.js';

// state.defaultData は公開されていないため、本テストが触るキーだけ明示的に
// 初期化する（additive save fields — 存在しないこと自体が初期状態）。
function fresh() {
  state.data.stageProgress = {};
  state.data.speciesMastery = {};
  state.data.claimedMilestones = {};
  state.data.monsterCodex = {};
  state.data.companionInstances = {};
  state.data.companionParty = [];
  state.data.gold = 0;
  state.data.manastone = 0;
}

// companionFoundation.js はDOM依存でテストからimportできないため、
// getCompanion/activeCompanions の最小stubを用意してから依存patchを
// 動的importする（wrapは定義済み関数にのみ乗るため順序が効く）。
function installCompanionStubs() {
  if (!state.getCompanion) {
    state.getCompanion = function getCompanionStub(id) {
      const inst = this.data.companionInstances?.[id];
      if (!inst) return null;
      const species = getCompanionSpecies(inst.speciesId);
      if (!species) return null;
      return { id, species, instance: inst, stats: { hp: 60, mp: 12, atk: 10, def: 8, mag: 6, spd: 8 } };
    };
  }
  if (!state.activeCompanions) {
    state.activeCompanions = function activeCompanionsStub() {
      return (this.data.companionParty || []).map(id => this.getCompanion(id)).filter(Boolean);
    };
  }
  if (!state.activeCompanionIds) {
    state.activeCompanionIds = function activeCompanionIdsStub() {
      return (this.data.companionParty || []).filter(id => id && this.data.companionInstances?.[id]);
    };
  }
}

let patchesReady = null;
function installPatches() {
  if (patchesReady) return patchesReady;
  installCompanionStubs();
  patchesReady = (async () => {
    await import('../js/patches/codexFoundation.js');
    await import('../js/patches/companionBond.js');
    await import('../js/patches/companionEvolution.js');
    await import('../js/patches/speciesMastery.js');
  })();
  return patchesReady;
}

// ---- 探索地点 --------------------------------------------------

test('Session6: eight side locations are registered as non-progression chapters', () => {
  assert.equal(SIDE_LOCATION_CHAPTERS.length, 8);
  for (const ch of SIDE_LOCATION_CHAPTERS) {
    const idx = CHAPTERS.findIndex(c => c.id === ch.id);
    assert.ok(idx >= 0, `${ch.id} must be registered in CHAPTERS`);
    assert.equal(ch.sideLocation, true);
    assert.equal(ch.gaiden, true, `${ch.id} keeps the gaiden flag so main progression/Abyss gates ignore it`);
    assert.ok(ch.unlocksAfter, `${ch.id} needs an authored unlock beat`);
    assert.ok(findStage(ch.unlocksAfter)?.stage, `${ch.id} unlocksAfter '${ch.unlocksAfter}' must resolve`);
    for (const s of ch.stages) assert.equal(findStage(s.id)?.stage.id, s.id);
  }
});

test('Session6: side locations unlock only from their authored beat, hidden ones stay invisible until then', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS) {
    const idx = CHAPTERS.findIndex(c => c.id === ch.id);
    const cleared = id => id === ch.unlocksAfter;
    assert.equal(isChapterUnlocked(idx, cleared), true, `${ch.id} unlocks after ${ch.unlocksAfter}`);
    assert.equal(isChapterUnlocked(idx, () => false), false);
    if (ch.poiKind === 'hidden') {
      assert.equal(sideLocationVisible(ch, () => isChapterUnlocked(idx, () => false)), false, `${ch.id} must stay hidden before unlock`);
      assert.equal(sideLocationVisible(ch, () => true), true);
    } else {
      assert.equal(sideLocationVisible(ch, () => false), true, `${ch.id} is visible even before unlock`);
    }
  }
});

test('Session6: side locations never chain into or from main-story stage progression', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS) {
    for (const s of ch.stages) assert.equal(nextStageAfter(s), null, `${s.id} must not chain (side content is self-contained)`);
  }
  // Session 7でArc VIII（ch42-45）が続いたため、終端Bossはnum45側。
  // num41のBossは42-1へ繋がるのが正しい連鎖。
  const lastMainBoss = CHAPTERS.find(c => c.num === 45).stages.find(s => s.boss);
  assert.equal(nextStageAfter(lastMainBoss), null);
});

test('Session6: side-location stage refs resolve — enemies, equipment, runes', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS) {
    for (const s of ch.stages) {
      for (const wave of s.waves) assert.ok(ENEMY_TYPES[wave.type], `${s.id} wave type '${wave.type}' missing from ENEMY_TYPES`);
      for (const drop of s.dropTable || []) assert.ok(getItem(drop.itemId) || getRune(drop.itemId), `${s.id} dropTable '${drop.itemId}' must resolve`);
      if (s.firstClear?.itemId) assert.ok(getItem(s.firstClear.itemId) || getRune(s.firstClear.itemId), `${s.id} firstClear '${s.firstClear.itemId}' must resolve`);
      if (s.encounterPool) {
        for (const entry of [...s.encounterPool.types, ...(s.encounterPool.rareTypes || [])]) {
          assert.ok(ENEMY_TYPES[entry.type], `${s.id} pool type '${entry.type}' missing`);
        }
      }
    }
  }
});

// ---- Species Mastery --------------------------------------------

test('Session6: species mastery curve reaches Lv5 at 200xp and benefits stay bounded', () => {
  assert.equal(speciesMasteryLevelFor(0), 0);
  assert.equal(speciesMasteryLevelFor(8), 1);
  assert.equal(speciesMasteryLevelFor(24), 2);
  assert.equal(speciesMasteryLevelFor(56), 3);
  assert.equal(speciesMasteryLevelFor(110), 4);
  assert.equal(speciesMasteryLevelFor(200), 5);
  assert.equal(speciesMasteryLevelFor(99999), 5);
  // Lv5が上限なので恩恵は自動的に頭打ちになる（勧誘+20% / 仲間能力+7.5%）
  assert.ok(SPECIES_MASTERY.RECRUIT_BONUS_PER_LEVEL * SPECIES_MASTERY.MAX_LEVEL <= .20 + 1e-9, 'recruit bonus must stay within +20%');
  assert.ok(SPECIES_MASTERY.STAT_MULT_PER_LEVEL * SPECIES_MASTERY.MAX_LEVEL <= .075 + 1e-9, 'stat mult stays within +7.5%');
});

test('Session6: kill and recruit feed species mastery through the existing codex hooks', async () => {
  await installPatches();
  fresh();
  const enemy = { type: 'ch2_normal', rank: 'normal', name: 'test' };
  state.markCodexKill(enemy, null);
  let entry = state.speciesMasteryEntry('ch2_normal_companion');
  assert.equal(entry.kills, 1);
  assert.equal(entry.exp, speciesMasteryKillXp(enemy));
  state.markCodexRecruit('ch2_normal', 'normal');
  entry = state.speciesMasteryEntry('ch2_normal_companion');
  assert.equal(entry.recruits, 1);
  assert.equal(entry.exp, speciesMasteryKillXp(enemy) + SPECIES_MASTERY.RECRUIT_XP);
  assert.equal(state.speciesMasteryRecruitBonus('ch2_normal_companion'), entry.level * SPECIES_MASTERY.RECRUIT_BONUS_PER_LEVEL);
});

test('Session6: boss-type enemies do not feed species mastery', async () => {
  await installPatches();
  fresh();
  state.markCodexKill({ type: 'sd_warden', boss: true }, null);
  assert.equal(state.speciesMasterySummary().length, 0, 'hidden boss must not create a mastery entry');
});

// ---- Collection Milestones --------------------------------------

test('Session6: collection milestones report progress and pay out exactly once', async () => {
  await installPatches();
  fresh();
  const rows = state.collectionMilestones();
  assert.equal(rows.length, COLLECTION_MILESTONES.length);
  assert.ok(rows.every(r => r.progress >= 0 && !r.claimed));
  const locked = rows.find(r => !r.done);
  if (locked) assert.equal(state.claimCollectionMilestone(locked.id), null);
  const explore = COLLECTION_MILESTONES.find(m => /探索|踏破/.test(m.name + m.desc));
  if (explore) {
    for (const ch of SIDE_LOCATION_CHAPTERS.slice(0, explore.target)) {
      state.data.stageProgress[finalStageOf(ch).id] = { cleared: true };
    }
    const before = state.data.gold + (state.data.manastone || 0);
    const row = state.claimCollectionMilestone(explore.id);
    assert.ok(row, 'exploration milestone must be claimable once its target clears');
    const after = state.data.gold + (state.data.manastone || 0);
    assert.ok(after > before, 'claim must pay out');
    assert.equal(state.claimCollectionMilestone(explore.id), null, 'second claim must be rejected');
  }
});

// ---- Companion Orders -------------------------------------------

test('Session6: companion orders are once-per-battle and reject without living companions', () => {
  fresh();
  const eng = new BattleEngine('1-1');
  // Session 7 で絆ゲート付き号令（protect/rally/charge）が追加された。
  assert.deepEqual(Object.keys(COMPANION_ORDERS).sort(), ['brace', 'charge', 'focus', 'protect', 'rally', 'unleash']);
  assert.equal(eng.issueCompanionOrder('focus'), false, 'no companions → reject');
  assert.equal(eng.issueCompanionOrder('bogus'), false, 'unknown order → reject');
});

test('Session6: a used order stays spent for the battle but resets on a new engine', () => {
  installCompanionStubs();
  fresh();
  state.data.companionInstances['t1'] = { id: 't1', speciesId: 'slime', level: 5, rarity: 'normal', nature: 'balanced' };
  state.data.companionParty = ['t1'];
  const eng = new BattleEngine('1-1');
  assert.equal(eng.issueCompanionOrder('brace'), true);
  assert.equal(eng.issueCompanionOrder('brace'), false, 'same battle reuse must fail');
  const eng2 = new BattleEngine('1-1');
  assert.equal(eng2.issueCompanionOrder('brace'), true, 'new battle resets order availability');
});

// ---- Roamer Awakening -------------------------------------------

test('Session6: roamer awakenings are bond-gated and do not fire under Bond Lv5', async () => {
  await installPatches();
  fresh();
  state.data.companionInstances['r1'] = { id: 'r1', speciesId: 'roamer_gilt_maw', level: 30, rarity: 'epic' };
  state.data.companionParty = ['r1'];
  const info = state.companionEvolutionInfo('r1');
  assert.ok(info, 'roamer must have an awakening path');
  assert.equal(info.bondLevel, 5);
  assert.equal(info.levelOk, true);
  assert.equal(info.bondOk, false, 'Bond Lv1 must not satisfy the awakening gate');
  assert.equal(info.canEvolve, false);
  state.data.companionInstances['r1'].bondLevel = 5;
  const ready = state.companionEvolutionInfo('r1');
  assert.equal(ready.canEvolve, true, 'Lv26+/rare+/Bond5 must satisfy awakening');
});

// ---- Boss Phases -------------------------------------------------

test('Session6: hidden warden and prestige denlords carry authored phase profiles', () => {
  const warden = bossEncounterProfile('sd_warden');
  assert.ok(warden, 'sd_warden profile must exist');
  assert.equal(warden.phases.length, 3);
  assert.ok(warden.counterHint);
  for (const type of ['bt_denlord', 'tp_denlord', 'af_denlord']) {
    const p = bossEncounterProfile(type);
    assert.ok(p?.phases?.length >= 1, `${type} prestige profile must define at least one phase`);
    assert.ok(p.counterHint, `${type} must expose a counter hint`);
  }
  const arc7 = bossEncounterProfile('ch41_boss');
  assert.ok(arc7?.phases?.length >= 2, 'Arc VII finale boss must be phased');
});

// ---- Companion Memory --------------------------------------------

test('Session6: companion memory is capped, deduped, and flavor-only', () => {
  const inst = {};
  for (let i = 0; i < COMPANION_MEMORY_MAX + 3; i++) pushCompanionMemory(inst, `記憶${i}`);
  assert.equal(inst.memories.length, COMPANION_MEMORY_MAX, 'memory cap must hold');
  pushCompanionMemory(inst, inst.memories[0]);
  assert.equal(inst.memories.length, COMPANION_MEMORY_MAX, 'duplicate memory must not grow the list');
  assert.equal(inst.memories.filter(m => m === inst.memories[0]).length, 1);
});

// ---- Loot --------------------------------------------------------

test('Session6: side-location drop bonuses stay inside the bounded loot bonus', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS) {
    for (const s of ch.stages) {
      if (s.dropAffixBonus) {
        assert.ok(s.dropAffixBonus > 0 && s.dropAffixBonus <= .15, `${s.id} bonus must stay within the +.15 cap`);
      }
    }
  }
});
