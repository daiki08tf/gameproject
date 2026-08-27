/* ============================================================
   Combat 2.0 — Weapon technique runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { getItem } from '../data/equipment.js';
import { weaponTechniquesFor } from '../data/combat2WeaponTechniques.js';
import {
  applyWeaponTechniqueRotation,
  advanceWeaponTechniqueChain,
  weaponTechniqueStage,
} from '../data/weaponTechniqueRotation.js';

function equippedWeaponIdentity() {
  const weapon = getItem(state.data?.equipped?.weapon);
  return {
    weaponType: weapon?.weaponType || null,
    archetypeId: weapon?.weaponArchetype || null,
  };
}

function rotationAwareWeaponTechniques(engine) {
  const equipped = equippedWeaponIdentity();
  const weaponType = engine.weaponType || equipped.weaponType;
  return weaponTechniquesFor(weaponType, state.characterLevel || 1, equipped.archetypeId)
    .map((tech) => applyWeaponTechniqueRotation(tech, engine._weaponTechniqueChain || null));
}

const previousAvailableSkills = BattleEngine.prototype.availableSkills;
BattleEngine.prototype.availableSkills = function combat2AvailableSkills() {
  const jobSkills = previousAvailableSkills.call(this);
  const weaponSkills = rotationAwareWeaponTechniques(this);
  const seen = new Set(jobSkills.map((t) => t.id));
  return [...jobSkills, ...weaponSkills.filter((t) => !seen.has(t.id))];
};

BattleEngine.prototype.availableWeaponTechniques = function availableWeaponTechniques() {
  return rotationAwareWeaponTechniques(this);
};

// The chain is encounter-local state on BattleEngine. It is deliberately not a
// save field or resource meter. Opener -> Setup -> Finisher earns a soft bonus;
// Job skills and normal attacks may be woven between weapon techniques.
const previousPlayerTechnique = BattleEngine.prototype._playerTechnique;
BattleEngine.prototype._playerTechnique = function weaponTechniqueChainPlayerTechnique(kind, techId, targetId) {
  const stage = weaponTechniqueStage(techId);
  const resolved = stage ? this.availableWeaponTechniques().find((t) => t.id === techId) : null;
  const result = previousPlayerTechnique.call(this, kind, techId, targetId);
  if (!stage || result?.blocked) return result;

  if (resolved?.weaponChainBonus) {
    result.weaponChainBonus = resolved.weaponChainBonus;
    result.weaponChainFamily = stage.family;
  }
  this._weaponTechniqueChain = advanceWeaponTechniqueChain(this._weaponTechniqueChain || null, techId);
  result.weaponChainNextStep = this._weaponTechniqueChain?.step || 0;
  return result;
};
