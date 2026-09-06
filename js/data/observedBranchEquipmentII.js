/* Observed Branches M8 — Branch Equipment II: familiar Prime item variants.
   Each entry is an authored alternate identity for a specific, already-live
   Prime item (see `variantOfId`, `js/data/equipment.js`'s ITEMS map). These
   are ordinary, separate Equipment/Gear Overhaul items: the Prime item is
   never modified, hidden, or auto-converted, stays fully useful on its own,
   and each variant carries its own distinct combat loop, not a reskin.
   branchOrigin/variantOfId are read-only presentation metadata only; they
   own no progression, rarity, inventory, Option, save, Battle, Loot, or
   World Tier authority. */
import { OBSERVED_BRANCH_ORIGINS } from './observedBranchEquipment.js';

const item=(spec)=>Object.freeze({
  ...spec,
  branchOrigin:Object.freeze({...spec.branchOrigin}),
  effects:spec.effects?Object.freeze(spec.effects.map(effect=>Object.freeze({...effect}))):undefined,
});

export const OBSERVED_BRANCH_EQUIPMENT_II=Object.freeze([
  // Prime: ch2_named_weapon「狼王の逆咬み」— punish-on-hurt counter loop.
  // 王樹領 keeps the same dagger family but trades the punish loop for a
  // kill-sustain loop, matching the Branch's Bio-dominant divergence.
  item({
    id:'uq_observed_verdant_fang',variantOfId:'ch2_named_weapon',sourceStageId:'observedbranch-tree-sovereign-2',
    name:'根噛みの逆牙・VERDANT FANG',slot:'weapon',weaponType:'dagger',rarity:'legendary',
    stats:{atk:13.4,spd:4.5,crit:3},unique:true,observedBranch:true,
    branchOrigin:OBSERVED_BRANCH_ORIGINS['tree-sovereign-deep-green'],
    unique2IdentityId:'u2_dagger_verdant_fang',
    effects:[{trigger:'onKill',kind:'healOnKill',power:.04}],
    lore:'受けた傷で牙を鋭くした正史の逆咬みとは違い、生存し続けた大樹霊の史脈で育った牙は、狩るたびに使い手を癒す。',
  }),
  // Prime: ch2_named_weapon「狼王の逆咬み」— punish-on-hurt counter loop.
  // 深緑消失域 trades it for the opposite loop: raw damage that only holds
  // while no recovery/regeneration effect is active, matching the Branch's
  // "absence" identity (reuses the same noRecoveryDmgBonus kind as M6's
  // uq_observed_null_root, inside the same authored safety envelope).
  item({
    id:'uq_observed_null_fang',variantOfId:'ch2_named_weapon',sourceStageId:'observedbranch-deepgreen-absence-2',
    name:'空牙の逆咬み・NULL FANG',slot:'weapon',weaponType:'dagger',rarity:'legendary',
    stats:{atk:13.8,spd:5,crit:3.2},unique:true,observedBranch:true,
    branchOrigin:OBSERVED_BRANCH_ORIGINS['deep-green-absence'],
    unique2IdentityId:'u2_dagger_null_fang',
    effects:[{trigger:'passive',kind:'noRecoveryDmgBonus',power:.20}],
    lore:'森が消失した履歴には、傷を受けて牙を研ぐ狼そのものが存在しない。回復も再生も伴わない牙は、欠落した狼の輪郭だけを攻撃力へ変える。',
  }),
  // Prime: ch5_named_body「サラマンダーの鱗」— offensive onHit burn proc.
  // 炎帝領 trades raw elemental fire for royal industrial armor: absorbed
  // pressure returns as a buffed strike instead of a burn proc, matching
  // the Branch's Mechanical/Material-dominant divergence.
  item({
    id:'uq_observed_royal_scale',variantOfId:'ch5_named_body',sourceStageId:'observedbranch-flame-king-2',
    name:'戴冠鱗鎧・ROYAL SCALE',slot:'body',rarity:'legendary',
    stats:{def:8.2,hp:24,atk:2},unique:true,observedBranch:true,
    branchOrigin:OBSERVED_BRANCH_ORIGINS['flame-king-volcano'],
    effects:[{trigger:'onGuard',kind:'guardNextAtkBuff',power:.45}],
    lore:'野生の炎蜥蜴の鱗ではなく、王家の熔鉱で鍛え直された鱗鎧。受け止めた圧力を燃やして消費せず、次の一撃へそのまま送る。',
  }),
]);

export function observedBranchEquipmentIIById(id){
  return OBSERVED_BRANCH_EQUIPMENT_II.find(entry=>entry.id===id)||null;
}
