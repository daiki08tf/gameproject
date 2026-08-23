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

// ---------- Unique inventory rules ----------
const originalAddItem = state.addItem.bind(state);
state.addItem = function addItemWithUniqueRule(itemId, qty = 1, dropCtx = null) {
  const unique = bountyUniqueById(itemId);
  if (!unique) return originalAddItem(itemId, qty, dropCtx);
  // ユニーク装備は「同名でもランダムAffix違い」にはしない。固定能力そのものが価値。
  this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + qty;
  this.data.itemLocked[itemId] = true; // 誤売却・素材化を防止
  this.save();
  return !this.ownsItem(itemId) || this.data.inventory[itemId] === qty;
};

const originalCanSell = state.canSellOrDismantle.bind(state);
state.canSellOrDismantle = function uniqueCannotBeDestroyed(itemId, qty = 1) {
  if (bountyUniqueById(itemId)) return false;
  return originalCanSell(itemId, qty);
};

// 血牙グラムのDEFペナルティは装備画面・戦闘双方で同じ数値になるようstate層で反映。
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

// 王殺し：Bossには既存bossDmg経路で+50%。通常敵には明確なデメリット。
const originalCalculateDamage = BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage = function bountyUniqueDamage(atk, target, opts = {}) {
  const out = originalCalculateDamage.call(this, atk, target, opts);
  const penalty = passive(this, 'normalEnemyDmgPenalty');
  if (penalty && target && !target.boss && !target.elite) out.damage = Math.max(1, Math.round(out.damage * (1 - penalty.power)));
  return out;
};

// 零式演算核：通常攻撃・特技・呪文を全部使うと3ターン「演算完了」。
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

// ---------- Bounty enemy gimmicks ----------
const originalEnemyStat = BattleEngine.prototype._effectiveEnemyStat;
BattleEngine.prototype._effectiveEnemyStat = function bountyEnemyStat(enemy, stat) {
  let value = originalEnemyStat.call(this, enemy, stat);
  const id = this.stage && this.stage.id;
  const hpRatio = enemy && enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;

  if (id === 'bounty-redfang-varg' && hpRatio <= 0.30) {
    if (stat === 'atk') value *= 1.40;
    if (stat === 'spd') value *= 1.30;
  }
  if (id === 'bounty-ash-knight' && stat === 'def') {
    // 2ターン防御→1ターン隙、を繰り返す。隙のターンに攻めるのが正解。
    const phase = (this.round || 1) % 3;
    value *= phase === 0 ? 0.55 : 1.65;
  }
  if (id === 'bounty-fallen-oracle' && stat === 'atk') {
    // 3ターンごとに「予見された一撃」。ガードを挟む価値が生まれる。
    if ((this.round || 1) % 3 === 0) value *= 1.85;
  }
  if (id === 'bounty-crownless' && stat === 'atk') {
    // 長期戦ほど処刑圧が上がり、6ターン以降は一気に危険になる。
    const r = this.round || 1;
    if (r >= 6) value *= 1 + Math.min(1.5, (r - 5) * 0.22);
  }
  if (id === 'bounty-omega-zero') {
    // 三段階変形。終盤ほど攻撃・速度が上がり、短期決着を要求する。
    if (hpRatio <= 0.66 && stat === 'atk') value *= 1.20;
    if (hpRatio <= 0.33) {
      if (stat === 'atk') value *= 1.35;
      if (stat === 'spd') value *= 1.40;
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
