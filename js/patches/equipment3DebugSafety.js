/* ============================================================
   Equipment 3.0 — debug safety guards
   Prevent destructive crafting operations that can silently lose rare data.
   ============================================================ */
import './loot2Core.js';
import { state } from '../state.js';
import { getLegendaryEffect } from '../data/equipment3Legendary.js';

// Blacksmith 3.0 originally allowed imprinting onto a weapon that already had a
// Legendary Effect. That consumed the stored imprint and silently replaced the
// existing effect without extracting it first. Treat occupied Legendary slots as
// non-writable: extract the old effect first, then imprint intentionally.
const previousImprintLegendary = state.equipment3ImprintLegendary?.bind(state);
if (previousImprintLegendary) {
  state.canEquipment3ImprintLegendary = function canEquipment3ImprintLegendary(instanceId, effectId) {
    const inst = this.data.weaponInstances?.[instanceId];
    if (!inst || !getLegendaryEffect(effectId)) return false;
    if (inst.legendaryEffectId) return false;
    if ((this.data.equipment3Imprints?.[effectId] || 0) <= 0) return false;
    return true;
  };

  state.equipment3ImprintLegendary = function safeEquipment3ImprintLegendary(instanceId, effectId) {
    if (!this.canEquipment3ImprintLegendary(instanceId, effectId)) return false;
    return previousImprintLegendary(instanceId, effectId);
  };
}
