/* ============================================================
   Loot 3.0 — World realm target-farm bridge
   ------------------------------------------------------------
   World 3.0 already tells the player what Heaven/Underworld are for. This patch
   makes that promise real without replacing Equipment 3.0 generation: after a
   normal instance is built, a bounded deterministic chance can steer one Affix
   identity toward the realm's preferred elemental family. Item Power, rarity,
   Greater flags, Legendary/Curse packages and instance persistence remain the
   canonical Equipment 3.0 systems.

   CLR-17 extends the same bounded target-farm bridge to active Region Hunt runs.
   Region identity never replaces an existing stronger/specialized drop context.
   ============================================================ */
import { state } from '../state.js';
import { getItem, baseItemId } from '../data/equipment.js';
import { AFFIXES } from '../data/affixes.js';
import { applyItemPowerAffixQuality } from '../data/equipment3AffixQuality.js';
import { clr17MergeDropContext } from '../data/coreLoopClr17.js';
import { canonicalDisplayName } from './equipment3Foundation.js';
import { canonicalGearName } from '../data/equipment3Gear.js';

function hashUnit(text) {
  let h = 2166136261;
  for (const ch of String(text || 'loot3')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function targetIds(ctx) {
  return (Array.isArray(ctx?.preferredAffixIds) ? ctx.preferredAffixIds : [])
    .filter(id => !!AFFIXES[id]);
}

function huntDropContext(target, dropCtx) {
  const session = target.adventure4Session?.();
  if (!session?.active || !String(session.routeId || '').endsWith('-free-adventure')) return dropCtx;
  return clr17MergeDropContext(dropCtx, session.regionId);
}

export function steerRealmAffix(inst, ctx = {}, instanceId = '') {
  if (!inst || !Array.isArray(inst.affixes) || inst.affixes.length === 0 || ctx.informationalOnly) return false;
  const ids = targetIds(ctx);
  const chance = Math.max(0, Math.min(1, Number(ctx.targetAffixChance) || 0));
  if (!ids.length || chance <= 0 || hashUnit(`${instanceId}:${ctx.world2KeyType || ctx.clr17RegionId || 'target'}:target`) >= chance) return false;
  if (inst.affixes.some(a => ids.includes(a.id))) {
    inst.targetFarm = ctx.targetFarm || null;
    inst.targetFarmHit = true;
    return true;
  }

  const replacementIndex = Math.floor(hashUnit(`${instanceId}:target-slot`) * inst.affixes.length);
  const wanted = ids[Math.floor(hashUnit(`${instanceId}:target-id`) * ids.length)] || ids[0];
  const old = inst.affixes[replacementIndex];
  inst.affixes[replacementIndex] = { id: wanted, rarity: old.rarity || 'common', roll: old.roll || 0, greater: !!old.greater };
  // Reuse the canonical IP->Affix quality bridge so changing identity cannot keep
  // an invalid roll range from the replaced Affix.
  applyItemPowerAffixQuality(inst, ctx, instanceId);
  inst.targetFarm = ctx.targetFarm || null;
  inst.targetFarmHit = true;
  return true;
}

function refreshDisplayName(instanceId, inst) {
  const item = getItem(inst?.itemId || baseItemId(instanceId));
  if (!item || !inst) return;
  if (item.slot === 'weapon') inst.displayName = canonicalDisplayName(item, inst);
  else inst.displayName = canonicalGearName(item, inst);
}

const previousAddItem = state.addItem.bind(state);
state.addItem = function loot3RealmAddItem(itemId, qty = 1, dropCtx = null) {
  const ctx = huntDropContext(this, dropCtx) || {};
  const beforeSeq = Math.max(1, Math.floor(Number(this.data.nextInstanceSeq) || 1));
  const result = previousAddItem(itemId, qty, ctx);
  const afterSeq = Math.max(beforeSeq, Math.floor(Number(this.data.nextInstanceSeq) || beforeSeq));
  if (!targetIds(ctx).length || ctx.informationalOnly || afterSeq <= beforeSeq) return result;

  let changed = false;
  const base = baseItemId(itemId);
  for (let seq = beforeSeq; seq < afterSeq; seq += 1) {
    const id = `${base}#${seq}`;
    const inst = this.data.weaponInstances?.[id] || this.data.gearInstances?.[id];
    if (!inst) continue;
    if (steerRealmAffix(inst, ctx, id)) {
      refreshDisplayName(id, inst);
      changed = true;
    }
  }
  if (changed) this.save();
  return result;
};

export { huntDropContext };
