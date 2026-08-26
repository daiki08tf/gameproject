import { buildAbyssStage } from './abyss.js';
import { machineWorldStageDef } from './phase9MachineWorld.js';

export function buildMachineWorldStage(stageId){
  const def=machineWorldStageDef(stageId);if(!def)return null;
  // Machine World has its own handcrafted reward tiers and can also be played under
  // World Tier. Suppress the Abyss-only era reward boost here to avoid triple stacking.
  const base=buildAbyssStage(def.depth,[],{suppressModifiers:true,suppressEndgameRewards:true});
  const boss=!!def.boss,district2=def.district===2,district3=def.district===3;
  const dropTable=[...(base.dropTable||[])];
  if(def.id==='machine-world-10')dropTable.push({itemId:'uq_architect_core',weight:.28});
  if(district3){
    dropTable.push({itemId:'set_machine_head',weight:boss?.22:.08},{itemId:'set_machine_body',weight:boss?.22:.08},{itemId:'set_machine_accessory',weight:boss?.22:.08});
  }
  if(def.id==='machine-world-15')dropTable.push({itemId:'uq_observer_zero',weight:.35});
  const dropTier=def.secretBoss?2.25:def.final?2.05:(boss&&district2)?1.72:boss?1.55:district3?1.62:district2?1.42:1.28;
  const rewardGoldTier=def.secretBoss?2.35:def.final?2.1:(boss&&district2)?1.80:boss?1.65:district3?1.72:district2?1.5:1.35;
  const rewardExpTier=def.secretBoss?2.1:def.final?1.95:(boss&&district2)?1.62:boss?1.5:district3?1.62:district2?1.42:1.28;
  return{
    ...base,id:def.id,name:def.name,recLevel:base.recLevel,isAbyss:false,secretRealm:true,secretRealmId:'machine_world',machineWorld:true,
    machineWorldBoss:boss,machineWorldDistrict:def.district||1,machineWorldFinal:!!def.final,machineWorldSecretBoss:!!def.secretBoss,abyssDepth:null,
    abyssEra:district3?'機界：外部観測層':district2?'機界：第二都市圏':'機界：第一都市圏',
    healMult:Math.min(base.healMult||1,def.secretBoss?.40:def.final?.48:boss?.62:district3?.66:district2?.74:.82),
    dropMult:(base.dropMult||1)*dropTier,
    itemPowerTarget:Math.min(10000,(base.itemPowerTarget||0)+(def.secretBoss?950:def.final?800:boss?420:district3?520:district2?320:220)),
    rewards:{gold:Math.round(base.rewards.gold*rewardGoldTier),exp:Math.round(base.rewards.exp*rewardExpTier)},
    waves:def.waves.map(w=>({...w})),dropTable,modifiers:[def.modifier],dropRegionTags:def.tags,phase9Description:def.desc,boss,
  };
}
