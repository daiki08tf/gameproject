import { buildAbyssStage } from './abyss.js';
import { machineWorldStageDef } from './phase9MachineWorld.js';

export function buildMachineWorldStage(stageId){
  const def=machineWorldStageDef(stageId);if(!def)return null;
  const base=buildAbyssStage(def.depth,[],{suppressModifiers:true});
  const final=!!def.boss;
  return{
    ...base,
    id:def.id,
    name:def.name,
    recLevel:base.recLevel,
    isAbyss:false,
    secretRealm:true,
    secretRealmId:'machine_world',
    machineWorld:true,
    machineWorldBoss:final,
    abyssDepth:null,
    abyssEra:'機界：第一都市圏',
    healMult:Math.min(base.healMult||1,final?.65:.82),
    dropMult:(base.dropMult||1)*(final?1.55:1.28),
    itemPowerTarget:Math.min(10000,(base.itemPowerTarget||0)+(final?420:220)),
    rewards:{gold:Math.round(base.rewards.gold*(final?1.65:1.35)),exp:Math.round(base.rewards.exp*(final?1.5:1.28))},
    waves:def.waves.map(w=>({...w})),
    dropTable:[...(base.dropTable||[])],
    modifiers:[def.modifier],
    dropRegionTags:def.tags,
    phase9Description:def.desc,
    boss:final,
  };
}
