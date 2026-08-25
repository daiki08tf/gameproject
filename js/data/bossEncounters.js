/* Combat 3.3 / Phase 9.2 — Boss Encounter profiles
   Bossを「高HPの単体敵」ではなく、取り巻き・段階変化・守護役・Break局面を
   持つEncounterとして扱う。Phase 9.2では外縁世界5Bossを完全個別設計する。 */

const GENERIC_PHASE_NAMES = Object.freeze({
  2:'第二形態',3:'最終局面',4:'決死の猛攻',5:'境界突破',6:'深層覚醒',
  7:'天空の号令',8:'魔界侵蝕',9:'虚無共鳴',11:'灰冠再臨',12:'天雷解放',
  13:'晶界共鳴',14:'腐界開花',21:'灰燼再燃',22:'零度共鳴',23:'天雷過給',24:'虚花開花',25:'境界反転',
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

  // Phase 9.2 — 外縁世界Bosses
  ch21_boss:{
    id:'cinder-lord-vulcan',dangerTags:['burn','guard','break'],counterHint:'守護兵を落とし、再燃直後のBreak低下を一気に割る。',
    startEscorts:[{type:'ch21_tank',count:1,guard:true},{type:'ch21_fast',count:1}],guardDefMult:1.86,
    phases:[
      {ratio:.76,name:'焼鉄城壁',defMult:1.18,spawn:[{type:'ch21_tank',count:1,guard:true}]},
      {ratio:.48,name:'灰燼再燃',atkMult:1.23,breakGaugePct:.56,spawn:[{type:'ch21_fast',count:2}]},
      {ratio:.19,name:'心火解放',atkMult:1.34,spdMult:1.14,accelerateBossAI:.57,breakGaugePct:.42},
    ],
  },
  ch22_boss:{
    id:'zero-king-crystalia',dangerTags:['slow','sustain','break'],counterHint:'回復役を優先し、絶対零界で縮むBreak Gaugeを攻勢へ変える。',
    startEscorts:[{type:'ch22_tank',count:1,guard:true},{type:'ch22_fast',count:1}],guardDefMult:1.90,
    phases:[
      {ratio:.74,name:'鏡氷結界',defMult:1.21,spawn:[{type:'ch22_tank',count:1,guard:true}]},
      {ratio:.44,name:'零度共鳴',spdMult:1.16,spawn:[{type:'ch22_fast',count:1}],breakGaugePct:.62},
      {ratio:.17,name:'絶対零界',atkMult:1.30,defMult:1.08,accelerateBossAI:.55,breakGaugePct:.38},
    ],
  },
  ch23_boss:{
    id:'sky-burial-indrag',dangerTags:['haste','multi','break'],counterHint:'加速役を放置しない。天雷過給はBreak Gaugeも崩れる最大の反撃機会。',
    startEscorts:[{type:'ch23_fast',count:2},{type:'ch23_tank',count:1,guard:true}],guardDefMult:1.88,
    phases:[
      {ratio:.72,name:'雷葬陣',spdMult:1.16,spawn:[{type:'ch23_fast',count:1}]},
      {ratio:.39,name:'天雷過給',atkMult:1.28,spdMult:1.20,breakGaugePct:.48,accelerateBossAI:.66},
      {ratio:.14,name:'雷神墜とし',atkMult:1.38,spdMult:1.16,breakGaugePct:.32,accelerateBossAI:.50},
    ],
  },
  ch24_boss:{
    id:'void-flower-elsia',dangerTags:['poison','heal','attrition'],counterHint:'再生役を倒して長期戦を拒否。開花時のBreak低下から一気に押し切る。',
    startEscorts:[{type:'ch24_tank',count:1,guard:true},{type:'ch24_midboss',count:1}],guardDefMult:1.92,
    phases:[
      {ratio:.78,name:'根脈結界',defMult:1.20,spawn:[{type:'ch24_tank',count:1,guard:true}]},
      {ratio:.47,name:'虚花開花',atkMult:1.20,spawn:[{type:'ch24_fast',count:1},{type:'ch24_midboss',count:1}],breakGaugePct:.55},
      {ratio:.18,name:'記憶喰いの満開',atkMult:1.32,spdMult:1.13,accelerateBossAI:.54,breakGaugePct:.40},
    ],
  },
  ch25_boss:{
    id:'boundary-king-archeon',dangerTags:['guard','resource','phase','break'],counterHint:'七鍵守護機を崩し、位相反転ごとのBreak窓を逃さない。最終局面は短期決戦。',
    startEscorts:[{type:'ch25_tank',count:2,guard:true},{type:'ch25_fast',count:1}],guardDefMult:2.00,
    phases:[
      {ratio:.82,name:'七鍵封鎖',defMult:1.18,spawn:[{type:'ch25_tank',count:1,guard:true}]},
      {ratio:.58,name:'位相反転',atkMult:1.18,spdMult:1.12,breakGaugePct:.64,spawn:[{type:'ch25_fast',count:1}]},
      {ratio:.34,name:'第八鍵・観測破棄',atkMult:1.26,defMult:1.10,breakGaugePct:.46,accelerateBossAI:.64},
      {ratio:.12,name:'境界王座崩壊',atkMult:1.40,spdMult:1.20,breakGaugePct:.28,accelerateBossAI:.46},
    ],
  },
});

export function bossEncounterProfile(type){
  if(SPECIAL[type])return SPECIAL[type];
  return genericProfile(chapterFromType(type));
}

export function bossEncounterHasProfile(type){ return !!bossEncounterProfile(type); }
