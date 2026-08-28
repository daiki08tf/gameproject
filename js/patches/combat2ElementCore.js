/* ============================================================
   Combat 2.0 — Element runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { elementMultiplier, resolveRandomElement } from '../data/combat2Elements.js';
import { affinityTier } from '../data/enemyAffinity2.js';

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
      const result=previousPlayerTechnique.call(this, kind, techId, targetId, ...rest);
      if(element&&Array.isArray(result?.targets)){
        for(const hit of result.targets){
          const target=(this.enemies||[]).find(e=>e.id===hit.targetId);
          if(!target)continue;
          const mult=elementMultiplier(element,target),tier=affinityTier(mult);
          hit.element=element;hit.elementMultiplier=mult;hit.affinityTier=tier;
        }
      }
      return result;
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
  const tier=affinityTier(mult);
  if(tier!=='neutral')state.markEnemyAffinityObserved?.(target,element,mult);
  if (mult === 1) return result;
  return {
    ...result,
    damage: Math.max(1, Math.round(result.damage * mult)),
    element,
    elementMultiplier: mult,
    affinityTier:tier,
  };
};

BattleEngine.prototype.combat2ElementMultiplier = function combat2ElementMultiplier(element, target) {
  return elementMultiplier(element, target);
};
