/* ============================================================
   Post-CP3 Endgame I — Deep Survey
   ------------------------------------------------------------
   Reuses the existing Exploration / Secret Realm / Abyss combat stack.
   No new Home route, currency, save root, or timed loop.
   ============================================================ */
import { buildAbyssStage } from './abyss.js';

export const CP3_DEEP_SURVEYS = Object.freeze([
  {
    id:'cp3_deep_ash',
    realmId:'secret-cp3-deep-ash',
    realmName:'返信炉床・深層観測',
    discoveredName:'返信炉床のさらに下へ続く保守孔',
    depth:3201,
    role:'耐久・反撃ビルド向け',
    ruleName:'返灰圧縮層',
    rule:'敵HP+30% / 回復量-50%。受け切る耐久、ガード反撃、吸収維持が強い。',
    challengeIds:['vitality','drought'],
    unlockDiscoveries:['cp3:boss:cp3_boss_ack_warden:cleared','cp3:boss:cp3_boss_cinder_reply:cleared'],
    inspectText:['二体の返答個体が消えた後、返信炉床の灰が同じ一点へ沈み始めた。','保守孔の奥では返された観測が圧縮され、攻撃を受け止められない存在から順に輪郭を失う。'],
    rewardHint:'高Item Power装備 / Legendary・Set判定強化 / 防御・継戦ビルドの実戦場',
    tags:['fire','dark'],
  },
  {
    id:'cp3_deep_ninth',
    realmId:'secret-cp3-deep-ninth',
    realmName:'第九照準廊・深層観測',
    discoveredName:'第九照準線が折れ込む高速観測路',
    depth:3601,
    role:'速度・先手・瞬間火力ビルド向け',
    ruleName:'再照準加速域',
    rule:'敵ATK+40% / Elite脅威+2。長引くほど危険で、速度・先手・短期決着の価値が高い。',
    challengeIds:['onslaught','elite_horde'],
    unlockDiscoveries:['cp3:boss:cp3_boss_return_clock:cleared'],
    inspectText:['RETURN-CLOCK停止後も、第九照準線だけはより短い周期で対象を探し続けている。','照準線の折れ目には、通常の墓標群より高速な再照準領域が形成されている。'],
    rewardHint:'Greater・Set判定強化 / 速度・会心・短期決着ビルドの実戦場',
    tags:['lightning','wind'],
  },
  {
    id:'cp3_deep_root',
    realmId:'secret-cp3-deep-root',
    realmName:'異記憶根室・深層観測',
    discoveredName:'生体記録層の外側へ伸びる根脈',
    depth:4201,
    role:'継戦・魔法・行動ローテーション向け',
    ruleName:'生体記録圧',
    rule:'敵HP+30% / 回復量-50% / Boss固有技+1。資源管理と複数手段を回す長期戦向け。',
    challengeIds:['vitality','drought','boss_technique'],
    unlockDiscoveries:['cp3:boss:cp3_boss_root_receiver:cleared','cp3:boss:cp3_boss_living_archive:cleared'],
    inspectText:['受信根母と生体記録核が消えた後も、根は記録されなかった区間だけを避けて伸び続けている。','深層では同じ行動の反復より、異なる反応を繋いだ時に生体記録が安定する。'],
    rewardHint:'Legendary・特殊報酬判定強化 / 魔法・継戦・ローテーションビルドの実戦場',
    tags:['light','dark','poison'],
  },
]);

export function deepSurveyByRealmId(realmId){return CP3_DEEP_SURVEYS.find(x=>x.realmId===realmId)||null;}

export function deepSurveyExplorationSites(){
  return CP3_DEEP_SURVEYS.map(def=>({
    id:def.id,
    hiddenName:'？？？',
    discoveredName:def.discoveredName,
    realmName:def.realmName,
    discoverDepth:0,
    clueDepth:0,
    fragmentSources:[],
    fragmentsRequired:0,
    unlockDiscoveries:def.unlockDiscoveries,
    inspectText:def.inspectText,
    unlockedText:`${def.realmName}への進路が安定した。`,
    postCp3DeepSurvey:true,
    realm:{
      id:def.realmId,
      recLevel:99999,
      itemPowerTarget:10000,
      rule:def.rule,
      rewardHint:def.rewardHint,
    },
  }));
}

export function buildDeepSurveyStage(realmId){
  const def=deepSurveyByRealmId(realmId);if(!def)return null;
  const base=buildAbyssStage(def.depth,[],{challengeIds:def.challengeIds});
  const bossId=`abyss_${def.depth}_boss`;
  const waves=[...(base.waves||[]).map(w=>({...w}))];
  // Choose non-boss template depths so the full normal/fast/tank gauntlet is preserved,
  // then append one authored apex answer at the end.
  waves.push({type:bossId,count:1,interval:0,deepSurveyApex:true});
  return{
    ...base,
    id:def.realmId,
    name:`深層観測・${def.realmName.replace('・深層観測','')}`,
    recLevel:99999,
    itemPowerTarget:10000,
    boss:true,
    isAbyss:false,
    abyssDepth:null,
    abyssRoute:null,
    secretRealm:true,
    secretRealmId:def.id,
    postCp3DeepSurvey:true,
    deepSurveyId:def.id,
    abyssEra:`CP3後：${def.realmName}`,
    dropMult:(base.dropMult||1)*1.18,
    rewards:{gold:Math.round(base.rewards.gold*1.15),exp:base.rewards.exp},
    waves,
    modifiers:[{id:`deep_${def.id}`,name:def.ruleName,desc:def.rule},...(base.modifiers||[])],
    dropRegionTags:def.tags,
    deepSurveyRole:def.role,
    deepSurveyRewardHint:def.rewardHint,
  };
}
