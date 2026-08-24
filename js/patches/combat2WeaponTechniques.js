/* ============================================================
   Combat 2.0 — Weapon technique runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { weaponTechniquesFor } from '../data/combat2WeaponTechniques.js';

const previousAvailableSkills = BattleEngine.prototype.availableSkills;
BattleEngine.prototype.availableSkills = function combat2AvailableSkills() {
  const jobSkills = previousAvailableSkills.call(this);
  const weaponSkills = weaponTechniquesFor(this.weaponType, state.characterLevel || 1);
  const seen = new Set(jobSkills.map((t) => t.id));
  return [...jobSkills, ...weaponSkills.filter((t) => !seen.has(t.id))];
};

BattleEngine.prototype.availableWeaponTechniques = function availableWeaponTechniques() {
  return weaponTechniquesFor(this.weaponType, state.characterLevel || 1);
};
