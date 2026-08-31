/* Core Loop Rework — CLR-10
   Pure safe-return reaction contract. CLR-1/BattleEngine own combat outcome;
   world2.eventMemory remains the durable reaction authority. */
import { adventure4Clr1BattleTypeClearFlag } from './coreLoopClr1.js';

export const CLR10_RETURN_REACTION_REGION_ID='frontier';
export const CLR10_ELITE_RETURN_MEMORY_ID='clr10:frontier:elite-return';
export const CLR10_BOSS_RETURN_MEMORY_ID='clr10:frontier:boss-return';

export function adventure4Clr10ReturnMilestones(session){
  if(!session?.active||session.regionId!==CLR10_RETURN_REACTION_REGION_ID){
    return Object.freeze({eligible:false,eliteCleared:false,bossCleared:false});
  }
  const flags=session.temporaryFlags||{};
  return Object.freeze({
    eligible:true,
    eliteCleared:!!flags[adventure4Clr1BattleTypeClearFlag('elite')],
    bossCleared:!!flags[adventure4Clr1BattleTypeClearFlag('boss')],
  });
}

export function adventure4Clr10ReturnMemories(session){
  const milestones=adventure4Clr10ReturnMilestones(session);
  if(!milestones.eligible)return[];
  const out=[];
  if(milestones.eliteCleared)out.push(Object.freeze({
    eventId:CLR10_ELITE_RETURN_MEMORY_ID,
    patch:Object.freeze({status:'resolved',outcome:'elite-defeated-and-returned',flags:Object.freeze({regionId:CLR10_RETURN_REACTION_REGION_ID,eliteDefeated:true,safeReturn:true})}),
  }));
  if(milestones.bossCleared)out.push(Object.freeze({
    eventId:CLR10_BOSS_RETURN_MEMORY_ID,
    patch:Object.freeze({status:'resolved',outcome:'boss-defeated-and-returned',flags:Object.freeze({regionId:CLR10_RETURN_REACTION_REGION_ID,bossDefeated:true,safeReturn:true})}),
  }));
  return out;
}
