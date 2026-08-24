/* Monster Ranch 1.0 — regional species expansion.
   Keep legacy companion IDs stable while expanding recruitable species across all 20 regions. */
import { CHAPTER_SPECS } from './chapters.js';
import { CHAPTER_EXPANSION_16_20 } from './chapters16to20.js';

const LEGACY_NORMAL_IDS = Object.freeze({
  ch11:'ash_soldier', ch12:'thunder_beast', ch13:'crystal_bug', ch14:'rot_beast', ch15:'iron_hound',
});
const LEGACY_NAMES = new Set(['ゴブリン','コウモリ','灰骸兵','雷羽獣','蒼晶蟲','腐苔獣','鉄歯機兵']);
const TRAITS = Object.freeze({
  normal:['野生本能','頑健','執念','群生','異界適応'],
  fast:['先駆け','狩猟眼','幻走','魔力感知','急襲'],
});
const ICONS = ['🐺','🦊','👻','🧚','🦎','🦅','👹','🦋','🦂','🪲','🐗','🦇'];

function slug(ch,role){return `${ch.id}_${role}_companion`;}
function statsFor(num,role){
  const late=Math.max(0,num-10),scale=1+(num-1)*.11+late*.035;
  if(role==='fast') return {baseStats:{hp:Math.round(32*scale),mp:Math.round(12*scale),atk:Math.round(9*scale),def:Math.round(5*scale),mag:Math.round(8*scale),spd:Math.round(14*scale)},growth:{hp:4.6+num*.28,mp:1+num*.04,atk:1.5+num*.10,def:.9+num*.07,mag:1.3+num*.10,spd:1.1+num*.06}};
  return {baseStats:{hp:Math.round(50*scale),mp:Math.round(10*scale),atk:Math.round(12*scale),def:Math.round(8*scale),mag:Math.round(6*scale),spd:Math.round(9*scale)},growth:{hp:5.8+num*.34,mp:.9+num*.04,atk:1.9+num*.12,def:1.4+num*.09,mag:1+num*.08,spd:.8+num*.05}};
}
function chanceFor(num,role){const base=role==='fast'?.095:.08;return Math.max(.022,Math.round((base-num*.0026)*1000)/1000);}
function makeSpecies(ch,role,index){
  const name=ch.enemies[role];
  if(LEGACY_NAMES.has(name)) return null;
  const id=role==='normal'&&LEGACY_NORMAL_IDS[ch.id]?LEGACY_NORMAL_IDS[ch.id]:slug(ch,role);
  const st=statsFor(ch.num,role),trait=TRAITS[role][(ch.num+index)%TRAITS[role].length];
  return [id,{id,name,type:'monster',family:role==='fast'?'spirit':'beast',regionId:ch.id,regionName:ch.name,enemyType:`${ch.id}_${role}`,icon:ICONS[(ch.num*2+index)%ICONS.length],...st,recruit:{baseChance:chanceFor(ch.num,role)},traits:[trait],skills:role==='fast'?[{level:1,id:'bite'},{level:12,id:'sonic'}]:[{level:1,id:'body_attack'},{level:14,id:'club_hit'}]}];
}

const ALL=[...CHAPTER_SPECS,...CHAPTER_EXPANSION_16_20];
export const RANCH_REGION_SPECIES=Object.freeze(Object.fromEntries(ALL.flatMap((ch,i)=>['normal','fast'].map(role=>makeSpecies(ch,role,i)).filter(Boolean))));
export const RANCH_RECRUIT_BY_ENEMY_TYPE=Object.freeze(Object.fromEntries(Object.values(RANCH_REGION_SPECIES).map(s=>[s.enemyType,s.id])));
export const RANCH_SPECIES_TRAIT_EFFECTS=Object.freeze({
  '野生本能':{kind:'lowHpDamage',power:.12,threshold:.50,desc:'HP50%以下の敵へのダメージ +12%'},
  '頑健':{kind:'physicalMitigation',power:.08,desc:'通常攻撃の被ダメージ -8%'},
  '執念':{kind:'lowHpDamage',power:.16,threshold:.35,desc:'HP35%以下の敵へのダメージ +16%'},
  '群生':{kind:'physicalMitigation',power:.06,desc:'通常攻撃の被ダメージ -6%'},
  '異界適応':{kind:'physicalMitigation',power:.10,desc:'通常攻撃の被ダメージ -10%'},
  '先駆け':{kind:'initiativeSpd',power:.12,desc:'行動順判定時のSPD +12%'},
  '狩猟眼':{kind:'lowHpDamage',power:.14,threshold:.50,desc:'HP50%以下の敵へのダメージ +14%'},
  '幻走':{kind:'initiativeSpd',power:.18,desc:'行動順判定時のSPD +18%'},
  '魔力感知':{kind:'initiativeSpd',power:.10,desc:'行動順判定時のSPD +10%'},
  '急襲':{kind:'initiativeSpd',power:.16,desc:'行動順判定時のSPD +16%'},
});
export function ranchSpeciesCount(){return Object.keys(RANCH_REGION_SPECIES).length+8;}
