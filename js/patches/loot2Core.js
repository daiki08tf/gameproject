/* Loot 2.0 — integrates Equipment 3.0 rolls with a recycle loop */
import { state } from '../state.js';
import { getItem } from '../data/equipment.js';
import { loot2Presentation,salvageYield } from '../data/loot2.js';
function ensure(){if(!state.data.loot2||typeof state.data.loot2!=='object')state.data.loot2={ancientFound:0,primordialFound:0,salvaged:0,bestScore:0};}
ensure();
state.loot2Info=function(instanceId){const inst=this.data.weaponInstances?.[instanceId];if(!inst)return null;return{...loot2Presentation(inst),yield:salvageYield(inst)};};
state.loot2RecordInstance=function(instanceId){ensure();const info=this.loot2Info(instanceId);if(!info)return null;this.data.loot2.bestScore=Math.max(this.data.loot2.bestScore||0,info.score);const inst=this.data.weaponInstances?.[instanceId];if(info.tier.id==='ancient'&&!inst.loot2Recorded){this.data.loot2.ancientFound++;inst.loot2Recorded=true;}if(info.tier.id==='primordial'&&!inst.loot2Recorded){this.data.loot2.primordialFound++;inst.loot2Recorded=true;}this.save();return info;};
state.loot2Salvage=function(instanceId){ensure();const inst=this.data.weaponInstances?.[instanceId];if(!inst)return{ok:false,reason:'missing'};if(this.data.equipped&&Object.values(this.data.equipped).includes(instanceId))return{ok:false,reason:'equipped'};if((this.data.inventory?.[instanceId]||0)<=0)return{ok:false,reason:'notOwned'};const item=getItem(inst.itemId||instanceId);if(!item)return{ok:false,reason:'item'};const reward=salvageYield(inst);this.data.inventory[instanceId]-=1;if(this.data.inventory[instanceId]<=0)delete this.data.inventory[instanceId];delete this.data.weaponInstances[instanceId];this.data.weaponEssence=(this.data.weaponEssence||0)+reward.essence;this.data.manastone=(this.data.manastone||0)+reward.manastone;this.data.loot2.salvaged++;this.save();return{ok:true,reward,itemName:item.name};};
state.loot2Summary=function(){ensure();return{...this.data.loot2};};
