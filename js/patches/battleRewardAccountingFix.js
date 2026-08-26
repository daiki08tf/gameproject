/* ============================================================
   Debug Pass 2 — Battle reward accounting fix
   ------------------------------------------------------------
   Progression 2.0 split Character EXP from Job EXP. BattleEngine still
   consumed the legacy `gainExp().gained` field (Job-side gain) for kill
   result accounting, and used pre-state stage reward values for result UI.

   Keep progression math authoritative in state.gainExp()/gainGold(); this
   patch only makes BattleEngine's run totals/result payload reflect the values
   that were actually credited to persistent Character/Gold progression.
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';

function characterGainFrom(result, fallback = 0) {
  if (result && Number.isFinite(result.characterGained)) return result.characterGained;
  if (result && Number.isFinite(result.gained)) return result.gained;
  return Math.max(0, Number(fallback) || 0);
}

const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
if (typeof originalGrantKillRewards === 'function') {
  BattleEngine.prototype._grantKillRewards = function debugCharacterKillAccounting(enemy) {
    const beforeRunExp = Number(this.runExp) || 0;
    let capturedExpResult = null;
    const originalGainExp = state.gainExp;

    state.gainExp = function captureKillCharacterExp(...args) {
      const result = originalGainExp.apply(this, args);
      capturedExpResult = result;
      return result;
    };

    let result;
    try {
      result = originalGrantKillRewards.call(this, enemy);
    } finally {
      state.gainExp = originalGainExp;
    }

    if (!result || !capturedExpResult) return result;
    const characterGained = characterGainFrom(capturedExpResult, result.xp);

    // Original BattleEngine added the legacy Job-side `gained` to runExp.
    // Replace only this kill's contribution with actual Character EXP.
    this.runExp = beforeRunExp + characterGained;
    result.jobXp = result.xp;
    result.xp = characterGained;
    if (capturedExpResult.characterLeveledUp != null) {
      result.leveledUp = !!capturedExpResult.characterLeveledUp;
    }
    return result;
  };
}

const originalFinishBattle = BattleEngine.prototype._finishBattle;
if (typeof originalFinishBattle === 'function') {
  BattleEngine.prototype._finishBattle = function debugStageRewardAccounting(cleared, retreated) {
    // Kill rewards have already been accumulated before _finishBattle. Capture only
    // the stage-clear state writes performed synchronously inside the original.
    const killExp = Number(this.runExp) || 0;
    const killGold = Number(this.runGold) || 0;
    let stageCharacterExp = 0;
    let stageGold = 0;

    const originalGainExp = state.gainExp;
    const originalGainGold = state.gainGold;
    state.gainExp = function captureStageCharacterExp(...args) {
      const result = originalGainExp.apply(this, args);
      stageCharacterExp += characterGainFrom(result, 0);
      return result;
    };
    state.gainGold = function captureStageGold(...args) {
      const result = originalGainGold.apply(this, args);
      stageGold += Math.max(0, Number(result) || 0);
      return result;
    };

    try {
      originalFinishBattle.call(this, cleared, retreated);
    } finally {
      state.gainExp = originalGainExp;
      state.gainGold = originalGainGold;
    }

    if (this.finalResult) {
      this.finalResult.expGained = killExp + (cleared ? stageCharacterExp : 0);
      this.finalResult.goldGained = killGold + (cleared ? stageGold : 0);
    }
    return this.finalResult;
  };
}

/* ============================================================
   Enemy death invariant
   ------------------------------------------------------------
   Every damage route is supposed to converge on BattleEngine._applyRawDamage,
   but the game now has many patch layers (Fusion, companions, affixes, boss
   mechanics). A stale `hp <= 0 && dead === false` enemy is catastrophic in the
   text battle UI: it remains targetable with an empty HP bar and the encounter
   can never advance.

   Make HP=0 authoritative. Normal damage clamps HP to exactly zero, and a
   round-end reconciliation repairs any legacy/extension path that mutated HP
   without setting the death flag. Rewards are still guarded by the existing
   `_rewardsGranted` flag, so this cannot double-pay a kill.
   ============================================================ */
const originalApplyRawDamage = BattleEngine.prototype._applyRawDamage;
if (typeof originalApplyRawDamage === 'function') {
  BattleEngine.prototype._applyRawDamage = function enforceZeroHpDeath(enemy, dmg) {
    originalApplyRawDamage.call(this, enemy, dmg);
    if (!enemy || !Number.isFinite(enemy.hp)) return;
    if (enemy.hp <= 0) {
      enemy.hp = 0;
      if (!enemy.dead) {
        enemy.dead = true;
        this.defeated = (Number(this.defeated) || 0) + 1;
      }
    }
  };
}

BattleEngine.prototype._reconcileZeroHpEnemies = function reconcileZeroHpEnemies() {
  const repaired = [];
  for (const enemy of this.enemies || []) {
    if (!enemy || !Number.isFinite(enemy.hp) || enemy.hp > 0) continue;
    enemy.hp = 0;
    if (!enemy.dead) {
      enemy.dead = true;
      this.defeated = (Number(this.defeated) || 0) + 1;
      repaired.push(enemy.id || enemy.name || 'enemy');
    }
    if (!enemy._rewardsGranted && typeof this._grantKillRewards === 'function') {
      this._grantKillRewards(enemy);
    }
  }
  return repaired;
};

const originalAdvanceTurnForDeathInvariant = BattleEngine.prototype.advanceTurn;
if (typeof originalAdvanceTurnForDeathInvariant === 'function') {
  BattleEngine.prototype.advanceTurn = function reconcileDeathsAfterTurn(command) {
    const out = originalAdvanceTurnForDeathInvariant.call(this, command);
    const repaired = this._reconcileZeroHpEnemies();
    if (repaired.length && Array.isArray(out?.events)) {
      out.events.push({ type: 'deathInvariantRepair', enemyIds: repaired });
    }
    if (!out?.over && repaired.length && typeof this.checkBattleEnd === 'function') {
      const end = this.checkBattleEnd();
      if (end?.over) {
        out.over = true;
        out.result = this.finalResult;
      }
    }
    return out;
  };
}

export { characterGainFrom };
