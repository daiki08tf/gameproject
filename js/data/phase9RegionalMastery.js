/* ============================================================
   Phase 9.4 — Regional Mastery
   Exploration completion now leaves permanent, region-specific rewards.
   ============================================================ */

export const PHASE9_REGIONAL_MASTERY = Object.freeze({
  ch21:{
    chapter:21,name:'灰燼の外縁',hiddenStage:'21-B',seal:'灰燼の道標',
    facility:{id:'ashen_forge',name:'灰界鍛炉',desc:'地域踏破の鍛造知識。ATK +3%。'},
    bonus:{atk:0.03},
  },
  ch22:{
    chapter:22,name:'玻璃凍原',hiddenStage:'22-B',seal:'零下観測記録',
    facility:{id:'mirror_archive',name:'玻璃観測庫',desc:'凍結された術式記録。MAG +3%。'},
    bonus:{mag:0.03},
  },
  ch23:{
    chapter:23,name:'天雷墓標群',hiddenStage:'23-B',seal:'天雷座標核',
    facility:{id:'skyrail_beacon',name:'天路標識塔',desc:'雷路の移動技術。SPD +3%。'},
    bonus:{spd:0.03},
  },
  ch24:{
    chapter:24,name:'虚花の庭園',hiddenStage:'24-B',seal:'根脈記憶標本',
    facility:{id:'root_ranch_lab',name:'根脈育成槽',desc:'魔物育成研究。HP +3%、仲間加入率 +2%。'},
    bonus:{hp:0.03,recruitChanceBonus:0.02},
  },
  ch25:{
    chapter:25,name:'境界王座',hiddenStage:'25-B',seal:'第八鍵観測片',
    facility:{id:'boundary_observatory',name:'境界観測室',desc:'閉じた世界の外を観測する。DEF +3%、第八鍵観測を解禁。'},
    bonus:{def:0.03,nextWorld:true},
  },
});

export function regionalMasteryDef(chapterId){return PHASE9_REGIONAL_MASTERY[chapterId]||null;}
