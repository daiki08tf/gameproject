/* ============================================================
   Gear Overhaul Phase 2 — Option Fusion runtime
   ============================================================ */
import { state } from '../state.js';
import { canonicalOptionFamilyId, normalizeOptionLevel, OPTION_LEVEL_MAX } from '../data/options4.js';
import { optionFusionPreview, applyOptionFusionXp } from '../data/options4Fusion.js';
import { clearInstanceData } from './weaponInstanceFoundation.js';
import { clearGearInstanceData } from './equipment3GearFoundation.js';
import './gearOverhaulCraftingConsolidation.js';

function optionAt(target, index) {
  const i = Math.floor(Number(index));
  if (!target || !Array.isArray(target.affixes) || !Number.isInteger(i) || i < 0) return null;
  return target.affixes[i] || null;
}

function isEquipped(target, itemId) {
  return Object.values(target.data.equipped || {}).includes(itemId);
}

function materialProtectionReason(target, itemId) {
  if ((target.data.inventory?.[itemId] || 0) <= 0) return 'not_in_inventory';
  if (target.isItemLocked?.(itemId)) return 'material_locked';
  if (target.isItemFavorite?.(itemId)) return 'material_favorite';
  if (isEquipped(target, itemId)) return 'material_equipped';
  return null;
}

function clearConsumedEquipmentInstance(target, itemId) {
  if (target.data.weaponInstances?.[itemId]) clearInstanceData(itemId);
  else if (target.data.gearInstances?.[itemId]) clearGearInstanceData(itemId);
}

function consumeMaterialInstance(target, itemId) {
  const qty = target.data.inventory?.[itemId] || 0;
  if (qty <= 0) return false;
  if (qty <= 1) {
    delete target.data.inventory[itemId];
    clearConsumedEquipmentInstance(target, itemId);
  } else {
    target.data.inventory[itemId] = qty - 1;
  }
  return true;
}

state.optionFusionPreview = function optionFusionPreviewForState(targetItemId, targetOptionIndex, materialItemId, materialOptionIndex) {
  if (!targetItemId || !materialItemId) return { ok: false, reason: 'missing_item' };
  if (targetItemId === materialItemId) return { ok: false, reason: 'same_item' };

  const targetInst = this.equipmentInstance?.(targetItemId);
  const materialInst = this.equipmentInstance?.(materialItemId);
  if (!targetInst) return { ok: false, reason: 'target_not_instance' };
  if (!materialInst) return { ok: false, reason: 'material_not_instance' };

  const targetOption = optionAt(targetInst, targetOptionIndex);
  const materialOption = optionAt(materialInst, materialOptionIndex);
  if (!targetOption) return { ok: false, reason: 'target_option_missing' };
  if (!materialOption) return { ok: false, reason: 'material_option_missing' };
  if (normalizeOptionLevel(targetOption.level ?? 1) >= OPTION_LEVEL_MAX) return { ok: false, reason: 'target_max' };

  const protection = materialProtectionReason(this, materialItemId);
  if (protection) return { ok: false, reason: protection };

  const preview = optionFusionPreview(targetOption, materialOption);
  if (!preview.ok) return preview;
  return {
    ...preview,
    targetItemId,
    targetOptionIndex: Math.floor(Number(targetOptionIndex)),
    targetFamilyId: canonicalOptionFamilyId(targetOption.familyId || targetOption.id),
    materialItemId,
    materialOptionIndex: Math.floor(Number(materialOptionIndex)),
    materialFamilyId: canonicalOptionFamilyId(materialOption.familyId || materialOption.id),
    materialRarity: materialOption.rarity,
    materialLevel: normalizeOptionLevel(materialOption.level ?? 1),
  };
};

state.optionFusionMaterials = function optionFusionMaterials(targetItemId, targetOptionIndex) {
  const targetInst = this.equipmentInstance?.(targetItemId);
  const targetOption = optionAt(targetInst, targetOptionIndex);
  if (!targetOption || normalizeOptionLevel(targetOption.level ?? 1) >= OPTION_LEVEL_MAX) return [];
  const familyId = canonicalOptionFamilyId(targetOption.familyId || targetOption.id);
  const out = [];

  for (const [materialItemId, qty] of Object.entries(this.data.inventory || {})) {
    if (qty <= 0 || materialItemId === targetItemId) continue;
    if (materialProtectionReason(this, materialItemId)) continue;
    const materialInst = this.equipmentInstance?.(materialItemId);
    if (!materialInst?.affixes?.length) continue;
    materialInst.affixes.forEach((materialOption, materialOptionIndex) => {
      if (canonicalOptionFamilyId(materialOption.familyId || materialOption.id) !== familyId) return;
      const preview = this.optionFusionPreview(targetItemId, targetOptionIndex, materialItemId, materialOptionIndex);
      if (preview.ok) out.push(preview);
    });
  }

  out.sort((a, b) => b.xp - a.xp || b.materialLevel - a.materialLevel || String(a.materialItemId).localeCompare(String(b.materialItemId)));
  return out;
};

state.fuseEquipmentOption = function fuseEquipmentOption(targetItemId, targetOptionIndex, materialItemId, materialOptionIndex) {
  const preview = this.optionFusionPreview(targetItemId, targetOptionIndex, materialItemId, materialOptionIndex);
  if (!preview.ok) return preview;

  const targetInst = this.equipmentInstance(targetItemId);
  const targetOption = optionAt(targetInst, targetOptionIndex);
  const nextOption = applyOptionFusionXp(targetOption, preview.xp);
  if (!nextOption) return { ok: false, reason: 'fusion_failed' };
  if (!consumeMaterialInstance(this, materialItemId)) return { ok: false, reason: 'material_consume_failed' };

  targetInst.affixes[targetOptionIndex] = nextOption;
  this.save();
  return {
    ...preview,
    ok: true,
    option: nextOption,
    level: nextOption.level,
    xpRemaining: nextOption.xp,
  };
};

export { materialProtectionReason, consumeMaterialInstance };
