/* ============================================================
   Companion 3.0 — Breeding / Genetics
   ============================================================ */
import { COMPANION_SPECIES, COMPANION_NATURES, COMPANION_RARITY } from './companions.js';
import { COMPANION_ROLES, PHASE12_SPECIAL_HYBRIDS } from './phase12CompanionPack.js';
import { CP2_SPECIAL_HYBRIDS } from './contentPackIICD.js';

export const BREEDING_COST = Object.freeze({ gold: 12000, manastone: 18 });

const HYBRIDS = Object.freeze({
  'goblin+slime': { id:'gobslime', name:'ゴブスライム', icon:'🟢', baseStats:{hp:58,mp:10,atk:13,def:9,mag:5,spd:8}, growth:{hp:6,mp:1,atk:2.2,def:1.6,mag:1,spd:.8}, traits:['ぷにぷにボディ','悪知恵'], skills:[{level:1,id:'body_attack'},{level:12,id:'dirty_trick'}] },
  'bat+thunder_beast': { id:'thunder_bat', name:'雷翼蝙蝠', icon:'🦇⚡', baseStats:{hp:66,mp:20,atk:16,def:10,mag:15,spd:24}, growth:{hp:6.4,mp:1.7,atk:2.2,def:1.4,mag:2.2,spd:1.8}, traits:['夜目','雷駆'], skills:[{level:1,id:'bite'},{level:18,id:'thunder_claw'}] },
  'ash_soldier+iron_hound': { id:'ash_hound', name:'灰鉄猟犬', icon:'🔥⚙️', baseStats:{hp:132,mp:14,atk:29,def:28,mag:8,spd:15}, growth:{hp:11.5,mp:1,atk:3.5,def:3.3,mag:1,spd:1.1}, traits:['灰の執念','機械装甲'], skills:[{level:1,id:'iron_fang'},{level:22,id:'ash_slash'}] },
  'crystal_bug+rot_beast': { id:'crystal_rot', name:'晶苔蟲', icon:'💎🌿', baseStats:{hp:118,mp:26,atk:18,def:25,mag:23,spd:10}, growth:{hp:10.2,mp:2,atk:2.2,def:3.1,mag:2.8,spd:.8}, traits:['晶殻','腐食嗅覚'], skills:[{level:1,id:'crystal_ray'},{level:24,id:'rot_bite'}] },
  ...PHASE12_SPECIAL_HYBRIDS,
  ...CP2_SPECIAL_HYBRIDS,
});

for (const def of Object.values(HYBRIDS)) {
  if (!COMPANION_SPECIES[def.id]) COMPANION_SPECIES[def.id] = { ...def, type:'monster', roleName:COMPANION_ROLES[def.role]?.name||null, recruit:{baseChance:0}, hybrid:true };
}

function pairKey(a,b){return [a,b].sort().join('+');}
export function breedingSpecies(parentA,parentB,rng=Math.random){
  if(!parentA||!parentB)return null;
  if(parentA===parentB)return parentA;
  return HYBRIDS[pairKey(parentA,parentB)]?.id || (rng()<.5?parentA:parentB);
}

function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
export function inheritTalent(a={},b={},rng=Math.random){
  const out={};
  for(const stat of ['hp','mp','atk','def','mag','spd']){
    const av=Number(a[stat])||1,bv=Number(b[stat])||1;
    const favored=rng()<.5?av:bv;
    const avg=(av+bv)/2;
    const base=favored*.65+avg*.35;
    const mutation=(rng()-.5)*.06;
    out[stat]=Math.round(clamp(base+mutation,.88,1.34)*1000)/1000;
  }
  return out;
}

export function inheritNature(a,b,rng=Math.random){
  const roll=rng();
  if(roll<.45&&COMPANION_NATURES[a])return a;
  if(roll<.90&&COMPANION_NATURES[b])return b;
  const ids=Object.keys(COMPANION_NATURES);return ids[Math.floor(rng()*ids.length)]||'balanced';
}

export function inheritRarity(a,b,rng=Math.random){
  const ai=Math.max(0,COMPANION_RARITY.indexOf(a)),bi=Math.max(0,COMPANION_RARITY.indexOf(b));
  const lo=Math.min(ai,bi),hi=Math.max(ai,bi);
  let idx=rng()<.70?lo:hi;
  if(rng()<.06)idx=Math.min(COMPANION_RARITY.length-1,idx+1);
  return COMPANION_RARITY[idx];
}

export function inheritTraits(parentA,parentB,childSpeciesId,rng=Math.random){
  const base=new Set(COMPANION_SPECIES[childSpeciesId]?.traits||[]);
  const pool=[...(parentA?.species?.traits||[]),...(parentA?.instance?.inheritedTraits||[]),...(parentB?.species?.traits||[]),...(parentB?.instance?.inheritedTraits||[])].filter(Boolean);
  const inherited=[];
  for(const trait of [...new Set(pool)]){
    if(base.has(trait)||inherited.includes(trait))continue;
    if(rng()<.35)inherited.push(trait);
    if(inherited.length>=2)break;
  }
  return inherited;
}

export function hybridSpeciesIds(){return Object.values(HYBRIDS).map(x=>x.id);}
