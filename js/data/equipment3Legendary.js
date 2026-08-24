/* ============================================================
   Equipment 3.0 E4 — Legendary Effects / Cursed Affixes
   ============================================================ */

export const LEGENDARY_EFFECTS = Object.freeze({
  thunderheart:{name:'雷神の心臓',desc:'会心時25%で強力な追撃が発生する',effects:[{trigger:'onCrit',kind:'critExtraAttack',chance:.25,power:.75,perActionCap:1}]},
  execution_chain:{name:'処刑連鎖',desc:'HP25%以下の敵へのダメージが大きく上昇する',effects:[{trigger:'passive',kind:'executioner',power:.35,hpThreshold:.25}]},
  soul_harvest:{name:'魂喰らい',desc:'撃破時にHPとMPを同時に回復する',effects:[{trigger:'onKill',kind:'healOnKill',power:.05},{trigger:'onKill',kind:'mpOnKill',power:.04}]},
  arcane_echo:{name:'魔導反響',desc:'じゅもん使用時12%で追加発動する',effects:[{trigger:'onSkill',kind:'spellEcho',chance:.12,spellOnly:true}]},
  fortress_counter:{name:'不落の反撃',desc:'ぼうぎょ後に強力な反撃を行う',effects:[{trigger:'onGuard',kind:'guardCounter',power:.8}]},
  venom_bloom:{name:'毒華',desc:'攻撃時18%で強力なDoTを付与する',effects:[{trigger:'onHit',kind:'hitApplyDot',chance:.18,power:.5,dotTurns:3,maxStacks:4,perActionCap:1}]},
});
export const CURSED_AFFIXES=Object.freeze({
  blood_contract:{name:'血の契約',desc:'最大HP-30% / Damage+50%',statMult:{hp:.70},effects:[{trigger:'passive',kind:'dmgBonusAdd',power:.50}]},
  mana_overload:{name:'魔神の知識',desc:'最大MP-30% / じゅもんDamage+45%',statMult:{mp:.70},effects:[{trigger:'passive',kind:'spellDmgAdd',power:.45}]},
  glass_blade:{name:'修羅の刃',desc:'DEF-25% / Damage+35%',statMult:{def:.75},effects:[{trigger:'passive',kind:'dmgBonusAdd',power:.35}]},
});
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function deterministicUnit(key){const s=String(key||'legendary');let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return((h>>>0)%1000000)/999999;}
function pickDeterministic(obj,key){const ids=Object.keys(obj);if(!ids.length)return null;const index=Math.min(ids.length-1,Math.floor(deterministicUnit(key)*ids.length));return ids[index];}
export function legendaryEffectChance(item,itemPower,ctx={}){const rarity=item?.rarity;if(!['epic','legendary','mythic'].includes(rarity))return 0;let chance=rarity==='mythic'?.40:rarity==='legendary'?.20:itemPower>=900?.04:0;chance+=Math.min(.12,Math.max(0,Number(itemPower)-1000)/75000);if(ctx.boss)chance+=.05;if(ctx.ex)chance+=.08;if(ctx.nemesis)chance+=.12;chance+=Math.max(0,Number(ctx.legendaryChanceAdd)||0);return clamp(chance,0,.70);}
export function cursedAffixChance(item,itemPower,ctx={}){if(!item||!['epic','legendary','mythic'].includes(item.rarity))return 0;let chance=item.rarity==='mythic'?.06:item.rarity==='legendary'?.035:.01;chance+=Math.min(.08,Math.max(0,Number(itemPower)-1000)/100000);if(ctx.ex)chance+=.02;if(ctx.nemesis)chance+=.04;chance*=Math.max(1,Number(ctx.cursedChanceMult)||1);return clamp(chance,0,.30);}
export function rollLegendaryPackage(item,itemPower,ctx={},instanceId=''){const legendaryChance=legendaryEffectChance(item,itemPower,ctx),curseChance=cursedAffixChance(item,itemPower,ctx),legendaryEffectId=deterministicUnit(`${instanceId}:legendary:chance`)<legendaryChance?pickDeterministic(LEGENDARY_EFFECTS,`${instanceId}:legendary:pick`):null,curseId=deterministicUnit(`${instanceId}:curse:chance`)<curseChance?pickDeterministic(CURSED_AFFIXES,`${instanceId}:curse:pick`):null;return{legendaryEffectId,curseId,legendaryChance,curseChance};}
export function getLegendaryEffect(id){return id?LEGENDARY_EFFECTS[id]||null:null;}
export function getCursedAffix(id){return id?CURSED_AFFIXES[id]||null:null;}
