/* ============================================================
   Progression 2.0 Phase 6 — Rune 2.0 special effects
   ============================================================ */

import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { getItem, rarityIndex } from '../data/equipment.js';
import { runesForStage, rune2Power } from '../data/runes2.js';
import { CAPS_LAYER } from '../data/balance.js';
import {
  challengeLevelForMarks,
  challengeEnemyHpMult,
  challengeEnemyAtkMult,
  challengeExpMult,
  challengeGoldMult,
  challengeRuneChanceMult,
  greedRemovedRarityTiers,
  swiftInitiativeMult,
  fistsAttackIntervalMult,
} from '../data/rune2SpecialRules.js';

const activePower = (id) => rune2Power(id, state.rune2ActiveMarks?.(id) || 0);
const sumActivePower = (...ids) => ids.reduce((sum, id) => sum + activePower(id), 0);

state.rune2ChallengeLevel = function rune2ChallengeLevel() {
  return challengeLevelForMarks(this.rune2ActiveMarks?.('challenge') || 0);
};

state.rune2GreedTier = function rune2GreedTier() {
  return greedRemovedRarityTiers(this.rune2ActiveMarks?.('greed') || 0);
};

state.rune2ObserveMarks = function rune2ObserveMarks() {
  return this.rune2ActiveMarks?.('observe') || 0;
};

state.rollRune2DropForStage = function rollRune2DropForStagePhase6(stageId, random = Math.random) {
  const results = [];
  const challenge = this.rune2ChallengeLevel();
  const chanceMult = challengeRuneChanceMult(challenge);
  for (const rune of runesForStage(stageId)) {
    // The first real drop unlocks the Rune. Once discovered, its levels come
    // from the Blacksmith rather than repeated random drops.
    if (this.data.rune2Discovered?.[rune.id]) continue;
    if (random() < Math.min(1, rune.dropRate * chanceMult)) {
      const amount = 1;
      this.addRune2Marks(rune.id, amount);
      results.push({ id: rune.id, amount, owned: this.rune2OwnedMarks(rune.id), challenge });
    }
  }
  return results;
};

const legacySpawnEnemy = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function rune2ChallengeSpawn(type) {
  const enemy = legacySpawnEnemy.call(this, type);
  const lv = state.rune2ChallengeLevel();
  if (lv <= 0) return enemy;
  enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * challengeEnemyHpMult(lv)));
  enemy.hp = enemy.maxHp;
  enemy.atk = Math.max(1, Math.round(enemy.atk * challengeEnemyAtkMult(lv)));
  enemy.challengeLevel = lv;
  return enemy;
};

const legacyExpMult = BattleEngine.prototype._expMult;
BattleEngine.prototype._expMult = function rune2ChallengeExpMult() {
  const runeBonus = sumActivePower('insight', 'purge', 'branch_point');
  return legacyExpMult.call(this) * challengeExpMult(state.rune2ChallengeLevel()) * (1 + runeBonus);
};

const legacyGoldMult = BattleEngine.prototype._goldMult;
BattleEngine.prototype._goldMult = function rune2ChallengeGoldMult() {
  const runeBonus = sumActivePower('gold', 'prosperity', 'purge', 'branch_point');
  return legacyGoldMult.call(this) * challengeGoldMult(state.rune2ChallengeLevel()) * (1 + runeBonus);
};

const legacyEffectiveCritPct = BattleEngine.prototype._effectiveCritPct;
BattleEngine.prototype._effectiveCritPct = function rune2EffectiveCritPct() {
  const bonusPoints = sumActivePower('hawkeye', 'critical_eye') * 100;
  return Math.min(CAPS_LAYER.CRIT_PCT_MAX, legacyEffectiveCritPct.call(this) + bonusPoints);
};

const legacyEffectiveEvasion = BattleEngine.prototype._effectiveEvasion;
BattleEngine.prototype._effectiveEvasion = function rune2EffectiveEvasion() {
  return Math.min(CAPS_LAYER.EVASION_MAX, legacyEffectiveEvasion.call(this) + activePower('windfoot'));
};

const legacyEffectiveArmorPen = BattleEngine.prototype._effectiveArmorPen;
BattleEngine.prototype._effectiveArmorPen = function rune2EffectiveArmorPen() {
  return Math.min(CAPS_LAYER.ARMOR_PEN_MAX, legacyEffectiveArmorPen.call(this) + activePower('piercing'));
};

const legacyMainDmgMult = BattleEngine.prototype._mainDmgMult;
BattleEngine.prototype._mainDmgMult = function rune2MainDmgMult(sourceKind) {
  return legacyMainDmgMult.call(this, sourceKind) + sumActivePower('fierce_strike', 'purge', 'branch_point');
};

const legacyCritDamageBoostMult = BattleEngine.prototype._critDamageBoostMult;
BattleEngine.prototype._critDamageBoostMult = function rune2CritDamageBoostMult() {
  return legacyCritDamageBoostMult.call(this) + activePower('critical_edge');
};

