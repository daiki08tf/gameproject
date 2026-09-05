/* Observed Branches M5 — Divergent Technology Gear I.
   These are ordinary Equipment/Gear Overhaul items. Branch Origin is read-only
   presentation metadata only; it owns no progression, rarity, inventory, Option,
   save, Battle, Loot, or World Tier authority. */

const TREE_ORIGIN=Object.freeze({
  branchId:'tree-sovereign-deep-green',
  label:'王樹領・深緑の森',
  technology:'Bio / Arcane',
  divergence:'大樹霊生存',
});

const ABSENCE_ORIGIN=Object.freeze({
  branchId:'deep-green-absence',
  label:'深緑消失域',
  technology:'Boundary / Information',
  divergence:'境界崩壊による森林圏消失',
});

const item=(spec)=>Object.freeze({
  ...spec,
  branchOrigin:Object.freeze({...spec.branchOrigin}),
  effects:spec.effects?Object.freeze(spec.effects.map(effect=>Object.freeze({...effect}))):undefined,
});

export const OBSERVED_BRANCH_EQUIPMENT=Object.freeze([
  // 王樹領 — living craft trades raw mechanical simplicity for Bio / Arcane identity.
  item({id:'ob_tree_root_staff',name:'根唱杖・ARBOR HYMN',slot:'weapon',weaponType:'staff',rarity:'epic',stats:Object.freeze({mag:16.5,mp:18,def:2}),branchOrigin:TREE_ORIGIN,lore:'根脈を詠唱回路として育てた生体杖。金属機構をほぼ持たず、森そのものを術式へ接続する。'}),
  item({id:'ob_tree_thorn_bow',name:'棘弦弓・CANOPY',slot:'weapon',weaponType:'bow',rarity:'epic',stats:Object.freeze({atk:13.8,spd:4,crit:3}),branchOrigin:TREE_ORIGIN,lore:'生きた蔓弦が射手の呼吸へ追従する樹冠弓。'}),
  item({id:'ob_tree_symbiotic_shield',name:'共生樹盾・BARKWARD',slot:'shield',rarity:'epic',stats:Object.freeze({def:9.8,hp:22,mag:2.5}),branchOrigin:TREE_ORIGIN,lore:'装着者の魔力へ根を伸ばし、傷つくほど繊維密度を変える共生盾。'}),
  item({id:'ob_tree_living_body',name:'生体樹殻・VERDURE',slot:'body',rarity:'epic',stats:Object.freeze({def:8.8,hp:28,mag:3.5}),branchOrigin:TREE_ORIGIN,lore:'鍛造ではなく育成で完成する樹皮鎧。'}),
  item({id:'ob_tree_crown_seed',name:'王樹種環',slot:'accessory',rarity:'epic',stats:Object.freeze({mag:7.5,mp:14,def:2.5}),branchOrigin:TREE_ORIGIN,lore:'王樹の枝分かれを小さな環へ固定した術式種子。'}),
  item({id:'uq_observed_verdant',sourceStageId:'observedbranch-tree-sovereign-boss',name:'王樹脈剣・VERDANT',slot:'weapon',weaponType:'sword',rarity:'legendary',stats:Object.freeze({atk:18.6,mag:4.5,def:2.5}),unique:true,observedBranch:true,branchOrigin:TREE_ORIGIN,effects:[{trigger:'onGuard',kind:'guardNextAtkBuff',power:.45},{trigger:'onKill',kind:'healOnKill',power:.02}],lore:'大樹霊の生存史でだけ育つ王樹の脈剣。受け止めた圧力を次の一撃へ送り、撃破した生命反応をわずかな再生へ戻す。'}),

  // 深緑消失域 — missing ecology is replaced by Boundary / Information instruments.
  item({id:'ob_absence_echo_dagger',name:'残響短刃・ECHO TRACE',slot:'weapon',weaponType:'dagger',rarity:'epic',stats:Object.freeze({atk:13.2,spd:5.2,crit:3.2}),branchOrigin:ABSENCE_ORIGIN,lore:'絶滅した獣の戦闘記憶だけを刃の軌跡へ再生する短刃。'}),
  item({id:'ob_absence_survey_rod',name:'測界錫・PHASE NEEDLE',slot:'weapon',weaponType:'rod',rarity:'epic',stats:Object.freeze({mag:15.6,mp:15,spd:3.5}),branchOrigin:ABSENCE_ORIGIN,lore:'空白域の境界ずれを測りながら術式を通す観測錫。'}),
  item({id:'ob_absence_survey_head',name:'測線観測冠',slot:'head',rarity:'epic',stats:Object.freeze({def:5.8,mag:6.8,mp:9,spd:2.5}),branchOrigin:ABSENCE_ORIGIN,lore:'見えない地形境界を複数の測線として重ねる観測冠。'}),
  item({id:'ob_absence_blank_body',name:'欠相外套・BLANK WEAVE',slot:'body',rarity:'epic',stats:Object.freeze({def:7.8,hp:20,spd:3.8}),branchOrigin:ABSENCE_ORIGIN,lore:'物質が欠ける位相を織り込み、空白域の輪郭だけを外套として残した装備。'}),
  item({id:'uq_observed_blank_compass',sourceStageId:'observedbranch-deepgreen-absence-boss',name:'無相羅針・NULL COMPASS',slot:'accessory',rarity:'legendary',stats:Object.freeze({mag:8.5,spd:5.5,crit:3.5}),unique:true,observedBranch:true,branchOrigin:ABSENCE_ORIGIN,effects:[{trigger:'passive',kind:'actionDiversityBuff',power:.12,turns:3}],lore:'存在しない森を複数の観測差分から逆算する羅針核。同じ行動へ留まらず観測条件を変えるほど戦闘出力が安定する。'}),
]);

export function observedBranchEquipmentById(id){
  return OBSERVED_BRANCH_EQUIPMENT.find(entry=>entry.id===id)||null;
}

export function branchOriginText(itemDef){
  const origin=itemDef?.branchOrigin;
  if(!origin)return'';
  return `Branch Origin：${origin.label} / Technology：${origin.technology} / Divergence：${origin.divergence}`;
}
