/* Phase 13 — Replayability / Challenge Expansion.
   13.4 Rotating Challenges is intentionally omitted by design. */

export const PHASE13_CHALLENGES=Object.freeze([
  {id:'none',name:'通常',desc:'追加制約なし。',enemyHp:1,enemyAtk:1,enemyDef:1,enemySpd:1,healMult:1,rewardMult:1},
  {id:'iron_oath',name:'鋼鉄の誓約',desc:'敵HP+20% / ATK+10% / 報酬+15%',enemyHp:1.20,enemyAtk:1.10,enemyDef:1,enemySpd:1,healMult:1,rewardMult:1.15},
  {id:'glass_route',name:'硝子の進軍',desc:'敵SPD+12% / 回復-35% / 報酬+20%',enemyHp:1,enemyAtk:1,enemyDef:1,enemySpd:1.12,healMult:.65,rewardMult:1.20},
  {id:'break_trial',name:'破砕試練',desc:'敵DEF+18% / ATK+12% / 報酬+25%',enemyHp:1,enemyAtk:1.12,enemyDef:1.18,enemySpd:1,healMult:.85,rewardMult:1.25},
  {id:'boss_rematch_plus',name:'REMATCH+',desc:'再戦Boss強化：HP+35% / ATK+25% / DEF+15% / SPD+8% / 報酬+40%',enemyHp:1.35,enemyAtk:1.25,enemyDef:1.15,enemySpd:1.08,healMult:.80,rewardMult:1.40,rematch:true},
]);

// Challenge conditions are learned through the story instead of being exposed at Lv1.
// A target stage must also be cleared once before any non-normal condition can be applied,
// keeping first-time story play clean and making the system explicitly about replay/records.
export const PHASE13_CHALLENGE_UNLOCKS=Object.freeze({
  none:Object.freeze({chapter:0,capability:'通常戦闘',requiresStageClear:false}),
  iron_oath:Object.freeze({chapter:5,capability:'戦闘記録',requiresStageClear:true}),
  glass_route:Object.freeze({chapter:10,capability:'上級戦闘記録',requiresStageClear:true}),
  break_trial:Object.freeze({chapter:19,capability:'境界条件',requiresStageClear:true}),
  boss_rematch_plus:Object.freeze({chapter:25,capability:'観測条件',requiresStageClear:true,bossOnly:true}),
});

export function phase13ChallengeAvailability(challengeId,{clearedChapter=0,stageCleared=false,bossLike=false}={}){
  const challenge=phase13Challenge(challengeId),rule=PHASE13_CHALLENGE_UNLOCKS[challenge.id]||PHASE13_CHALLENGE_UNLOCKS.none;
  if(challenge.id==='none')return {available:true,challenge,rule,reason:null};
  if(Number(clearedChapter)<rule.chapter)return {available:false,challenge,rule,reason:`第${rule.chapter}章クリアで${rule.capability}を解放`};
  if(rule.requiresStageClear&&!stageCleared)return {available:false,challenge,rule,reason:'このステージを一度クリアすると使用可能'};
  if(rule.bossOnly&&!bossLike)return {available:false,challenge,rule,reason:'Boss / 異界の再戦でのみ使用可能'};
  return {available:true,challenge,rule,reason:null};
}

export const PHASE13_BUILD_FEATS=Object.freeze([
  {id:'artifactless',name:'無装具攻略',desc:'Boss/異界をArtifactなしで撃破。'},
  {id:'shieldless',name:'背水攻略',desc:'Boss/異界を盾なしで撃破。'},
  {id:'master_job',name:'職極め攻略',desc:'MASTER済みJobでBoss/異界を撃破。'},
  {id:'minimalist_rematch',name:'最小構成REMATCH',desc:'Artifact1個以下・盾なしでREMATCH+を撃破。'},
]);

export const PHASE13_TITLES=Object.freeze([
  {id:'challenger',name:'境界の挑戦者',desc:'Challenge Modifier付きで初勝利。'},
  {id:'rematcher',name:'不屈の再戦者',desc:'REMATCH+でBossを撃破。'},
  {id:'artifactless_hunter',name:'無装具の狩人',desc:'無装具攻略を達成。'},
  {id:'record_breaker',name:'記録破り',desc:'5つ以上のステージにPersonal Recordを残す。'},
  {id:'apex_rematcher',name:'五界超越者',desc:'収束観測界をREMATCH+で突破。'},
  {id:'rare_tracker',name:'希少観測追跡者',desc:'Phase 13追跡種に遭遇。'},
]);

export const PHASE13_RARE_HUNTS=Object.freeze({
  'secret-old-king-tomb':{enemyId:'phase13_tomb_hunt',sourceEnemyId:'phase12_tomb_rare',name:'王冠を喰む金霊',chance:.008,dropId:'uq_nameless_crown'},
  'secret-phantom-beast-forest':{enemyId:'phase13_phantom_hunt',sourceEnemyId:'phase12_phantom_rare',name:'七彩角の幻王獣',chance:.006,dropId:'uq_phantom_heart'},
  'secret-dragonbone-canyon':{enemyId:'phase13_dragon_hunt',sourceEnemyId:'phase12_bone_rare',name:'原初竜骸・ZERO',chance:.0045,dropId:'uq_dragonbone_edge'},
  'secret-inverted-library':{enemyId:'phase13_library_hunt',sourceEnemyId:'phase12_library_rare',name:'既読前の観測者',chance:.003,dropId:'uq_inverted_codex'},
  'secret-black-moon-temple':{enemyId:'phase13_moon_hunt',sourceEnemyId:'phase12_moon_rare',name:'月外観測体・UMBRA',chance:.002,dropId:'uq_black_moon_core'},
});

export function phase13Challenge(id){return PHASE13_CHALLENGES.find(x=>x.id===id)||PHASE13_CHALLENGES[0];}
export function phase13RareHunt(stageId){return PHASE13_RARE_HUNTS[stageId]||null;}

export function phase13BuildFeatIds({bossLike=false,artifactCount=0,shield=false,mastered=false,challengeId='none'}={}){
  if(!bossLike)return [];
  const out=[];
  if(artifactCount===0)out.push('artifactless');
  if(!shield)out.push('shieldless');
  if(mastered)out.push('master_job');
  if(challengeId==='boss_rematch_plus'&&artifactCount<=1&&!shield)out.push('minimalist_rematch');
  return out;
}
