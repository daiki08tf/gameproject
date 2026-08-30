/* Content Pack IV F — rewards / identity runtime. */
import { state } from '../state.js';
import { BOUNTY_UNIQUES } from '../data/uniqueEquipment.js';
import { CP4_IDENTITY_REWARD,cp4IdentityRewardProgress } from '../data/contentPackIVF.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function discoveries(){return world().discoveries;}
function put(id,patch){const d=discoveries(),prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}

export function registerCP4IdentityReward(){
  const item=CP4_IDENTITY_REWARD.item;
  if(!BOUNTY_UNIQUES.some(x=>x.id===item.id))BOUNTY_UNIQUES.push({...item,stats:{...item.stats},effects:item.effects.map(x=>({...x}))});
  return item;
}

function ownsRewardItem(){
  const id=CP4_IDENTITY_REWARD.item.id;
  if((state.data.inventory?.[id]||0)>0)return true;
  return Object.values(state.data.equipped||{}).includes(id);
}

export function syncCP4IdentityReward(){
  registerCP4IdentityReward();
  const progress=cp4IdentityRewardProgress({discoveries:discoveries()});
  if(!progress.eligible)return Object.freeze({...progress,changed:false});
  if(progress.granted)return Object.freeze({...progress,changed:false});
  const alreadyOwned=ownsRewardItem();
  if(!alreadyOwned)state.addItem(CP4_IDENTITY_REWARD.item.id,1,{cp4IdentityReward:true});
  put(CP4_IDENTITY_REWARD.rewardDiscoveryId,{
    ...CP4_IDENTITY_REWARD.record,
    contentPackIV:true,
    identityReward:true,
    itemId:CP4_IDENTITY_REWARD.item.id,
    sourceDiscoveryId:CP4_IDENTITY_REWARD.prerequisiteDiscoveryId,
    branchTechnology:false,
    progressionGate:false,
    mandatoryEquipment:false,
  });
  state.save();
  return Object.freeze({...cp4IdentityRewardProgress({discoveries:discoveries()}),changed:true,alreadyOwned});
}

state.cp4IdentityReward=function(){registerCP4IdentityReward();return{...cp4IdentityRewardProgress({discoveries:discoveries()}),definition:CP4_IDENTITY_REWARD};};
state.syncCP4IdentityReward=()=>syncCP4IdentityReward();
registerCP4IdentityReward();
syncCP4IdentityReward();
