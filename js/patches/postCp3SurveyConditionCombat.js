/* ============================================================
   Post-CP3 Vertical Extension V2 — Survey Condition combat bridge
   ------------------------------------------------------------
   Thin runtime hooks only. No persisted combat stack/resource is introduced.
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { stageIdForActiveDeepSurveyCondition } from '../data/postCp3SurveyConditions.js';

const MARK = Symbol.for('bladeVale.postCp3SurveyConditionCombat');

if (!BattleEngine.prototype[MARK]) {
  BattleEngine.prototype[MARK] = true;

  const originalSpawnEnemy = BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy = function(type) {
    const enemy = originalSpawnEnemy.call(this, type);
    const fx = this.stage?.deepSurveyConditionEffects;
    if (!fx) return enemy;

    const hpMult = Number(fx.enemyHpMult) || 1;
    const atkMult = Number(fx.enemyAtkMult) || 1;
    const speedMult = Number(fx.enemySpeedMult) || 1;
    if (hpMult !== 1) {
      enemy.hp = Math.max(1, Math.round(enemy.hp * hpMult));
      enemy.maxHp = enemy.hp;
    }
    if (atkMult !== 1) enemy.atk = Math.max(1, Math.round(enemy.atk * atkMult));
    if (speedMult !== 1) enemy.spd = Math.max(1, Math.round(enemy.spd * speedMult));

    // 精鋭連鎖: do not set enemy.elite because the existing kill path awards
    // Abyss Shards for true elites. This is authored Deep Survey combat pressure,
    // not a new source of an Abyss currency.
    if (!enemy.boss && Number(fx.elitePressure) > 0 && ((this._nextEnemyId || 0) % 3 === 0)) {
      enemy.hp = Math.max(1, Math.round(enemy.hp * 1.18));
      enemy.maxHp = enemy.hp;
      enemy.atk = Math.max(1, Math.round(enemy.atk * 1.12));
      enemy.deepSurveyElitePressure = true;
    }

    const bossInterval = Number(fx.bossTechniqueIntervalMult) || 1;
    if (enemy.boss && bossInterval < 1) {
      for (const key of ['slamTurns','chargeTurns','projectileTurns','summonTurns']) {
        if (enemy[key] != null) enemy[key] = Math.max(1, Math.round(enemy[key] * bossInterval));
      }
    }
    return enemy;
  };

  const originalEnemyDamage = BattleEngine.prototype._enemyAttackDamage;
  BattleEngine.prototype._enemyAttackDamage = function(atk, opts = {}) {
    let damage = originalEnemyDamage.call(this, atk, opts);
    const fx = this.stage?.deepSurveyConditionEffects;
    if (!fx) return damage;

    if (this.player?.guarding) this._deepSurveyDirectPressureStacks = 0;
    const stacks = Math.max(0, Number(this._deepSurveyDirectPressureStacks) || 0);
    const perAction = Math.max(0, Number(fx.directPressurePerAction) || 0);
    if (stacks && perAction) damage *= 1 + stacks * perAction;

    const perRound = Math.max(0, Number(fx.longFightPressurePerRound) || 0);
    const maxLong = Math.max(0, Number(fx.longFightPressureMax) || 0);
    if (perRound && maxLong) {
      const bonus = Math.min(maxLong, Math.max(0, (Number(this.round) || 1) - 1) * perRound);
      damage *= 1 + bonus;
    }
    return Math.max(1, Math.round(damage));
  };

  const originalPlayerAction = BattleEngine.prototype.performPlayerAction;
  BattleEngine.prototype.performPlayerAction = function(action) {
    const fx = this.stage?.deepSurveyConditionEffects;
    if (fx) {
      const actionType = String(action?.type || '');
      if (actionType === 'guard') this._deepSurveyDirectPressureStacks = 0;
      else if (['attack','skill','spell'].includes(actionType) && Number(fx.directPressurePerAction) > 0) {
        const cap = Math.max(1, Number(fx.directPressureMaxStacks) || 1);
        this._deepSurveyDirectPressureStacks = Math.min(cap, (Number(this._deepSurveyDirectPressureStacks) || 0) + 1);
      }

      // 記録飽和: switching among attack/skill/spell or deliberately guarding
      // breaks repetition. Guard remains useful without becoming mandatory.
      if (actionType === 'guard' && Number(fx.repeatedActionPenalty) > 0) {
        this._deepSurveyLastActionType = 'guard';
        this._deepSurveyRepeatCount = 0;
        this._deepSurveyRepeatDamagePenalty = 0;
      } else if (Number(fx.repeatedActionPenalty) > 0 && ['attack','skill','spell'].includes(actionType)) {
        if (this._deepSurveyLastActionType === actionType) this._deepSurveyRepeatCount = (Number(this._deepSurveyRepeatCount) || 0) + 1;
        else this._deepSurveyRepeatCount = 0;
        this._deepSurveyLastActionType = actionType;
        const step = Number(fx.repeatedActionPenalty) || 0;
        const cap = Number(fx.repeatedActionPenaltyMax) || step;
        this._deepSurveyRepeatDamagePenalty = Math.min(cap, this._deepSurveyRepeatCount * step);
      } else if (['attack','skill','spell'].includes(actionType)) {
        this._deepSurveyRepeatDamagePenalty = 0;
      }
    }
    return originalPlayerAction.call(this, action);
  };

  const originalCalculateDamage = BattleEngine.prototype.calculateDamage;
  BattleEngine.prototype.calculateDamage = function(...args) {
    const result = originalCalculateDamage.apply(this, args);
    const penalty = Math.max(0, Math.min(0.5, Number(this._deepSurveyRepeatDamagePenalty) || 0));
    if (!penalty || !result || !Number.isFinite(result.damage)) return result;
    return { ...result, damage: Math.max(1, Math.round(result.damage * (1 - penalty))) };
  };

  const originalMpCost = BattleEngine.prototype._effectiveMpCost;
  BattleEngine.prototype._effectiveMpCost = function(tech) {
    const base = originalMpCost.call(this, tech);
    const mult = Math.max(1, Number(this.stage?.deepSurveyConditionEffects?.mpCostMult) || 1);
    return Math.max(0, Math.round(base * mult));
  };

  const originalStartTelegraph = BattleEngine.prototype._startBossTelegraph;
  BattleEngine.prototype._startBossTelegraph = function(enemy, kind, phaseMult, justPhased) {
    const result = originalStartTelegraph.call(this, enemy, kind, phaseMult, justPhased);
    const mult = Number(this.stage?.deepSurveyConditionEffects?.bossTechniqueIntervalMult) || 1;
    if (mult < 1) {
      const key = kind === 'slam' ? 'slamTurns' : kind === 'charge' ? 'chargeTurns' : kind === 'projectile' ? 'projectileTurns' : null;
      if (key && enemy[key] != null) enemy[key] = Math.max(1, Math.round(enemy[key] * mult));
    }
    return result;
  };
}

const SCREEN_MARK = Symbol.for('bladeVale.postCp3SurveyConditionScreenStart');
if (!TextBattleScreen.prototype[SCREEN_MARK]) {
  TextBattleScreen.prototype[SCREEN_MARK] = true;
  const originalStart = TextBattleScreen.prototype.start;
  TextBattleScreen.prototype.start = function(stageId, onEnd, blessingId) {
    return originalStart.call(this, stageIdForActiveDeepSurveyCondition(stageId), onEnd, blessingId);
  };
}
