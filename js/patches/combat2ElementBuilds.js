/* ============================================================
   Combat 2.0 — Element build runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';

function elementDamageBonus(effects, element) {
  if (!element) return 0;
  let total = 0;
  for (const eff of effects || []) {
    if (eff?.kind !== 'elementDmg' || eff.element !== element) continue;
    total += Math.max(0, Number(eff.power) || 0);
  }
  // Element bonus is a separate build layer but is bounded to avoid six Greater
  // affixes multiplying into an uncontrolled damage bucket.
  return Math.min(0.75, total);
}

const previousCalculateDamage = BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage = function combat2ElementBuildDamage(atk, target, opts = {}) {
  const result = previousCalculateDamage.call(this, atk, target, opts);
  if (!result) return result;
  const element = opts.element || this._combat2ActiveElement || result.element || null;
  const bonus = elementDamageBonus(this.effects, element);
  if (!element || bonus <= 0) return result;
  return {
    ...result,
    damage: Math.max(1, Math.round(result.damage * (1 + bonus))),
    element,
    elementBuildBonus: bonus,
  };
};

BattleEngine.prototype.combat2ElementDamageBonus = function combat2ElementDamageBonus(element) {
  return elementDamageBonus(this.effects, element);
};

export { elementDamageBonus };
