/* ============================================================
   Post-Gear Endgame — CP3 Deep Survey reconciliation
   ------------------------------------------------------------
   Reuses Exploration / Secret Realm / Abyss challenge / Loot3 target-affix
   systems after Gear Overhaul Phases 0–9. No new activity currency, save root,
   timed loop, pity meter or parallel progression track.
   ============================================================ */
import { buildAbyssStage } from './abyss.js';
import { abyssChallengeMultiplier } from './abyssChallenges.js';
import {
  conditionRewardProfile,
  encodeDeepSurveyConditionStageId,
  resolveDeepSurveyConditionIds,
  surveyCondition,
} from './postCp3SurveyConditions.js';

const D = (id, realmId, realmName, discoveredName, depth, role, ruleName, rule, challengeIds, unlockDiscoveries, inspectText, rewardHint, tags, preferredAffixIds, targetAffixChance, legendaryChanceAdd=0) => Object.freeze({
  id, realmId, realmName, discoveredName, depth, role, ruleName, rule,
  challengeIds:Object.freeze(challengeIds),
  unlockDiscoveries:Object.freeze(unlockDiscoveries),
  inspectText:Object.freeze(inspectText),
  rewardHint,
  tags:Object.freeze(tags),
  preferredAffixIds:Object.freeze(preferredAffixIds),
  targetAffixChance,
  legendaryChanceAdd,
});

export const CP3_DEEP_SURVEYS = Object.freeze([
  D('cp3_deep_ash','secret-cp3-deep-ash','返信炉床・深層観測','返信炉床のさらに下へ続く保守孔',3201,'耐久・反撃・継戦ビルド向け','返灰圧縮層','敵HP+30% / 回復量-50%。受け切る耐久、ガード反撃、吸収維持が強い。',['vitality','drought'],['cp3:boss:cp3_boss_ack_warden:cleared','cp3:boss:cp3_boss_cinder_reply:cleared'],['二体の返答個体が消えた後、返信炉床の灰が同じ一点へ沈み始めた。','保守孔の奥では返された観測が圧縮され、攻撃を受け止められない存在から順に輪郭を失う。'],'高Option装備 / 防御・HP・Guard回復・吸収Option傾向 / Option Fusion素材の混合掘り',['fire','dark'],['def_pct','hp_pct','heal_on_guard','lifesteal'],.34,.03),
  D('cp3_deep_ninth','secret-cp3-deep-ninth','第九照準廊・深層観測','第九照準線が折れ込む高速観測路',3601,'速度・先手・瞬間火力ビルド向け','再照準加速域','敵ATK+40% / Elite脅威増加。長引くほど危険で、速度・先手・短期決着の価値が高い。',['onslaught','elite_horde'],['cp3:boss:cp3_boss_return_clock:cleared'],['RETURN-CLOCK停止後も、第九照準線だけはより短い周期で対象を探し続けている。','照準線の折れ目には、通常の墓標群より高速な再照準領域が形成されている。'],'高品質装備 / 速度・会心・攻撃間隔・会心威力Option傾向 / Greater候補とFusion素材の混合掘り',['lightning','wind'],['spd_pct','crit_pct','atk_speed_pct','crit_damage_pct'],.34,.04),
  D('cp3_deep_root','secret-cp3-deep-root','異記憶根室・深層観測','生体記録層の外側へ伸びる根脈',4201,'魔法・資源管理・行動ローテーション向け','生体記録圧','敵HP+30% / 回復量-50% / Boss固有技増加。資源管理と複数手段を回す長期戦向け。',['vitality','drought','boss_technique'],['cp3:boss:cp3_boss_root_receiver:cleared','cp3:boss:cp3_boss_living_archive:cleared'],['受信根母と生体記録核が消えた後も、根は記録されなかった区間だけを避けて伸び続けている。','深層では同じ行動の反復より、異なる反応を繋いだ時に生体記録が安定する。'],'高Option装備 / 魔力・MP・CDR・会心MP回復Option傾向 / 固定Identityと噛み合う混合掘り',['light','dark','poison'],['mag_pct','mp_pct','cdr_pct','mp_on_crit'],.34,.04),
]);

export function deepSurveyByRealmId(realmId){const {baseRealmId}=resolveDeepSurveyConditionIds(realmId);return CP3_DEEP_SURVEYS.find(x=>x.realmId===baseRealmId)||null;}
export function deepSurveyById(id){return CP3_DEEP_SURVEYS.find(x=>x.id===id)||null;}
export function deepSurveyUnlocked(defOrId,discoveries={}){const def=typeof defOrId==='string'?(deepSurveyById(defOrId)||deepSurveyByRealmId(defOrId)):defOrId;return !!def&&(def.unlockDiscoveries||[]).every(id=>Boolean(discoveries[id]));}

export function deepSurveyExplorationSites(){return CP3_DEEP_SURVEYS.map(def=>({id:def.id,hiddenName:'？？？',discoveredName:def.discoveredName,realmName:def.realmName,discoverDepth:0,clueDepth:0,fragmentSources:[],fragmentsRequired:0,unlockDiscoveries:def.unlockDiscoveries,inspectText:def.inspectText,unlockedText:`${def.realmName}への進路が安定した。`,postCp3DeepSurvey:true,realm:{id:def.realmId,recLevel:99999,itemPowerTarget:10000,rule:def.rule,rewardHint:def.rewardHint}}));}

