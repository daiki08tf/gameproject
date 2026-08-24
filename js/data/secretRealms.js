import { buildAbyssStage } from './abyss.js';

export function buildSecretRealmStage(stageId){
  if(stageId!=='secret-blood-castle') return null;
  const base=buildAbyssStage(800);
  return {
    ...base,
    id:'secret-blood-castle',
    name:'異界・血王城',
    recLevel:12500,
    itemPowerTarget:5600,
    isAbyss:false,
    secretRealm:true,
    secretRealmId:'blood_gate',
    abyssDepth:null,
    abyssEra:'異界：血王城',
    healMult:Math.min(base.healMult||1,0.5),
    dropMult:(base.dropMult||1)*1.35,
    rewards:{ gold:Math.round(base.rewards.gold*1.35), exp:Math.round(base.rewards.exp*1.25) },
    dropTable:[
      { itemId:'set_blood_head', weight:0.30 },
      { itemId:'set_blood_body', weight:0.30 },
      { itemId:'set_blood_accessory', weight:0.30 },
      ...base.dropTable.filter(x=>!String(x.itemId).startsWith('set_')),
    ],
    modifiers:[
      { id:'realm_blood_thirst', name:'血の渇き', desc:'回復効果-50% ／ ドロップ率+35%' },
    ],
    dropRegionTags:['dark','poison'],
  };
}
