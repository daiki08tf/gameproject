/* ============================================================
   Companion 2.0 Phase 3 - party synergy + Bond Rune
   ============================================================ */
import { state } from '../state.js';
import { evaluateCompanionSynergies, bondRuneEffects } from '../data/companionSynergies.js';

state.companionBondEffects = function companionBondEffects() {
  const marks = this.rune2ActiveMarks ? this.rune2ActiveMarks('bond') : 0;
  return bondRuneEffects(marks);
};

state.companionSynergySummary = function companionSynergySummary() {
  const party = this.activeCompanions ? this.activeCompanions() : (this.activeCompanion?.() ? [this.activeCompanion()] : []);
  return evaluateCompanionSynergies(party);
};

if (state.gainPartyCompanionExp) {
  const originalGainPartyExp = state.gainPartyCompanionExp.bind(state);
  state.gainPartyCompanionExp = function synergyGainPartyCompanionExp(amount) {
    const mult = this.companionBondEffects().companionExpMult;
    return originalGainPartyExp(amount * mult);
  };
}

export { evaluateCompanionSynergies, bondRuneEffects };
