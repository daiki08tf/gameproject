/* ============================================================
   Combat 2.0 — Element runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { elementMultiplier, resolveRandomElement } from '../data/combat2Elements.js';

const previousPlayerTechnique = BattleEngine.prototype._playerTechnique;
if (typeof previousPlayerTechnique === 'function') {
  BattleEngine.prototype._playerTechnique = function combat2ElementTechnique(kind, techId, targetId, ...rest) {
    const list = kind === 'spell' ? this.availableSpells() : this.availableSkills();
    const tech = list.find((row) => row.id === techId) || null;
    const previous = this._combat2ActiveElement || null;
    let element = tech?.element || null;
    if (element === 'random') element = resolveRandomElement((this.defeated || 0) + (this.player?.mp || 0) + String(techId).length);
    this._combat2ActiveElement = element;
    try {
      return previousPlayerTechnique.call(this, kind, techId, targetId, ...rest);
    } finally {
      this._combat2ActiveElement = previous;
    }
  };
}

const previousCalculateDamage = BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage = function combat2ElementDamage(atk, target, opts = {}) {
  const result = previousCalculateDamage.call(this, atk, target, opts);
  const element = opts.element || this._combat2ActiveElement || null;
  if (!element || !target || !result) return result;
  const mult = elementMultiplier(element, target);
  if (mult === 1) return result;
  return {
    ...result,
    damage: Math.max(1, Math.round(result.damage * mult)),
    element,
    elementMultiplier: mult,
  };
};

// Expose a read-only helper for UI/tests and future enemy codex integration.
BattleEngine.prototype.combat2ElementMultiplier = function combat2ElementMultiplier(element, target) {
  return elementMultiplier(element, target);
};
