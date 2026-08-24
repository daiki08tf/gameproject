/* Companion long-term cap safety. */
import { state } from '../state.js';
import { CHARACTER_LEVEL_MAX } from '../data/progression.js';

function clampInstance(id) {
  const inst = state.data.companionInstances?.[id];
  if (!inst) return false;
  if ((Number(inst.level) || 1) <= CHARACTER_LEVEL_MAX) return false;
  inst.level = CHARACTER_LEVEL_MAX;
  inst.exp = 0;
  return true;
}

const originalCreateCompanion = state.createCompanion?.bind(state);
if (originalCreateCompanion) {
  state.createCompanion = function cappedCreateCompanion(speciesId, opts = {}) {
    const safeOpts = { ...opts, level: Math.min(CHARACTER_LEVEL_MAX, Math.max(1, Math.floor(Number(opts.level) || 1))) };
    const id = originalCreateCompanion(speciesId, safeOpts);
    if (id && clampInstance(id)) this.save();
    return id;
  };
}

const originalGainCompanionExp = state.gainCompanionExp?.bind(state);
if (originalGainCompanionExp) {
  state.gainCompanionExp = function cappedGainCompanionExp(amount, instanceId = this.activeCompanionId()) {
    const inst = instanceId && this.data.companionInstances?.[instanceId];
    if (!inst) return { gained: 0, leveledUp: false };
    if ((Number(inst.level) || 1) >= CHARACTER_LEVEL_MAX) {
      inst.level = CHARACTER_LEVEL_MAX;
      inst.exp = 0;
      this.save();
      return { gained: 0, leveledUp: false, level: CHARACTER_LEVEL_MAX, capped: true };
    }
    const result = originalGainCompanionExp(amount, instanceId);
    if (clampInstance(instanceId)) {
      this.save();
      return { ...result, level: CHARACTER_LEVEL_MAX, capped: true };
    }
    return result;
  };
}

state.companionLevelMax = CHARACTER_LEVEL_MAX;
export { clampInstance };
