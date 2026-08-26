import { buildAbyssStage } from './abyss.js';
import { machineWorldStageDef } from './phase9MachineWorld.js';

export function buildMachineWorldStage(stageId){
  const def=machineWorldStageDef(stageId);if(!def)return null;
  const base=buildAbyssStage(def.depth,[],{suppressModifiers:true});
  const final=!!def.boss,district2=def.district===2;
  const dropTable=[...(base.dropTable||[])];
  if(def.id==='machine-world-10')dropTable.push({itemId:'uq_architect_core',weight:.28});
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
    machineWorldDistrict:def.district||1,
    machineWorldFinal:!!def.final,
    abyssDepth:null,
    abyssEra:district2?'機界：第二都市圏':'機界：第一都市圏',
    healMult:Math.min(base.healMult||1,def.final?.55:final?.65:district2?.74:.82),
    dropMult:(base.dropMult||1)*(def.final?1.85:final?1.55:district2?1.42:1.28),
    itemPowerTarget:Math.min(10000,(base.itemPowerTarget||0)+(def.final?650:final?420:district2?320:220)),
    rewards:{gold:Math.round(base.rewards.gold*(def.final?1.95:final?1.65:district2?1.5:1.35)),exp:Math.round(base.rewards.exp*(def.final?1.8:final?1.5:district2?1.42:1.28))},
    waves:def.waves.map(w=>({...w})),
    dropTable,
    modifiers:[def.modifier],
    dropRegionTags:def.tags,
    phase9Description:def.desc,
    boss:final,
  };
}
