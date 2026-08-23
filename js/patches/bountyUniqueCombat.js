/* ============================================================
   Bounty Unique Combat
   - ユニーク武器はAffix抽選を行わない固定個体
   - 賞金首初回討伐で対応ユニークを確定入手
   - ユニーク固有効果と賞金首固有ギミックをBattleEngineへ接続
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { bountyUniqueById, uniqueForBounty } from '../data/uniqueEquipment.js';

function passive(engine, kind) {
  return engine.effects.find(e => e && e.trigger === 'passive' && e.kind === kind) || null;
}

const originalAddItem = state.addItem.bind(state);
state.addItem = function addItemWithUniqueRule(itemId, qty = 1, dropCtx = null) {
  const unique = bountyUniqueById(itemId);
  if (!unique) return originalAddItem(itemId, qty, dropCtx);
  const wasOwned = this.ownsItem(itemId);
  // ユニークは固定個体。ランダムAffix個体IDを発行しない。
  this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + qty;
  this.data.itemLocked[itemId] = true;
  this.save();
  return !wasOwned;
};

const originalCanSell = state.canSellOrDismantle.bind(state);
state.canSellOrDismantle = function uniqueCannotBeDestroyed(itemId, qty = 1) {
  if (bountyUniqueById(itemId)) return false;
  return originalCanSell(itemId, qty);
};

const originalGetStats = state.getStats.bind(state);
state.getStats = function getStatsWithUniqueRules() {
  const stats = originalGetStats();
  const weapon = bountyUniqueById(this.data.equipped.weapon);
  if (weapon) {
    const penalty = (weapon.effects || []).find(e => e.kind === 'defPenalty');
    if (penalty) stats.def = Math.max(1, Math.round(stats.def * (1 - penalty.power)));
  }
  return stats;
};

// ---------- Bounty base scaling ----------
const BOUNTY_SCALE = {
  'bounty-redfang-varg':   { hp:1.45, atk:1.25, def:1.10, spd:1.10 },
  'bounty-ash-knight':     { hp:1.70, atk:1.30, def:1.35, spd:0.95 },
  'bounty-fallen-oracle':  { hp:1.80, atk:1.50, def:1.15, spd:1.10 },
  'bounty-crownless':      { hp:2.05, atk:1.60, def:1.25, spd:1.20 },
  'bounty-omega-zero':     { hp:2.50, atk:1.75, def:1.45, spd:1.25 },
};
const originalSpawnEnemy = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function bountySpawnEnemy(type) {
  const enemy = originalSpawnEnemy.call(this, type);
  const scale = BOUNTY_SCALE[this.stage && this.stage.id];
  if (!scale || !enemy) return enemy;
  enemy.hp = enemy.maxHp = Math.round(enemy.maxHp * scale.hp);
  enemy.atk = Math.round(enemy.atk * scale.atk);
  enemy.def = Math.round(enemy.def * scale.def);
  enemy.spd = Math.round(enemy.spd * scale.spd);
  enemy.xp = Math.round(enemy.xp * Math.max(1, scale.hp * 0.8));
  enemy.gold = Math.round(enemy.gold * Math.max(1, scale.hp * 0.7));
  return enemy;
};

// ---------- Unique combat effects ----------
const originalPlayerAttack = BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack = function bountyUniquePlayerAttack(targetId) {
  const highHp = passive(this, 'highHpDoubleAttack');
  const shouldDouble = !!(highHp && this.player.maxHp > 0 && this.player.hp / this.player.maxHp >= highHp.threshold);
  const previousDouble = this._berserkerDoubleAttack;
  if (shouldDouble) this._berserkerDoubleAttack = true;

  const star = passive(this, 'spellArmsStarStrike');
  const armed = !!this._bountyStarStrikeArmed && !!star;
  const target = this._pickTarget(targetId);
  const result = originalPlayerAttack.call(this, targetId);
  this._berserkerDoubleAttack = previousDouble;

  if (armed && target && !target.dead) {
    const { damage } = this.calculateDamage(this._effectiveMag() * star.magRatio, target, { noBossMult: false });
    const kill = this._applyRawDamageAndReward(target, damage);
    result.uniqueStarStrike = { damage, targetName: target.name, targetDead: target.dead, kill };
  }
  if (armed) this._bountyStarStrikeArmed = false;
  return result;
};

const originalTechnique = BattleEngine.prototype._playerTechnique;
BattleEngine.prototype._playerTechnique = function bountyUniqueTechnique(kind, techId, targetId) {
  const result = originalTechnique.call(this, kind, techId, targetId);
  if (kind === 'spell' && !result.blocked && passive(this, 'spellArmsStarStrike')) this._bountyStarStrikeArmed = true;
  return result;
};

const originalCalculateDamage = BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage = function bountyUniqueDamage(atk, target, opts = {}) {
  const out = originalCalculateDamage.call(this, atk, target, opts);
  const penalty = passive(this, 'normalEnemyDmgPenalty');
  if (penalty && target && !target.boss && !target.elite) out.damage = Math.max(1, Math.round(out.damage * (1 - penalty.power)));
  return out;
};

// 零式演算核：通常攻撃・特技・呪文を全部使うと3ターン、ATK/MAG/SPD+25%。
const originalAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function bountyUniqueActionDiversity(command) {
  const out = originalAdvanceTurn.call(this, command);
  const core = passive(this, 'actionDiversityBuff');
  if (core && !out.over && ['attack','skill','spell'].includes(command.type)) {
    this._omegaActions = this._omegaActions || new Set();
    this._omegaActions.add(command.type);
    if (this._omegaActions.size >= 3) {
      this._setBuff('atk', core.power, core.turns);
      this._setBuff('mag', core.power, core.turns);
      this._setBuff('spd', core.power, core.turns);
      this._omegaActions.clear();
      out.events.push({ type:'bountyUnique', result:{ kind:'omegaAnalysisComplete' } });
    }
  }
  return out;
};

// ---------- Bounty gimmicks ----------
const originalEnemyStat = BattleEngine.prototype._effectiveEnemyStat;
BattleEngine.prototype._effectiveEnemyStat = function bountyEnemyStat(enemy, stat) {
  let value = originalEnemyStat.call(this, enemy, stat);
  const id = this.stage && this.stage.id;
  const hpRatio = enemy && enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;

  // 赤牙：HP30%以下で狂暴化。
  if (id === 'bounty-redfang-varg' && hpRatio <= 0.30) {
    if (stat === 'atk') value *= 1.40;
    if (stat === 'spd') value *= 1.30;
    if (stat === 'def') value *= 0.80;
  }
  // 灰騎士：2ターン鉄壁→1ターン大きな隙。
  if (id === 'bounty-ash-knight' && stat === 'def') {
    const phase = (this.round || 1) % 3;
    value *= phase === 0 ? 0.55 : 1.65;
  }
  // 予言者：3ターンごとの予見攻撃が重い。
  if (id === 'bounty-fallen-oracle' && stat === 'atk' && (this.round || 1) % 3 === 0) value *= 1.85;
  // 処刑人：6ターン以降、毎ターン処刑圧が増す。
  if (id === 'bounty-crownless' && stat === 'atk') {
    const r = this.round || 1;
    if (r >= 6) value *= 1 + Math.min(1.5, (r - 5) * 0.22);
  }
  // オメガ：66%/33%で段階変形。最終段階は特に速い。
  if (id === 'bounty-omega-zero') {
    if (hpRatio <= 0.66 && stat === 'atk') value *= 1.20;
    if (hpRatio <= 0.33) {
      if (stat === 'atk') value *= 1.35;
      if (stat === 'spd') value *= 1.40;
      if (stat === 'def') value *= 0.90;
    }
  }
  return value;
};

// ---------- Guaranteed first-clear unique reward ----------
const originalFinishBattle = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function bountyUniqueFirstClear(cleared, retreated) {
  const bountyId = this.stage && this.stage.bounty ? this.stage.id : null;
  const wasCleared = bountyId ? state.isStageCleared(bountyId) : false;
  originalFinishBattle.call(this, cleared, retreated);
  if (!cleared || !bountyId || wasCleared || !this.finalResult) return;

  const unique = uniqueForBounty(bountyId);
  if (!unique || state.ownsItem(unique.id)) return;
  state.addItem(unique.id, 1);
  this.finalResult.items = [...(this.finalResult.items || []), unique.id];
  this.finalResult.bountyUnique = { id:unique.id, name:unique.name, lore:unique.lore };
};
