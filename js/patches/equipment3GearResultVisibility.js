/* ============================================================
   Equipment 3.0 — Armor / Accessory result visibility
   ------------------------------------------------------------
   Legacy battle result arrays store the base item id. Non-weapon Equipment 3.0
   drops are now unique instances, so replace only the matching final runItems
   entry with the exact instance id issued by state.addItem().
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { getItem, baseItemId } from '../data/equipment.js';

const originalRollDrop = BattleEngine.prototype._rollDrop;
if (typeof originalRollDrop === 'function') {
  BattleEngine.prototype._rollDrop = function equipment3GearResultDrop(...args) {
    const beforeCount = Array.isArray(this.runItems) ? this.runItems.length : 0;
    const result = originalRollDrop.apply(this, args);
    if (!Array.isArray(this.runItems) || this.runItems.length <= beforeCount) return result;

    const instanceId = state.consumeLastGearInstanceId?.();
    if (!instanceId) return result;
    const item = getItem(instanceId);
    if (!item || !['shield', 'head', 'body', 'accessory'].includes(item.slot)) return result;

    const last = this.runItems.length - 1;
    if (baseItemId(this.runItems[last]) === baseItemId(instanceId)) this.runItems[last] = instanceId;
    if (result && typeof result === 'object' && !result.instanceId) result.instanceId = instanceId;
    return result;
  };
}