const legacyBossDmgMult = BattleEngine.prototype._bossDmgMult;
BattleEngine.prototype._bossDmgMult = function rune2BossDmgMult(target) {
  return legacyBossDmgMult.call(this, target) + activePower('slayer');
};

const legacyDropChanceBonusMult = BattleEngine.prototype._dropChanceBonusMult;
BattleEngine.prototype._dropChanceBonusMult = function rune2DropChanceBonusMult() {
  return legacyDropChanceBonusMult.call(this) * (1 + sumActivePower('fate', 'fortune_find', 'branch_point'));
};

const legacyEnemyStat = BattleEngine.prototype._effectiveEnemyStat;
BattleEngine.prototype._effectiveEnemyStat = function rune2EnemyStat(enemy, stat) {
  const value = legacyEnemyStat.call(this, enemy, stat);
  return stat === 'spd' ? value * (1 - activePower('gale')) : value;
};

const legacyDebuffPowerMult = BattleEngine.prototype._debuffPowerMult;
BattleEngine.prototype._debuffPowerMult = function rune2DebuffPowerMult() {
  return legacyDebuffPowerMult.call(this) * (1 + activePower('break_ward'));
};

const legacyEnemyAttackDamage = BattleEngine.prototype._enemyAttackDamage;
BattleEngine.prototype._enemyAttackDamage = function rune2EnemyAttackDamage(atk, opts = {}) {
  let mult = 1 - activePower('guardian');
  if (this.player.guarding) mult *= 1 - activePower('bastion');
  if (opts.mult != null) mult *= 1 - activePower('illusion');
  return Math.max(1, Math.round(legacyEnemyAttackDamage.call(this, atk, opts) * mult));
};

const legacyAfterRoundChecks = BattleEngine.prototype._afterRoundChecks;
BattleEngine.prototype._afterRoundChecks = function rune2AfterRoundChecks() {
  const result = legacyAfterRoundChecks.call(this);
  const regen = sumActivePower('bless', 'regeneration');
  if (!result.over && regen > 0 && this.player.hp > 0 && this.player.hp < this.player.maxHp) {
    const before = this.player.hp;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(1, Math.round(this.player.maxHp * regen)));
    const amount = Math.round(this.player.hp - before);
    if (amount > 0) result.events.push({ type:'runeRegen', amount });
  }
  return result;
};

const legacyRollWeaponDrop = BattleEngine.prototype._rollWeaponDrop;
BattleEngine.prototype._rollWeaponDrop = function rune2WeaponReroll(dropCtx) {
  const first = legacyRollWeaponDrop.call(this, dropCtx);
  if (first || Math.random() >= activePower('collector')) return first;
  return legacyRollWeaponDrop.call(this, dropCtx);
};

const legacyRollManastone = BattleEngine.prototype._rollManastone;
BattleEngine.prototype._rollManastone = function rune2RollManastone(enemy) {
  const base = legacyRollManastone.call(this, enemy);
  if (!base) return 0;
  const bonus = Math.round(base * sumActivePower('craft', 'alchemy'));
  if (bonus > 0) state.addManastone(bonus);
  return base + bonus;
};

const legacyRollDrop = BattleEngine.prototype._rollDrop;
BattleEngine.prototype._rollDrop = function rune2GreedRollDrop(dropCtx) {
  const removedTiers = state.rune2GreedTier();
  const original = this.stage.dropTable;
  if (!removedTiers || !Array.isArray(original) || original.length === 0) return legacyRollDrop.call(this, dropCtx);

  const itemEntries = original.filter((d) => getItem(d.itemId));
  if (itemEntries.length === 0) return legacyRollDrop.call(this, dropCtx);
  const ranks = [...new Set(itemEntries.map((d) => rarityIndex(getItem(d.itemId).rarity)).filter((v) => v >= 0))].sort((a, b) => a - b);
  const keepRank = ranks[Math.min(removedTiers, Math.max(0, ranks.length - 1))] ?? ranks[0];
  const filtered = original.filter((d) => {
    const item = getItem(d.itemId);
    return !item || rarityIndex(item.rarity) >= keepRank;
  });

  this.stage.dropTable = filtered.length ? filtered : original;
  try { return legacyRollDrop.call(this, dropCtx); }
  finally { this.stage.dropTable = original; }
};

const legacyEffectiveSpd = BattleEngine.prototype._effectiveSpd;
BattleEngine.prototype._effectiveSpd = function rune2SwiftEffectiveSpd() {
  return legacyEffectiveSpd.call(this) * swiftInitiativeMult(state.rune2ActiveMarks?.('swift') || 0);
};

const legacyAttackCooldown = BattleEngine.prototype._playerAttackCooldown;
BattleEngine.prototype._playerAttackCooldown = function rune2FistsCooldown() {
  return Math.max(
    CAPS_LAYER.ATTACK_INTERVAL_MIN,
    legacyAttackCooldown.call(this) * fistsAttackIntervalMult(state.rune2ActiveMarks?.('fists') || 0),
  );
};

export { challengeLevelForMarks };
