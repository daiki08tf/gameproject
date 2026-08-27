/* ============================================================
   Combat 2.0 — Weapon technique runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { getItem } from '../data/equipment.js';
import { weaponTechniquesFor } from '../data/combat2WeaponTechniques.js';

function equippedWeaponIdentity() {
  const weapon = getItem(state.data?.equipped?.weapon);
  return {
    weaponType: weapon?.weaponType || null,
    archetypeId: weapon?.weaponArchetype || null,
  };
}

const previousAvailableSkills = BattleEngine.prototype.availableSkills;
BattleEngine.prototype.availableSkills = function combat2AvailableSkills() {
  const jobSkills = previousAvailableSkills.call(this);
  const equipped = equippedWeaponIdentity();
  const weaponType = this.weaponType || equipped.weaponType;
  const weaponSkills = weaponTechniquesFor(weaponType, state.characterLevel || 1, equipped.archetypeId);
  const seen = new Set(jobSkills.map((t) => t.id));
  return [...jobSkills, ...weaponSkills.filter((t) => !seen.has(t.id))];
};

BattleEngine.prototype.availableWeaponTechniques = function availableWeaponTechniques() {
  const equipped = equippedWeaponIdentity();
  return weaponTechniquesFor(this.weaponType || equipped.weaponType, state.characterLevel || 1, equipped.archetypeId);
};
