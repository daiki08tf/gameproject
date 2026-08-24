/* ============================================================
   Companion Skill Engine - data definitions and pure helpers
   ============================================================ */
import { bondSkillsFor } from './companionBondSkills.js';

export const COMPANION_SKILLS = Object.freeze({
  body_attack:{id:'body_attack',name:'たいあたり',type:'damage',stat:'atk',power:1.00,mpCost:0,target:'enemy',priority:1,desc:'ATK100%の物理ダメージ'},
  slime_heal:{id:'slime_heal',name:'ぷるぷる回復',type:'heal',stat:'mag',power:.60,maxHpPct:.32,mpCost:4,target:'self',priority:8,hpThreshold:.50,desc:'HP50%以下で、自分のHPを回復'},
  club_hit:{id:'club_hit',name:'こんぼう打ち',type:'damage',stat:'atk',power:1.05,mpCost:0,target:'enemy',priority:1,desc:'ATK105%の物理ダメージ'},
  dirty_trick:{id:'dirty_trick',name:'だまし討ち',type:'damage',stat:'atk',power:1.35,mpCost:3,target:'enemy',priority:5,preferLowHp:true,desc:'ATK135%のダメージ。弱った敵を優先'},
  bite:{id:'bite',name:'かみつき',type:'damage',stat:'atk',power:1.00,mpCost:0,target:'enemy',priority:1,desc:'ATK100%の物理ダメージ'},
  sonic:{id:'sonic',name:'超音波',type:'debuff',stat:'mag',power:.90,mpCost:4,target:'enemy',priority:6,debuff:{kind:'weakenAtk',power:.15,turns:2},desc:'MAG90%のダメージ＋敵ATK-15%（2ターン）'},
  ash_slash:{id:'ash_slash',name:'灰刃',type:'damage',stat:'atk',power:1.18,mpCost:0,target:'enemy',priority:2,desc:'ATK118%の物理ダメージ'},
  thunder_claw:{id:'thunder_claw',name:'雷爪',type:'damage',stat:'atk',power:1.15,mpCost:0,target:'enemy',priority:2,desc:'ATK115%の高速物理ダメージ'},
  crystal_ray:{id:'crystal_ray',name:'晶光線',type:'damage',stat:'mag',power:1.20,mpCost:0,target:'enemy',priority:2,desc:'MAG120%の魔法ダメージ'},
  rot_bite:{id:'rot_bite',name:'腐牙',type:'damage',stat:'atk',power:1.22,mpCost:0,target:'enemy',priority:2,desc:'ATK122%の物理ダメージ'},
  iron_fang:{id:'iron_fang',name:'黒鉄牙',type:'damage',stat:'atk',power:1.25,mpCost:0,target:'enemy',priority:2,desc:'ATK125%の物理ダメージ'},
});
export function getCompanionSkill(id){return COMPANION_SKILLS[id]||null;}
export function unlockedCompanionSkills(species,level,companion=null){const normal=(species?.skills||[]).filter(entry=>level>=(entry.level||1)).map(entry=>getCompanionSkill(entry.id)).filter(Boolean);return companion?[...normal,...bondSkillsFor(companion)]:normal;}
export function chooseCompanionSkill(species,companion,enemies){
  const skills=unlockedCompanionSkills(species,companion.level||1,companion).filter(skill=>(companion.mp||0)>=(skill.mpCost||0));if(!skills.length)return null;
  const hpRatio=companion.hp/Math.max(1,companion.maxHp),heal=skills.filter(skill=>skill.type==='heal'&&hpRatio<=(skill.hpThreshold??.5)).sort((a,b)=>(b.priority||0)-(a.priority||0))[0];if(heal)return heal;
  const usable=skills.filter(skill=>skill.type!=='heal');if(!usable.length)return null;const sorted=[...usable].sort((a,b)=>(b.priority||0)-(a.priority||0)),top=sorted[0];
  if((top.mpCost||0)>0&&sorted.length>1&&Math.random()>=.65)return sorted.find(skill=>(skill.mpCost||0)===0)||top;return top;
}
