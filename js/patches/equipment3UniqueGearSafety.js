/* ============================================================
   Equipment 3.0 — fixed Unique gear safety
   ------------------------------------------------------------
   Bounty Unique equipment is explicitly a fixed, build-defining reward and
   must not enter the random armor/accessory Affix pipeline added in PR #62.
   Keep non-weapon Unique items as their canonical base IDs.
   ============================================================ */
import { state } from '../state.js';
import { getItem } from '../data/equipment.js';

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3UniqueGearSafetyAddItem(itemId, qty = 1, dropCtx = null) {
  const item = getItem(itemId);
  const fixedUniqueGear = item?.unique && ['shield', 'head', 'body', 'accessory'].includes(item.slot);
  if (!fixedUniqueGear || this.data.gearInstances?.[itemId]) {
    return previousAddItem(itemId, qty, dropCtx);
  }

  const amount = Math.max(1, Math.floor(Number(qty) || 1));
  this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + amount;
  // Explicitly clear the transient hand-off so a previous ordinary Gear drop
  // can never be mistaken for this fixed Unique by the result bridge.
  this._lastGearInstanceIds = [];
  this.save();
  return false;
};
