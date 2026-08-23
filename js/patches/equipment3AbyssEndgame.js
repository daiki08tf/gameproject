/* ============================================================
   Equipment 3.0 E9 — Abyss drop context bridge
   BattleEngine already passes { depth, elite, boss } into state.addItem().
   Enrich that existing context with E9's explicit Item Power target without
   changing battle/drop call sites.
   ============================================================ */
import { state } from '../state.js';
import { abyssTargetItemPower } from '../data/abyssEndgame.js';

const previousAddItem = state.addItem.bind(state);
state.addItem = function equipment3AbyssEndgameAddItem(itemId, qty = 1, dropCtx = null) {
  let ctx = dropCtx;
  const depth = Math.max(0, Math.floor(Number(dropCtx?.depth) || 0));
  if (depth > 0) {
    ctx = { ...dropCtx, itemPowerTarget: abyssTargetItemPower(depth) };
  }
  return previousAddItem(itemId, qty, ctx);
};
