/* Full-reset safety for systems added outside state.defaultSave(). */
import { state } from '../state.js';

const originalResetAll = state.resetAll.bind(state);
state.resetAll = function resetAllWithCompanionShape() {
  originalResetAll();
  this.data.companionInstances = {};
  this.data.companionParty = [null, null, null];
  this.data.nextCompanionSeq = 1;
  this.data.companionCodex = {};
  this.data.starterCompanionGranted = false;
  const starter = this.createCompanion?.('slime', { rarity:'normal', nature:'balanced', origin:'starter' });
  if (starter) this.setActiveCompanion?.(starter);
  this.data.starterCompanionGranted = true;
  this.save();
};
