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

export { characterGainFrom };
