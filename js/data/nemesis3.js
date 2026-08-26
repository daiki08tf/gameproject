/* Phase 10.2 — Nemesis 3.0 */
export const NEMESIS_MAX_LEVEL=15;

export const NEMESIS_TRAITS=Object.freeze({
  bloodthirst:{id:'bloodthirst',name:'血喰らい',desc:'攻撃力が上昇し、瀕死時はさらに凶暴化する。',atk:1.12,enrageAtk:1.18},
  ironhide:{id:'ironhide',name:'鉄皮',desc:'防御力と最大HPが上昇する。',hp:1.10,def:1.16},
  quickstep:{id:'quickstep',name:'瞬歩',desc:'速度が上昇し、先手を取りやすくなる。',spd:1.18},
  executioner:{id:'executioner',name:'処刑本能',desc:'長期戦ほど攻撃力が増す。',roundAtk:.035},
  adaptive:{id:'adaptive',name:'適応装甲',desc:'受けた戦いから学び、防御と速度を底上げする。',def:1.09,spd:1.08},
  hoarder:{id:'hoarder',name:'蒐集者',desc:'討伐時の賞金首の証と戦利品価値が増える。',reward:1.25},
});

const TRAIT_ORDER=Object.freeze(['bloodthirst','ironhide','quickstep','executioner','adaptive','hoarder']);

export function nemesisTraitIdsForLevel(level=0){
  const count=Math.min(TRAIT_ORDER.length,Math.floor(Math.max(0,level)/3));
  return TRAIT_ORDER.slice(0,count);
}
export function nemesisTraitsFor(info={}){
  const ids=Array.isArray(info.traits)&&info.traits.length?info.traits:nemesisTraitIdsForLevel(info.level||0);
  return ids.map(id=>NEMESIS_TRAITS[id]).filter(Boolean);
}
export function nemesisTitleForLevel(level=0){
  if(level>=12)return '【終焉を学ぶ者】';
  if(level>=8)return '【宿命の天敵】';
  if(level>=5)return '【執念の追跡者】';
  if(level>=3)return '【二度殺し】';
  if(level>=1)return '【勇者殺し】';
  return '';
}
export function nemesisHuntBonus(mode){
  if(mode==='preempt')return{playerAdvantage:'preempt',enemyHp:.90,reward:1.05,label:'先制襲撃'};
  if(mode==='ambush')return{playerAdvantage:'ambush',enemyAtk:.92,enemySpd:.88,reward:1.10,label:'待ち伏せ'};
  if(mode==='final')return{enemyHp:1.08,enemyAtk:1.06,reward:1.35,label:'最終決戦'};
  if(mode==='highRisk')return{enemyHp:1.18,enemyAtk:1.14,enemyDef:1.08,reward:1.70,label:'宝域狩り'};
  return{reward:1,label:null};
}
export function nemesisWeaknessBonus(intel=[]){
  const set=new Set(intel||[]);
  return{enemyDef:set.has('weakness')?.90:1,enemySpd:set.has('witness')?.94:1,reward:set.has('mutation')?1.08:1};
}
