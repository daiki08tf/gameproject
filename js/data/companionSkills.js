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

  /* ============================================================
     Session 5 — 絆スキル（SKILL 2）。
     絆Lv3で解放される「その個体の得意技」。解決順:
     species.bondSkillId → FAMILY_BOND_SKILLS[species.family]
     → 汎用絆技（companionBondSkills.js）。既存語彙だけを使い、
     新規の実行経路は追加しない。
     - bonusVsDebuff  … 仲間の弱体が残る敵へ威力×指定値
     - allyDownBonus  … 倒れた仲間がいる間は威力×指定値（仇討ち）
     - target:'ally'  … HP割合が最も低い仲間を回復
     - target:'player'… プレイヤーを回復（絆の手当）
     ============================================================ */
  bond_fang:{id:'bond_fang',name:'連牙乱撃',type:'damage',stat:'atk',power:1.34,mpCost:3,target:'enemy',priority:7,desc:'絆Lv3で解放。ATK134%の連続噛み'},
  bond_will:{id:'bond_will',name:'精霊の共鳴',type:'damage',stat:'mag',power:1.40,mpCost:3,target:'enemy',priority:7,desc:'絆Lv3で解放。MAG140%の共鳴波'},
  bond_grudge:{id:'bond_grudge',name:'怨嗟の爪',type:'damage',stat:'atk',power:1.30,mpCost:4,target:'enemy',priority:7,bonusVsDebuff:1.35,desc:'絆Lv3で解放。弱体中の敵へ+35%'},
  bond_aegis:{id:'bond_aegis',name:'装甲照準',type:'debuff',stat:'mag',power:1.05,mpCost:2,target:'enemy',priority:6,debuff:{kind:'weakenAtk',power:.20,turns:3},desc:'絆Lv3で解放。MAG105%＋敵ATK-20%（3ターン）'},
  bond_gel:{id:'bond_gel',name:'粘液再生',type:'heal',stat:'mag',power:.80,maxHpPct:.10,mpCost:3,target:'self',priority:5,hpThreshold:.6,desc:'絆Lv3で解放。自身を回復'},
  bond_tide:{id:'bond_tide',name:'潮の奔流',type:'damage',stat:'mag',power:1.38,mpCost:3,target:'enemy',priority:7,desc:'絆Lv3で解放。MAG138%の潮打ち'},
  slime_rebind:{id:'slime_rebind',name:'親和粘結',type:'heal',stat:'mag',power:.85,mpCost:4,target:'ally',priority:6,allyHpThreshold:.85,desc:'絆Lv3で解放。最も傷ついた仲間をMAG85%回復'},
  goblin_rally:{id:'goblin_rally',name:'群れの報復',type:'damage',stat:'atk',power:1.30,mpCost:3,target:'enemy',priority:7,allyDownBonus:1.35,desc:'絆Lv3で解放。仲間が倒れていると威力+35%'},
  beast_pursuit:{id:'beast_pursuit',name:'雷追',type:'damage',stat:'atk',power:1.45,mpCost:4,target:'enemy',priority:8,bonusVsDebuff:1.40,desc:'絆Lv3で解放。弱体中の獲物を追撃'},
  fox_blaze:{id:'fox_blaze',name:'焔舞',type:'damage',stat:'mag',power:1.40,mpCost:4,target:'enemy',priority:7,debuff:{kind:'weakenAtk',power:.10,turns:2},desc:'絆Lv3で解放。MAG140%＋敵ATK-10%（2ターン）'},
  deer_ward:{id:'deer_ward',name:'晶壁の祈り',type:'heal',stat:'mag',power:.80,mpCost:4,target:'ally',priority:6,allyHpThreshold:.85,desc:'絆Lv3で解放。最も傷ついた仲間をMAG80%回復'},
  wisp_void:{id:'wisp_void',name:'影喰',type:'damage',stat:'mag',power:1.45,mpCost:4,target:'enemy',priority:8,bonusVsDebuff:1.40,desc:'絆Lv3で解放。弱った敵の影を喰らう'},
  roamer_feast:{id:'roamer_feast',name:'宝喰みの大顎',type:'damage',stat:'atk',power:1.55,mpCost:5,target:'enemy',priority:8,preferLowHp:true,desc:'絆Lv3で解放。瀕死の獲物を喰らい尽くす'},
  roamer_mirror:{id:'roamer_mirror',name:'鏡界連閃',type:'damage',stat:'atk',power:1.45,mpCost:5,target:'enemy',priority:9,preferLowHp:true,desc:'絆Lv3で解放。鏡界を渡る連撃'},
  roamer_ward:{id:'roamer_ward',name:'獄卒の庇護',type:'heal',stat:'mag',power:1.0,mpCost:5,target:'ally',priority:6,allyHpThreshold:.9,desc:'絆Lv3で解放。最も傷ついた仲間をMAG100%回復'},
  roamer_duel:{id:'roamer_duel',name:'遍歴の抜剣',type:'damage',stat:'atk',power:1.60,mpCost:5,target:'enemy',priority:8,bonusVsDebuff:1.45,desc:'絆Lv3で解放。弱体した敵への一閃+45%'},
  roamer_hymn:{id:'roamer_hymn',name:'無名の頌',type:'heal',stat:'mag',power:.75,maxHpPct:.06,mpCost:5,target:'player',priority:6,playerHpThreshold:.7,desc:'絆Lv3で解放。絆の手当——プレイヤーを回復'},
  denlord_call:{id:'denlord_call',name:'獣主の咆哮',type:'damage',stat:'atk',power:1.50,mpCost:5,target:'enemy',priority:8,debuff:{kind:'weakenAtk',power:.15,turns:3},desc:'絆Lv3で解放。ATK150%＋敵ATK-15%（3ターン）'},
  tidelord_surge:{id:'tidelord_surge',name:'潮主の満引',type:'damage',stat:'mag',power:1.55,mpCost:5,target:'enemy',priority:8,desc:'絆Lv3で解放。潮の満ち引きを操る主の一撃'},
  ashlord_choir:{id:'ashlord_choir',name:'灰主の葬唱',type:'damage',stat:'mag',power:1.50,mpCost:5,target:'enemy',priority:8,debuff:{kind:'weakenAtk',power:.15,turns:3},desc:'絆Lv3で解放。MAG150%＋敵ATK-15%（3ターン）'},
  record_recast:{id:'record_recast',name:'記録の書き直し',type:'damage',stat:'mag',power:1.45,mpCost:4,target:'enemy',priority:8,bonusVsDebuff:1.35,desc:'絆Lv3で解放。分岐層の記録体だけが持つ改竄撃'},
});
export function getCompanionSkill(id){return COMPANION_SKILLS[id]||null;}
export function unlockedCompanionSkills(species,level,companion=null){const normal=(species?.skills||[]).filter(entry=>level>=(entry.level||1)).map(entry=>getCompanionSkill(entry.id)).filter(Boolean);return companion?[...normal,...bondSkillsFor(companion)]:normal;}
export function chooseCompanionSkill(species,companion,enemies,ctx={}){
  const skills=unlockedCompanionSkills(species,companion.level||1,companion).filter(skill=>(companion.mp||0)>=(skill.mpCost||0));if(!skills.length)return null;
  const companions=ctx.companions||[companion],player=ctx.player||null;
  const hpRatio=companion.hp/Math.max(1,companion.maxHp);
  // 回復は対象別に条件評価する: self=自分、ally=最も傷ついた仲間、player=主人
  const heals=skills.filter(skill=>skill.type==='heal').filter(skill=>{
    if(skill.target==='player')return!!player&&player.hp/Math.max(1,player.maxHp)<=(skill.playerHpThreshold??.5);
    if(skill.target==='ally')return companions.some(c=>!c.down&&c.hp>0&&c.hp/Math.max(1,c.maxHp)<=(skill.allyHpThreshold??.5));
    return hpRatio<=(skill.hpThreshold??.5);
  });
  if(heals.length)return heals.sort((a,b)=>(b.priority||0)-(a.priority||0))[0];
  const usable=skills.filter(skill=>skill.type!=='heal');if(!usable.length)return null;
  const debuffedAlive=(enemies||[]).some(e=>e._companionAtkDebuffTurns>0);
  const woundedAlive=(enemies||[]).some(e=>e.hp/Math.max(1,e.maxHp)<=.35);
  const scored=usable.map(skill=>{
    let score=(skill.priority||0)*10;
    if(skill.debuff&&debuffedAlive)score-=9;                       // 弱体は重ねがけしない
    if(skill.bonusVsDebuff)score+=debuffedAlive?7:-4;              // 弱体を捕食する技
    if(skill.preferLowHp)score+=woundedAlive?7:-2;                 // 瀕死への撃ち抜き
    if(skill.allyDownBonus&&companions.some(c=>c!==companion&&(c.down||c.hp<=0)))score+=6;
    return{skill,score};
  }).sort((a,b)=>b.score-a.score);
  const top=scored[0].skill;
  if((top.mpCost||0)>0&&scored.length>1&&Math.random()>=.65)return scored.map(x=>x.skill).find(s=>(s.mpCost||0)===0)||top;
  return top;
}
