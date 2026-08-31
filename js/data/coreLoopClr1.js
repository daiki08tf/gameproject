/* Core Loop Rework — CLR-1 multi-battle expedition contract.
   Pure helpers only: Adventure owns route/session continuation while BattleEngine
   remains authoritative for combat, rewards and canonical stage completion. */

export const CLR1_COMBAT_CHAIN_TAG='clr1-combat-chain';

export function adventure4Clr1BattleClearFlag(nodeId){
  return typeof nodeId==='string'&&nodeId.length?`clr1:cleared:${nodeId}`:null;
}

export function adventure4Clr1BattleResultPatch(node,result,session={}){
  const isClr1=Array.isArray(node?.tags)&&node.tags.includes(CLR1_COMBAT_CHAIN_TAG);
  if(!isClr1)return{pendingEncounter:null};
  if(!result?.cleared)return null;
  const flag=adventure4Clr1BattleClearFlag(node.id);
  if(!flag)return{pendingEncounter:null};
  return{
    pendingEncounter:null,
    temporaryFlags:{...(session?.temporaryFlags||{}),[flag]:true},
  };
}
