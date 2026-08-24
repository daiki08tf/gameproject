/* ============================================================
   System Cleanup + Awakening 2.0 compatibility layer
   - 旧・武器ソケットRuneを完全無効化し、Rune 2.0へ一本化
   - 旧・覚醒ツリーの数値バフとJob Lvリセットを停止
   - 覚醒を「実績到達 → 上位機能解放」へ再定義
   - 旧セーブは破壊せず、旧Runeはarchiveへ退避
   ============================================================ */
import { state } from '../state.js';
import { getArtifact } from '../data/artifacts.js';
import { EQUIPMENT_LAYER, AWAKENED_EQUIP_LAYER } from '../data/balance.js';
import { AWAKENING_V2_RANKS, awakeningRankDef, evaluateAwakeningRequirements, SYSTEM_ROLE_MAP } from '../data/awakeningMilestones.js';

function ensureCleanupData() {
  if (!state.data.systemMigration || typeof state.data.systemMigration !== 'object') state.data.systemMigration = {};
  if (!state.data.legacyRuneArchive || typeof state.data.legacyRuneArchive !== 'object') state.data.legacyRuneArchive = {};

  // 旧覚醒回数は「既に進めた実績」を捨てず、最大Rank3まで初期移行する。
  if (!Number.isFinite(state.data.awakeningV2Rank)) {
    const old = Math.max(0, Math.floor(Number(state.data.awakenings) || 0));
    state.data.awakeningV2Rank = old >= 6 ? 3 : old >= 3 ? 2 : old >= 1 ? 1 : 0;
  }
  state.data.awakeningV2Rank = Math.max(0, Math.min(AWAKENING_V2_RANKS.length, Math.floor(state.data.awakeningV2Rank)));

  if (!state.data.systemMigration.legacyWeaponRunesRetired) {
    // inventoryに残っている旧Runeをarchiveへ移す。
    for (const [id, count] of Object.entries(state.data.inventory || {})) {
      if (!id.startsWith('rune_') || id.startsWith('rune2_')) continue;
      const n = Math.max(0, Math.floor(Number(count) || 0));
      if (n) state.data.legacyRuneArchive[id] = (state.data.legacyRuneArchive[id] || 0) + n;
      delete state.data.inventory[id];
    }
    // ソケット済みRuneもarchiveへ戻してからソケットを空にする。
    for (const sockets of Object.values(state.data.runeSockets || {})) {
      if (!Array.isArray(sockets)) continue;
      for (const id of sockets) {
        if (!id) continue;
        state.data.legacyRuneArchive[id] = (state.data.legacyRuneArchive[id] || 0) + 1;
      }
    }
    state.data.runeSockets = {};
    state.data.systemMigration.legacyWeaponRunesRetired = true;
  }

  // 旧覚醒ポイント・ツリーはセーブ互換のため残すが、現行計算には使わない。
  state.data.systemMigration.awakeningV2 = true;
  state.save();
}

ensureCleanupData();

state.systemRoles = SYSTEM_ROLE_MAP;
state.awakeningV2Ranks = AWAKENING_V2_RANKS;
state.awakeningV2Rank = function awakeningV2Rank() {
  ensureCleanupData();
  return this.data.awakeningV2Rank;
};
state.awakeningV2Context = function awakeningV2Context() {
  const owned = this.data.rune2Owned || {};
  return {
    characterLevel: Math.max(1, Number(this.characterLevel ?? this.currentLevel) || 1),
    masteredJobs: Array.isArray(this.data.mastered) ? this.data.mastered.length : 0,
    abyssDepth: Math.max(0, Math.floor(Number(this.data.abyssBestDepth) || 0)),
    rune2OwnedTotal: Object.values(owned).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0),
    isStageCleared: (id) => this.isStageCleared(id),
  };
};
state.awakeningV2Progress = function awakeningV2Progress(rank = this.awakeningV2Rank() + 1) {
  const def = awakeningRankDef(rank);
  const evaluated = evaluateAwakeningRequirements(def, this.awakeningV2Context());
  return { def, ...evaluated };
};
state.canClaimAwakeningV2 = function canClaimAwakeningV2() {
  const nextRank = this.awakeningV2Rank() + 1;
  if (nextRank > AWAKENING_V2_RANKS.length) return false;
  return this.awakeningV2Progress(nextRank).met;
};
state.claimAwakeningV2 = function claimAwakeningV2() {
  if (!this.canClaimAwakeningV2()) return false;
  this.data.awakeningV2Rank += 1;
  // 旧依存コードのため値だけ同期する。Job Lvリセットは一切しない。
  this.data.awakenings = this.data.awakeningV2Rank;
  this.save();
  return this.data.awakeningV2Rank;
};

