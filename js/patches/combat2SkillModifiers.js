/* ============================================================
   Combat 2.0 — Skill Modifier runtime
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { applySkillModifier, nextModifierId, SKILL_MODIFIERS } from '../data/combat2SkillModifiers.js';

function ensureModifierData(target = state) {
  target.data.combat2SkillModifiers ||= {};
  return target.data.combat2SkillModifiers;
}

state.skillModifierFor = function skillModifierFor(techId) {
  return ensureModifierData(this)[techId] || 'none';
};

state.setSkillModifier = function setSkillModifier(techId, modifierId) {
  ensureModifierData(this)[techId] = modifierId || 'none';
  this.save();
  return ensureModifierData(this)[techId];
};

state.cycleSkillModifier = function cycleSkillModifier(tech) {
  if (!tech?.id) return 'none';
  const current = this.skillModifierFor(tech.id);
  const next = nextModifierId(tech, current);
  this.setSkillModifier(tech.id, next);
  return next;
};

state.skillModifierLabel = function skillModifierLabel(techId) {
  const id = this.skillModifierFor(techId);
  return SKILL_MODIFIERS[id]?.name || SKILL_MODIFIERS.none.name;
};

const previousAvailableSkills = BattleEngine.prototype.availableSkills;
BattleEngine.prototype.availableSkills = function combat2ModifiedSkills() {
  return previousAvailableSkills.call(this).map((tech) => applySkillModifier(tech, state.skillModifierFor(tech.id)));
};

const previousAvailableSpells = BattleEngine.prototype.availableSpells;
BattleEngine.prototype.availableSpells = function combat2ModifiedSpells() {
  return previousAvailableSpells.call(this).map((tech) => applySkillModifier(tech, state.skillModifierFor(tech.id)));
};

ensureModifierData();
