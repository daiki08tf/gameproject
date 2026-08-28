/* Gear Overhaul Phase 3C — fixed item identity model */
import { getLegendaryEffect, getCursedAffix } from './equipment3Legendary.js';
import { unique2IdentityById } from './unique2IdentityLibrary.js';

export const FIXED_IDENTITY_KIND = Object.freeze({
  UNIQUE: 'unique',
  LEGENDARY: 'legendary',
  CURSE: 'curse',
});

export function fixedEquipmentIdentities(item, inst = null) {
  if (!item) return [];
  const out = [];

  if (item.unique) {
    const authored = item.unique2IdentityId ? unique2IdentityById(item.unique2IdentityId) : null;
    out.push({
      kind: FIXED_IDENTITY_KIND.UNIQUE,
      label: 'UNIQUE FIXED',
      // The equipment row already shows the item name. For Unique 2.0, use the
      // fixed-identity name here so the compact detail tells the player what
      // actually changes their combat loop instead of repeating the item name.
      name: authored?.name || item.name,
      desc: authored?.loop || item.lore || 'この装備固有の固定能力。ランダムOption枠・Option Fusionの対象外。',
      sourceItemName: item.name,
      identityId: authored?.id || null,
      buildLaneIds: authored?.buildLaneIds || [],
      effects: Array.isArray(item.effects) ? item.effects : [],
      mutable: false,
      consumesOptionSlot: false,
      optionFusionEligible: false,
    });
  }

  const legendary = getLegendaryEffect(inst?.legendaryEffectId);
  if (legendary) {
    out.push({
      kind: FIXED_IDENTITY_KIND.LEGENDARY,
      label: 'LEGENDARY POWER',
      name: legendary.name,
      desc: legendary.desc,
      effects: legendary.effects || [],
      mutable: true,
      mutableBy: 'extract_imprint',
      consumesOptionSlot: false,
      optionFusionEligible: false,
    });
  }

  const curse = getCursedAffix(inst?.curseId);
  if (curse) {
    out.push({
      kind: FIXED_IDENTITY_KIND.CURSE,
      label: 'CURSE',
      name: curse.name,
      desc: curse.desc,
      effects: curse.effects || [],
      statMult: curse.statMult || null,
      mutable: false,
      consumesOptionSlot: false,
      optionFusionEligible: false,
    });
  }

  return out;
}

export function fixedIdentitySummary(identity) {
  if (!identity) return '';
  if (identity.kind === FIXED_IDENTITY_KIND.UNIQUE) return `【固有】${identity.name} — ${identity.desc}`;
  if (identity.kind === FIXED_IDENTITY_KIND.LEGENDARY) return `《固定能力：${identity.name}》 ${identity.desc}`;
  if (identity.kind === FIXED_IDENTITY_KIND.CURSE) return `【呪印：${identity.name}】 ${identity.desc}`;
  return `${identity.name || 'FIXED'} ${identity.desc || ''}`.trim();
}