// ---- 旧覚醒ツリーをゲーム計算から切り離す ----
state.awakeningStatMult = function awakeningStatMultRetired() { return 1; };
state.awakeningBossDmgMult = function awakeningBossDmgMultRetired() { return 1; };
state.awakeningUnownedBiasChance = function awakeningUnownedBiasChanceRetired() { return 0; };
state.awakeningStartLevel = function awakeningStartLevelRetired() { return 1; };
state.canBuyAwakeningNode = function canBuyAwakeningNodeRetired() { return false; };
state.buyAwakeningNode = function buyAwakeningNodeRetired() { return false; };
state.canAwaken = function canAwakenV2Compat() { return this.canClaimAwakeningV2(); };
state.awakenPreviewPoints = function awakenPreviewV2Compat() { return 0; };
state.awaken = function awakenV2Compat() { return this.claimAwakeningV2(); };

// ---- 旧装備Runeを完全停止 ----
state.getRuneSockets = function legacyRuneSocketsRetired() { return []; };
state.socketRune = function legacyRuneSocketRetired() { return false; };
state.unsocketRune = function legacyRuneUnsocketRetired() { return false; };
state.craftRune = function legacyRuneCraftRetired() { return false; };

// ---- 覚醒Rankを既存の上位機能のゲートとして再利用 ----
state.artifactSlotCount = function artifactSlotCountV2() {
  return Math.min(3, this.awakeningV2Rank());
};
state.isAwakeningFeatureUnlocked = function isAwakeningFeatureUnlocked(feature) {
  const rank = this.awakeningV2Rank();
  const gates = {
    awakenedEquipment: 1,
    artifact: 1,
    extremeAffix: 2,
    relic: 3,
    abyssAscension: 4,
  };
  return rank >= (gates[feature] || 99);
};

// 旧「覚醒ポイント」は廃止されたため、装備の目覚めはRank1解放後に魔石を使う。
// これで新規プレイヤーも旧覚醒を経由せず上位装備育成を進められる。
state.awakenWeaponCost = function awakenWeaponCostV2(rank) {
  return 20 + Math.max(0, Math.floor(Number(rank) || 0)) * 15;
};
state.canAwakenWeapon = function canAwakenWeaponV2(itemId) {
  if (!this.isAwakeningFeatureUnlocked('awakenedEquipment')) return false;
  if (this.weaponEnhanceLevel(itemId) < AWAKENED_EQUIP_LAYER.REQUIRE_ENHANCE_LEVEL) return false;
  const rank = this.weaponAwakenedRank(itemId);
  if (rank >= AWAKENED_EQUIP_LAYER.MAX_RANK) return false;
  return (this.data.manastone || 0) >= this.awakenWeaponCost(rank);
};
state.awakenWeapon = function awakenWeaponV2(itemId) {
  if (!this.canAwakenWeapon(itemId)) return false;
  const rank = this.weaponAwakenedRank(itemId);
  this.data.manastone -= this.awakenWeaponCost(rank);
  this.data.awakenedWeapons[itemId] = rank + 1;
  this.save();
  return true;
};

state.artifactUnlockCostV2 = function artifactUnlockCostV2() {
  const n = Array.isArray(this.data.unlockedArtifacts) ? this.data.unlockedArtifacts.length : 0;
  return { gold: 1500 + n * 1750, manastone: 30 + n * 15 };
};
state.canUnlockArtifact = function canUnlockArtifactV2(id) {
  if (this.isArtifactUnlocked(id)) return false;
  const artifact = getArtifact(id);
  if (!artifact) return false;
  const isRelic = !!artifact.kind;
  if (isRelic && !this.isAwakeningFeatureUnlocked('relic')) return false;
  if (!isRelic && !this.isAwakeningFeatureUnlocked('artifact')) return false;
  const cost = this.artifactUnlockCostV2();
  return (this.data.gold || 0) >= cost.gold && (this.data.manastone || 0) >= cost.manastone;
};
state.unlockArtifact = function unlockArtifactV2(id) {
  if (!this.canUnlockArtifact(id)) return false;
  const cost = this.artifactUnlockCostV2();
  this.data.gold -= cost.gold;
  this.data.manastone -= cost.manastone;
  this.data.unlockedArtifacts.push(id);
  this.save();
  return true;
};

// DOM上の旧Rune導線も消す。blacksmith.js自体は互換のため残す。
const legacyRuneTab = document.querySelector('#blacksmithScreen [data-tab="rune"]');
if (legacyRuneTab) legacyRuneTab.remove();

export { ensureCleanupData };
