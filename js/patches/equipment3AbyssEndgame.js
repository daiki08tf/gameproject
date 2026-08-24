/* ============================================================
   Equipment 3.0 E9 — Abyss drop context / Affix-quality bridge
   BattleEngine already passes { depth, elite, boss } into state.addItem().
   Enrich that context with E9's explicit Item Power target, then use the actual
   rolled instance IP as the authoritative base-Affix quality axis.
   ============================================================ */
import { state } from '../state.js';
import { abyssTargetItemPower } from '../data/abyssEndgame.js';
import { applyItemPowerAffixQuality } from '../data/equipment3AffixQuality.js';

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3AbyssEndgameAddItem(itemId, qty = 1, dropCtx = null) {
  let ctx = dropCtx;
  const depth = Math.max(0, Math.floor(Number(dropCtx?.depth) || 0));
  if (depth > 0) {
    ctx = { ...dropCtx, itemPowerTarget: abyssTargetItemPower(depth) };
  }

  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const result = previousAddItem(itemId, qty, ctx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));

  let changed = false;
  for (let seq = beforeSeq; seq < afterSeq; seq += 1) {
    const instanceId = `${itemId}#${seq}`;
    const inst = this.data.weaponInstances?.[instanceId];
    if (!inst || inst.affixQualityVersion === 1) continue;
    applyItemPowerAffixQuality(inst, ctx || {}, instanceId);
    // Version is meaningful even for zero-Affix weapons: do not repeatedly inspect
    // the same newly-created instance through future compatibility layers.
    inst.affixQualityVersion = 1;
    changed = true;
  }
  if (changed) this.save();
  return result;
};
