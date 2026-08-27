import { buildAbyssStage } from './abyss.js';
import { ENEMY_TYPES } from './enemies.js';
import { expandedRealmByStageId } from './secretRealmExpansion.js';
import { buildWorld2KeyStage } from './world2Stages.js';
import { world3EventStageById } from './world3EventStages.js';
import { eighthKeyStageDef } from './phase9EighthKey.js';
import { buildDeepSurveyStage } from './postCp3DeepSurvey.js';

function scaleRealmEnemies(stage, cfg){
  const seen=new Set();
  for(const wave of stage.waves||[]){
    if(seen.has(wave.type)) continue;
    seen.add(wave.type);
    const enemy=ENEMY_TYPES[wave.type];
    if(!enemy) continue;
    if(cfg.hpMult) enemy.hp=Math.max(1,Math.round(enemy.hp*cfg.hpMult));
    if(cfg.atkMult) enemy.atk=Math.max(1,Math.round(enemy.atk*cfg.atkMult));
    if(cfg.defMult) enemy.def=Math.max(0,Math.round(enemy.def*cfg.defMult));
    if(cfg.speedMult) enemy.speed=Math.max(1,Math.round((enemy.speed||80)*cfg.speedMult));
  }
}

function registerRealmEnemyArchetypes(cfg){
  if(!cfg.enemyArchetypes)return;
  for(const [id,def] of Object.entries(cfg.enemyArchetypes)){
    const source=ENEMY_TYPES[`abyss_${cfg.baseDepth}_${def.source}`];
    if(!source)continue;
    ENEMY_TYPES[id]={
      ...source,
      name:def.name,
      hp:Math.max(1,Math.round(source.hp*(def.hpMult||1))),
      atk:Math.max(1,Math.round(source.atk*(def.atkMult||1))),
      def:Math.max(0,Math.round(source.def*(def.defMult||1))),
      speed:Math.max(1,Math.round((source.speed||80)*(def.speedMult||1))),
      boss:Boolean(def.boss),
      phase12:true,
      phase12Role:def.role||def.source,
    };
  }
}

function rollRareSpawn(cfg){
  const rare=cfg.rareSpawn;
  if(!rare||!rare.enemyId)return null;
  const chance=Math.max(0,Math.min(.20,Number(rare.chance)||0));
  return Math.random()<chance?{...rare,chance}:null;
}

function buildExpandedRealm(cfg){
  const site=cfg.site;
  const base=buildAbyssStage(cfg.baseDepth,[],{suppressModifiers:true});
  scaleRealmEnemies(base,cfg);
  registerRealmEnemyArchetypes(cfg);
  const setDrops=base.dropTable.filter(x=>String(x.itemId).startsWith(cfg.setPrefix)).map(x=>({...x,weight:0.32}));
  const fallbackSetIds={
    'set_dragon_':['set_dragon_shield','set_dragon_body','set_dragon_accessory'],
    'set_star_':['set_star_head','set_star_body','set_star_accessory'],
    'set_executioner_':['set_executioner_head','set_executioner_body','set_executioner_accessory'],
    'set_abyss_':['set_abyss_head','set_abyss_body','set_abyss_accessory'],
  }[cfg.setPrefix]||[];
  const guaranteedPool=setDrops.length?setDrops:fallbackSetIds.map(itemId=>({itemId,weight:0.32}));
  const waves=cfg.waves?cfg.waves.map(w=>({...w})):(base.waves||[]).map(w=>({...w}));
  const rareSpawn=rollRareSpawn(cfg);
  if(rareSpawn){
    const rareWave={type:rareSpawn.enemyId,count:1,interval:0,phase12Rare:true};
    const bossIndex=Math.max(0,waves.length-1);
    waves.splice(bossIndex,0,rareWave);
  }
  const rareDrops=rareSpawn?.dropId?[{itemId:rareSpawn.dropId,weight:0.18,phase12UltraRare:true}]:[];
  return {
    ...base,
    id:site.realm.id,
    name:`異界・${site.realmName}`,
    recLevel:Math.max(Number(site.realm.recLevel)||0,base.recLevel),
    itemPowerTarget:Math.max(Number(site.realm.itemPowerTarget)||0,base.itemPowerTarget),
    isAbyss:false,
    secretRealm:true,
    secretRealmId:site.id,
    phase12BoundaryRuin:Boolean(cfg.enemyArchetypes&&!cfg.rareSpawn&&!cfg.phase12Apex),
    phase12Horizontal:Boolean(cfg.rareSpawn),
    phase12Apex:Boolean(cfg.phase12Apex),
    phase12RareSpawn:rareSpawn?.label||null,
    phase12RareSpawnId:rareSpawn?.enemyId||null,
    phase12WorldTrace:cfg.trace||null,
    phase12UltraRareDropId:rareSpawn?.dropId||null,
    abyssDepth:null,
    abyssEra:`異界：${site.realmName}`,
    healMult:Math.min(base.healMult||1,cfg.healMult||1),
    dropMult:(base.dropMult||1)*(cfg.dropMult||1),
    rewards:{gold:Math.round(base.rewards.gold*(cfg.goldMult||1)),exp:Math.round(base.rewards.exp*(cfg.expMult||1))},
    dropTable:[...rareDrops,...guaranteedPool,...base.dropTable.filter(x=>!String(x.itemId).startsWith('set_'))],
    waves,
    modifiers:[cfg.modifier],
    dropRegionTags:cfg.tags||[],
  };
}

