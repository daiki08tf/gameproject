import { buildAbyssStage } from './abyss.js';
import { ENEMY_TYPES } from './enemies.js';
import { expandedRealmByStageId } from './secretRealmExpansion.js';
import { buildWorld2KeyStage } from './world2Stages.js';

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

function buildExpandedRealm(cfg){
  const site=cfg.site;
  const base=buildAbyssStage(cfg.baseDepth,[],{suppressModifiers:true});
  scaleRealmEnemies(base,cfg);
  const setDrops=base.dropTable.filter(x=>String(x.itemId).startsWith(cfg.setPrefix)).map(x=>({...x,weight:0.32}));
  const fallbackSetIds={
    'set_dragon_':['set_dragon_shield','set_dragon_body','set_dragon_accessory'],
    'set_star_':['set_star_head','set_star_body','set_star_accessory'],
    'set_executioner_':['set_executioner_head','set_executioner_body','set_executioner_accessory'],
    'set_abyss_':['set_abyss_head','set_abyss_body','set_abyss_accessory'],
  }[cfg.setPrefix]||[];
  const guaranteedPool=setDrops.length?setDrops:fallbackSetIds.map(itemId=>({itemId,weight:0.32}));
  return {
    ...base,
    id:site.realm.id,
    name:`異界・${site.realmName}`,
    recLevel:site.realm.recLevel,
    itemPowerTarget:site.realm.itemPowerTarget,
    isAbyss:false,
    secretRealm:true,
    secretRealmId:site.id,
    abyssDepth:null,
    abyssEra:`異界：${site.realmName}`,
    healMult:Math.min(base.healMult||1,cfg.healMult||1),
    dropMult:(base.dropMult||1)*(cfg.dropMult||1),
    rewards:{gold:Math.round(base.rewards.gold*(cfg.goldMult||1)),exp:Math.round(base.rewards.exp*(cfg.expMult||1))},
    dropTable:[...guaranteedPool,...base.dropTable.filter(x=>!String(x.itemId).startsWith('set_'))],
    modifiers:[cfg.modifier],
    dropRegionTags:cfg.tags||[],
  };
}

export function buildSecretRealmStage(stageId){
  if(stageId.startsWith('secret-worldkey-')) return buildWorld2KeyStage(stageId.slice('secret-worldkey-'.length));
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
