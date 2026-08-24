/* Combat 3.3 — Boss Encounter profiles
   Bossを「高HPの単体敵」ではなく、取り巻き・段階変化・守護役・最終局面を
   持つEncounterとして扱うためのデータ層。既存Boss AIはそのまま残し、
   このプロファイルを薄く上乗せする。 */

const GENERIC_PHASE_NAMES = Object.freeze({
  2:'第二形態',3:'最終局面',4:'決死の猛攻',5:'境界突破',6:'深層覚醒',
  7:'天空の号令',8:'魔界侵蝕',9:'虚無共鳴',11:'灰冠再臨',12:'天雷解放',
  13:'晶界共鳴',14:'腐界開花',
});

function chapterFromType(type){
  const m=/^ch(\d+)_boss$/.exec(type||'');
  return m?Number(m[1]):null;
}
function escortType(chapter,kind){ return chapter ? `ch${chapter}_${kind}` : null; }
function genericProfile(chapter){
  if(!chapter)return null;
  const hard=chapter>=10,mid=chapter>=5;
  return {
    id:`chapter-${chapter}`,
    startEscorts: hard
      ? [{type:escortType(chapter,'tank'),count:1,guard:true},{type:escortType(chapter,'fast'),count:1}]
      : mid ? [{type:escortType(chapter,'tank'),count:1,guard:true}]
      : [],
    guardDefMult: hard?1.65:1.45,
    phases:[
      {ratio:.62,name:GENERIC_PHASE_NAMES[chapter]||'戦況変化',atkMult:1.12,spawn:[{type:escortType(chapter,'fast'),count:1}]},
      {ratio:.28,name:chapter>=11?'境界崩壊':'最後の猛攻',atkMult:1.22,spdMult:1.14,accelerateBossAI:.72},
    ],
  };
}

const SPECIAL = Object.freeze({
  boss_orcking:{
    id:'orc-king',startEscorts:[{type:'tank',count:1,guard:true}],guardDefMult:1.45,
    phases:[
      {ratio:.60,name:'王の号令',atkMult:1.12,spawn:[{type:'grunt',count:2}]},
      {ratio:.25,name:'暴君の咆哮',atkMult:1.30,spdMult:1.12,accelerateBossAI:.75},
    ],
  },
  ch5_boss:{
    id:'flame-emperor',startEscorts:[{type:'ch5_tank',count:1,guard:true},{type:'ch5_fast',count:1}],guardDefMult:1.70,
    phases:[
      {ratio:.70,name:'溶岩の護壁',defMult:1.18,spawn:[{type:'ch5_tank',count:1,guard:true}]},
      {ratio:.35,name:'炎帝覚醒',atkMult:1.30,spdMult:1.16,accelerateBossAI:.68},
    ],
  },
  ch10_boss:{
    id:'true-demon-king',startEscorts:[{type:'ch10_tank',count:2,guard:true},{type:'ch10_fast',count:1}],guardDefMult:1.75,
    phases:[
      {ratio:.72,name:'魔王結界',defMult:1.20,spawn:[{type:'ch10_tank',count:1,guard:true}]},
      {ratio:.42,name:'終焉の号令',atkMult:1.22,spawn:[{type:'ch10_fast',count:2}]},
      {ratio:.18,name:'真・魔王',atkMult:1.32,spdMult:1.20,accelerateBossAI:.58},
    ],
  },
  ch15_boss:{
    id:'ark-zero',startEscorts:[{type:'ch15_tank',count:2,guard:true},{type:'ch15_fast',count:1}],guardDefMult:1.80,
    phases:[
      {ratio:.75,name:'零式防衛陣',defMult:1.22,spawn:[{type:'ch15_tank',count:1,guard:true}]},
      {ratio:.45,name:'過負荷演算',atkMult:1.25,spdMult:1.18,accelerateBossAI:.70},
      {ratio:.20,name:'最終プロトコル',atkMult:1.30,spdMult:1.15,accelerateBossAI:.55,spawn:[{type:'ch15_fast',count:2}]},
    ],
  },
});

export function bossEncounterProfile(type){
  if(SPECIAL[type])return SPECIAL[type];
  return genericProfile(chapterFromType(type));
}

export function bossEncounterHasProfile(type){ return !!bossEncounterProfile(type); }