function challengePressureFloor(challengeIds,key,baseValue){const floor=abyssChallengeMultiplier(challengeIds,key);const current=Number.isFinite(Number(baseValue))?Number(baseValue):1;return key==='healMult'?Math.min(current,floor):Math.max(current,floor);}
function product(conditions,key){return conditions.reduce((m,c)=>m*(Number(c?.effect?.[key])||1),1);}
function sum(conditions,key){return conditions.reduce((n,c)=>n+(Number(c?.effect?.[key])||0),0);}
function conditionedWaves(waves,conditions){const countMult=product(conditions,'waveCountMult');if(countMult===1)return waves;return waves.map(w=>w.deepSurveyApex?{...w}:{...w,count:Math.max(1,Math.round((Number(w.count)||1)*countMult))});}

export function buildDeepSurveyStage(realmId){
  const resolved=resolveDeepSurveyConditionIds(realmId);
  const def=CP3_DEEP_SURVEYS.find(x=>x.realmId===resolved.baseRealmId)||null;if(!def)return null;
  // V3 permits at most two encoded Conditions. UI/mastery controls whether the
  // second slot is selectable; the builder remains bounded even for crafted IDs.
  const conditions=resolved.conditionIds.map(surveyCondition).filter(c=>c&&c.regionId===def.id).slice(0,2);
  const conditionIds=conditions.map(c=>c.id);
  const base=buildAbyssStage(def.depth,[],{challengeIds:def.challengeIds});
  const bossId=`abyss_${def.depth}_boss`;
  const rawWaves=[...(base.waves||[]).map(w=>({...w})),{type:bossId,count:1,interval:0,deepSurveyApex:true}];
  const waves=conditionedWaves(rawWaves,conditions);
  const conditionEffects=Object.freeze({
    directPressurePerAction:sum(conditions,'directPressurePerAction'),
    directPressureMaxStacks:Math.max(0,...conditions.map(c=>Number(c.effect.directPressureMaxStacks)||0)),
    longFightPressurePerRound:sum(conditions,'longFightPressurePerRound'),
    longFightPressureMax:Math.max(0,...conditions.map(c=>Number(c.effect.longFightPressureMax)||0)),
    repeatedActionPenalty:sum(conditions,'repeatedActionPenalty'),
    repeatedActionPenaltyMax:Math.max(0,...conditions.map(c=>Number(c.effect.repeatedActionPenaltyMax)||0)),
    mpCostMult:product(conditions,'mpCostMult'),bossTechniqueIntervalMult:product(conditions,'bossTechniqueIntervalMult'),
    enemyHpMult:product(conditions,'enemyHpMult'),enemySpeedMult:product(conditions,'enemySpeedMult'),enemyAtkMult:product(conditions,'enemyAtkMult'),
    elitePressure:sum(conditions,'elitePressure'),
  });
  const baseProfile={label:`深層観測：${def.role}`,preferredAffixIds:[...def.preferredAffixIds],targetAffixChance:def.targetAffixChance,legendaryChanceAdd:def.legendaryChanceAdd};
  const loot3Profile=conditionRewardProfile(baseProfile,conditionIds);
  const conditionMods=conditions.map(c=>({id:`deep_condition_${c.id}`,name:c.name,desc:c.desc}));
  const conditionSuffix=conditions.length?`【${conditions.map(c=>c.name).join('＋')}】`:'';
  return{
    ...base,id:encodeDeepSurveyConditionStageId(def.realmId,conditionIds),name:`深層観測・${def.realmName.replace('・深層観測','')}${conditionSuffix}`,
    recLevel:99999,itemPowerTarget:10000,boss:true,isAbyss:false,abyssDepth:null,abyssRoute:null,secretRealm:true,secretRealmId:def.id,postCp3DeepSurvey:true,deepSurveyId:def.id,
    deepSurveyBaseRealmId:def.realmId,deepSurveyConditionIds:conditionIds,deepSurveyConditions:conditions,deepSurveyConditionEffects:conditionEffects,deepSurveyMixedChase:true,
    abyssEra:`CP3後：${def.realmName}`,dropMult:(base.dropMult||1)*1.18,rewards:{gold:Math.round(base.rewards.gold*1.15),exp:base.rewards.exp},waves,
    modifiers:[{id:`deep_${def.id}`,name:def.ruleName,desc:def.rule},...conditionMods,...(base.modifiers||[])],
    healMult:challengePressureFloor(def.challengeIds,'healMult',base.healMult)*product(conditions,'healMult'),
    enemyAtkMult:challengePressureFloor(def.challengeIds,'enemyAtkMult',base.enemyAtkMult)*conditionEffects.enemyAtkMult,
    enemyDefMult:challengePressureFloor(def.challengeIds,'enemyDefMult',base.enemyDefMult),
    enemySpeedMult:challengePressureFloor(def.challengeIds,'enemySpeedMult',base.enemySpeedMult)*conditionEffects.enemySpeedMult,
    enemyHpMult:challengePressureFloor(def.challengeIds,'enemyHpMult',base.enemyHpMult)*conditionEffects.enemyHpMult,
    dropRegionTags:[...def.tags],deepSurveyRole:def.role,deepSurveyRewardHint:def.rewardHint,deepSurveyPreferredOptions:[...def.preferredAffixIds],loot3Profile,
  };
}
