/* ============================================================
   Progression 2.0 Phase 6 — Rune 2.0 special effects
   ============================================================ */

import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { getItem, rarityIndex } from '../data/equipment.js';
import { runesForStage } from '../data/runes2.js';
import { CAPS_LAYER } from '../data/balance.js';
import {
  challengeLevelForMarks,
  challengeEnemyHpMult,
  challengeEnemyAtkMult,
  challengeExpMult,
  challengeGoldMult,
  challengeRuneChanceMult,
  rollChallengeRuneAmount,
  greedRemovedRarityTiers,
  swiftInitiativeMult,
  fistsAttackIntervalMult,
} from '../data/rune2SpecialRules.js';

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
    if (random() < Math.min(1, rune.dropRate * chanceMult)) {
      const amount = rollChallengeRuneAmount(challenge, random);
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
  return legacyExpMult.call(this) * challengeExpMult(state.rune2ChallengeLevel());
};

const legacyGoldMult = BattleEngine.prototype._goldMult;
BattleEngine.prototype._goldMult = function rune2ChallengeGoldMult() {
  return legacyGoldMult.call(this) * challengeGoldMult(state.rune2ChallengeLevel());
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