function buildEighthKeyStage(def){
  const base=buildAbyssStage(def.depth,[],{suppressModifiers:true});
  const healMult=def.final?.5:def.id.endsWith('-2')?.65:.8;
  return{
    ...base,
    id:def.id,
    name:def.name,
    isAbyss:false,
    secretRealm:true,
    secretRealmId:'eighth_key',
    phase9EighthKey:true,
    phase9EighthKeyFinal:!!def.final,
    abyssDepth:null,
    abyssEra:`第八鍵：${def.recLabel}`,
    healMult:Math.min(base.healMult||1,healMult),
    dropMult:(base.dropMult||1)*(def.final?1.5:1.25),
    itemPowerTarget:Math.min(10000,(base.itemPowerTarget||0)+(def.final?350:180)),
    rewards:{gold:Math.round(base.rewards.gold*(def.final?1.6:1.3)),exp:Math.round(base.rewards.exp*(def.final?1.45:1.25))},
    dropTable:[...(base.dropTable||[])],
    modifiers:[def.modifier],
    dropRegionTags:def.tags,
  };
}

export function buildSecretRealmStage(stageId){
  const deep=buildDeepSurveyStage(stageId);
  if(deep)return deep;
  const eighth=eighthKeyStageDef(stageId);
  if(eighth)return buildEighthKeyStage(eighth);
  if(stageId.startsWith('secret-worldkey-')) return buildWorld2KeyStage(stageId.slice('secret-worldkey-'.length));
  if(stageId.startsWith('secret-worldevent-')){
    const eventStage=world3EventStageById(stageId);
    return eventStage?{...eventStage,dropTable:[...(eventStage.dropTable||[])],waves:(eventStage.waves||[]).map(w=>({...w})),modifiers:[...(eventStage.modifiers||[])]}:null;
  }
  if(stageId==='secret-blood-castle'){
    const base=buildAbyssStage(800,[],{suppressModifiers:true});
    return {
      ...base,id:'secret-blood-castle',name:'異界・血王城',recLevel:base.recLevel,itemPowerTarget:Math.min(10000,base.itemPowerTarget+200),
      isAbyss:false,secretRealm:true,secretRealmId:'blood_gate',abyssDepth:null,abyssEra:'異界：血王城',
      healMult:Math.min(base.healMult||1,0.5),dropMult:(base.dropMult||1)*1.35,
      rewards:{gold:Math.round(base.rewards.gold*1.35),exp:Math.round(base.rewards.exp*1.25)},
      dropTable:[{itemId:'set_blood_head',weight:0.30},{itemId:'set_blood_body',weight:0.30},{itemId:'set_blood_accessory',weight:0.30},...base.dropTable.filter(x=>!String(x.itemId).startsWith('set_'))],
      modifiers:[{id:'realm_blood_thirst',name:'血の渇き',desc:'回復効果-50% ／ ドロップ率+35%'}],dropRegionTags:['dark','poison'],
    };
  }
  const cfg=expandedRealmByStageId(stageId);
  return cfg?buildExpandedRealm(cfg):null;
}