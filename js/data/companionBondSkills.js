/* Monster Ranch 1.5 — Bond skills (pure data/helpers)
   Session 5: 絆スキルに「第二の技（SKILL 2）」層を追加。
   絆Lv3でその個体の署名技が解放される —— 種族署名
   （species.bondSkillId）→ 系統テンプレート（family）
   → 汎用フォールバック の順で解決する。
   実測ペース: 絆Lv3は通算EXP 93 ≒ 通常戦闘31回 / ボス戦12回で、
   「使い続けた個体が覚える」中期目標として成立する。 */
import { getCompanionSkill } from './companionSkills.js';
import { getCompanionSpecies } from './companions.js';

let bondLevelResolver=()=>1;
export function setBondLevelResolver(fn){bondLevelResolver=typeof fn==='function'?fn:()=>1;}
export const BOND_SKILLS=Object.freeze({
  bond_strike:{id:'bond_strike',name:'連心撃',type:'damage',stat:'atk',power:1.42,mpCost:2,target:'enemy',priority:7,desc:'絆Lv4で解放。ATK142%の連携攻撃'},
  bond_arcana:{id:'bond_arcana',name:'共鳴波',type:'damage',stat:'mag',power:1.46,mpCost:3,target:'enemy',priority:7,desc:'絆Lv4で解放。MAG146%の共鳴攻撃'},
  soul_fang:{id:'soul_fang',name:'魂牙',type:'damage',stat:'atk',power:1.78,mpCost:6,target:'enemy',priority:10,preferLowHp:true,desc:'絆Lv8で解放。ATK178%の奥義'},
  soul_nova:{id:'soul_nova',name:'魂光',type:'damage',stat:'mag',power:1.82,mpCost:7,target:'enemy',priority:10,desc:'絆Lv8で解放。MAG182%の奥義'},
});

// 系統テンプレート —— 署名技を持たない種族は family で得意技を得る。
export const FAMILY_BOND_SKILLS=Object.freeze({
  beast:'bond_fang',spirit:'bond_will',undead:'bond_grudge',construct:'bond_aegis',slime:'bond_gel',aquatic:'bond_tide',
});
export const BOND_SKILL2_LEVEL=3;

export function bondSignatureSkillFor(companion){
  const species=companion?.species||getCompanionSpecies(companion?.speciesId||companion?.species?.id)||null;
  if(species?.bondSkillId){const skill=getCompanionSkill(species.bondSkillId);if(skill)return skill;}
  const familyId=FAMILY_BOND_SKILLS[species?.family];if(familyId){const skill=getCompanionSkill(familyId);if(skill)return skill;}
  const magical=(companion?.mag||0)>(companion?.atk||0)*1.08;
  return magical?BOND_SKILLS.bond_arcana:BOND_SKILLS.bond_strike;
}
export function bondSkillsFor(companion){
  const lv=Number(companion?.bondLevel)||Number(bondLevelResolver(companion?.id))||1,out=[];
  const magical=(companion?.mag||0)>(companion?.atk||0)*1.08;
  const push=s=>{if(s&&!out.some(x=>x.id===s.id))out.push(s);};
  if(lv>=BOND_SKILL2_LEVEL)push(bondSignatureSkillFor(companion));
  if(lv>=4)push(magical?BOND_SKILLS.bond_arcana:BOND_SKILLS.bond_strike);
  if(lv>=8)push(magical?BOND_SKILLS.soul_nova:BOND_SKILLS.soul_fang);
  return out;
}
