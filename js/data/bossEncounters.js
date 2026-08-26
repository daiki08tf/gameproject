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
  boss_orcking:{id:'orc-king',startEscorts:[{type:'tank',count:1,guard:true}],guardDefMult:1.45,phases:[{ratio:.60,name:'王の号令',atkMult:1.12,spawn:[{type:'grunt',count:2}]},{ratio:.25,name:'暴君の咆哮',atkMult:1.30,spdMult:1.12,accelerateBossAI:.75}]},
  ch5_boss:{id:'flame-emperor',startEscorts:[{type:'ch5_tank',count:1,guard:true},{type:'ch5_fast',count:1}],guardDefMult:1.70,phases:[{ratio:.70,name:'溶岩の護壁',defMult:1.18,spawn:[{type:'ch5_tank',count:1,guard:true}]},{ratio:.35,name:'炎帝覚醒',atkMult:1.30,spdMult:1.16,accelerateBossAI:.68}]},
  ch10_boss:{id:'true-demon-king',startEscorts:[{type:'ch10_tank',count:2,guard:true},{type:'ch10_fast',count:1}],guardDefMult:1.75,phases:[{ratio:.72,name:'魔王結界',defMult:1.20,spawn:[{type:'ch10_tank',count:1,guard:true}]},{ratio:.42,name:'終焉の号令',atkMult:1.22,spawn:[{type:'ch10_fast',count:2}]},{ratio:.18,name:'真・魔王',atkMult:1.32,spdMult:1.20,accelerateBossAI:.58}]},
  ch15_boss:{id:'ark-zero',startEscorts:[{type:'ch15_tank',count:2,guard:true},{type:'ch15_fast',count:1}],guardDefMult:1.80,phases:[{ratio:.75,name:'零式防衛陣',defMult:1.22,spawn:[{type:'ch15_tank',count:1,guard:true}]},{ratio:.45,name:'過負荷演算',atkMult:1.25,spdMult:1.18,accelerateBossAI:.70},{ratio:.20,name:'最終プロトコル',atkMult:1.30,spdMult:1.15,accelerateBossAI:.55,spawn:[{type:'ch15_fast',count:2}]}]},
  ch21_boss:{id:'cinder-lord-vulcan',dangerTags:['burn','guard','break'],counterHint:'守護兵を落とし、再燃直後のBreak低下を一気に割る。',startEscorts:[{type:'ch21_tank',count:1,guard:true},{type:'ch21_fast',count:1}],guardDefMult:1.86,phases:[{ratio:.76,name:'焼鉄城壁',defMult:1.18,spawn:[{type:'ch21_tank',count:1,guard:true}]},{ratio:.48,name:'灰燼再燃',atkMult:1.23,breakGaugePct:.56,spawn:[{type:'ch21_fast',count:2}]},{ratio:.19,name:'心火解放',atkMult:1.34,spdMult:1.14,accelerateBossAI:.57,breakGaugePct:.42}]},
  ch22_boss:{id:'zero-king-crystalia',dangerTags:['slow','sustain','break'],counterHint:'回復役を優先し、絶対零界で縮むBreak Gaugeを攻勢へ変える。',startEscorts:[{type:'ch22_tank',count:1,guard:true},{type:'ch22_fast',count:1}],guardDefMult:1.90,phases:[{ratio:.74,name:'鏡氷結界',defMult:1.21,spawn:[{type:'ch22_tank',count:1,guard:true}]},{ratio:.44,name:'零度共鳴',spdMult:1.16,spawn:[{type:'ch22_fast',count:1}],breakGaugePct:.62},{ratio:.17,name:'絶対零界',atkMult:1.30,defMult:1.08,accelerateBossAI:.55,breakGaugePct:.38}]},
  ch23_boss:{id:'sky-burial-indrag',dangerTags:['haste','multi','break'],counterHint:'加速役を放置しない。天雷過給はBreak Gaugeも崩れる最大の反撃機会。',startEscorts:[{type:'ch23_fast',count:2},{type:'ch23_tank',count:1,guard:true}],guardDefMult:1.88,phases:[{ratio:.72,name:'雷葬陣',spdMult:1.16,spawn:[{type:'ch23_fast',count:1}]},{ratio:.39,name:'天雷過給',atkMult:1.28,spdMult:1.20,breakGaugePct:.48,accelerateBossAI:.66},{ratio:.14,name:'雷神墜とし',atkMult:1.38,spdMult:1.16,breakGaugePct:.32,accelerateBossAI:.50}]},
  ch24_boss:{id:'void-flower-elsia',dangerTags:['poison','heal','attrition'],counterHint:'再生役を倒して長期戦を拒否。開花時のBreak低下から一気に押し切る。',startEscorts:[{type:'ch24_tank',count:1,guard:true},{type:'ch24_midboss',count:1}],guardDefMult:1.92,phases:[{ratio:.78,name:'根脈結界',defMult:1.20,spawn:[{type:'ch24_tank',count:1,guard:true}]},{ratio:.47,name:'虚花開花',atkMult:1.20,spawn:[{type:'ch24_fast',count:1},{type:'ch24_midboss',count:1}],breakGaugePct:.55},{ratio:.18,name:'記憶喰いの満開',atkMult:1.32,spdMult:1.13,accelerateBossAI:.54,breakGaugePct:.40}]},
  ch25_boss:{id:'boundary-king-archeon',dangerTags:['guard','resource','phase','break'],counterHint:'七鍵守護機を崩し、位相反転ごとのBreak窓を逃さない。最終局面は短期決戦。',startEscorts:[{type:'ch25_tank',count:2,guard:true},{type:'ch25_fast',count:1}],guardDefMult:2.00,phases:[{ratio:.82,name:'七鍵封鎖',defMult:1.18,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.58,name:'位相反転',atkMult:1.18,spdMult:1.12,breakGaugePct:.64,spawn:[{type:'ch25_fast',count:1}]},{ratio:.34,name:'第八鍵・観測破棄',atkMult:1.26,defMult:1.10,breakGaugePct:.46,accelerateBossAI:.64},{ratio:.12,name:'境界王座崩壊',atkMult:1.40,spdMult:1.20,breakGaugePct:.28,accelerateBossAI:.46}]},
  raid_archeon:{id:'raid-boundary-king-archeon',dangerTags:['guard','resource','phase','break'],counterHint:'守護機を優先して排除し、位相反転直後のBreak窓へ火力を集中する。終盤は長期戦を避ける。',startEscorts:[{type:'ch25_tank',count:2,guard:true},{type:'ch25_fast',count:1}],guardDefMult:2.12,phases:[{ratio:.84,name:'七鍵・再封鎖',defMult:1.16,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.62,name:'零界位相反転',atkMult:1.16,spdMult:1.10,breakGaugePct:.70,spawn:[{type:'ch25_fast',count:2}]},{ratio:.36,name:'境界観測崩壊',atkMult:1.26,defMult:1.08,breakGaugePct:.42,accelerateBossAI:.60,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.12,name:'断界王座・最終観測',atkMult:1.38,spdMult:1.20,breakGaugePct:.24,accelerateBossAI:.44}]},

  // Phase 12.7 — horizontal signature bosses.
  phase12_tomb_king:{id:'nameless-king-regnas',dangerTags:['guard','counter','break'],counterHint:'墓守近衛のGuardを外し、王印反転後の狭いBreak窓へ集中する。',startEscorts:[{type:'phase12_tomb_guard',count:2,guard:true},{type:'phase12_tomb_magus',count:1}],guardDefMult:1.92,phases:[{ratio:.72,name:'王墓封陣',defMult:1.18,spawn:[{type:'phase12_tomb_guard',count:1,guard:true}]},{ratio:.41,name:'王印反転',atkMult:1.22,breakGaugePct:.52},{ratio:.15,name:'名なき戴冠',atkMult:1.34,spdMult:1.12,breakGaugePct:.30,accelerateBossAI:.52}]},
  phase12_phantom_lord:{id:'phantom-lord-alcyon',dangerTags:['speed','element','adds'],counterHint:'季節妖精を減らし、属性転換の直後にBreakを狙う。',startEscorts:[{type:'phase12_phantom_sprite',count:2},{type:'phase12_phantom_horn',count:1,guard:true}],guardDefMult:1.82,phases:[{ratio:.70,name:'四季転輪',spdMult:1.14,spawn:[{type:'phase12_phantom_sprite',count:1}]},{ratio:.38,name:'幻獣分身',atkMult:1.22,spawn:[{type:'phase12_phantom_horn',count:2}],breakGaugePct:.50},{ratio:.13,name:'白虹疾駆',atkMult:1.30,spdMult:1.24,breakGaugePct:.34,accelerateBossAI:.50}]},
  phase12_bone_tyrant:{id:'dragonbone-emperor-valdrake',dangerTags:['break','armor','burst'],counterHint:'髄晶騎士を崩し、骨格共振で露出するBreak窓を最大火力へ変える。',startEscorts:[{type:'phase12_marrow_knight',count:2,guard:true}],guardDefMult:2.02,phases:[{ratio:.75,name:'竜骸装甲',defMult:1.22},{ratio:.46,name:'髄晶共振',atkMult:1.24,breakGaugePct:.44,spawn:[{type:'phase12_bone_drake',count:2}]},{ratio:.16,name:'始祖骨格起動',atkMult:1.38,spdMult:1.10,breakGaugePct:.26,accelerateBossAI:.48}]},
  phase12_archive_master:{id:'inverted-librarian-paradoxa',dangerTags:['magic','analysis','phase'],counterHint:'索引霊を処理し、因果反転で縮むBreak Gaugeを解析して先回りする。',startEscorts:[{type:'phase12_index_wisp',count:2},{type:'phase12_reverse_scribe',count:1}],guardDefMult:1.84,phases:[{ratio:.73,name:'索引封鎖',defMult:1.14,spawn:[{type:'phase12_index_wisp',count:1}]},{ratio:.43,name:'因果逆読',atkMult:1.26,spdMult:1.14,breakGaugePct:.48},{ratio:.14,name:'未刊結末',atkMult:1.34,spdMult:1.18,breakGaugePct:.28,accelerateBossAI:.47}]},
  phase12_moon_deity:{id:'black-moon-noctil',dangerTags:['heal','break','observer','phase'],counterHint:'蝕眼を優先し、遮断解除のたびに短く開くBreak窓へ全力を合わせる。',startEscorts:[{type:'phase12_moon_eye',count:2},{type:'phase12_moon_acolyte',count:1,guard:true}],guardDefMult:2.06,phases:[{ratio:.80,name:'黒月遮断膜',defMult:1.18,spawn:[{type:'phase12_moon_acolyte',count:1,guard:true}]},{ratio:.57,name:'蝕信号受信',atkMult:1.20,spdMult:1.12,breakGaugePct:.58,spawn:[{type:'phase12_moon_eye',count:1}]},{ratio:.31,name:'月外同期',atkMult:1.29,breakGaugePct:.38,accelerateBossAI:.58},{ratio:.10,name:'黒月完全蝕',atkMult:1.42,spdMult:1.20,breakGaugePct:.20,accelerateBossAI:.42}]},
});

export function bossEncounterProfile(type){
  if(SPECIAL[type])return SPECIAL[type];
  return genericProfile(chapterFromType(type));
}
export function bossEncounterHasProfile(type){ return !!bossEncounterProfile(type); }
