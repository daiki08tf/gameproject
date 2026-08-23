import { state } from '../state.js';
import { BOUNTY_UNIQUES, uniqueForBounty } from '../data/uniqueEquipment.js';

// 装備データ本体へ侵襲せず、getItem側の統合はequipment.jsで行う。
// ここでは賞金首初回討伐報酬とユニーク進行APIだけをstateへ追加する。
state.bountyUniqueFor = function(bountyId){ return uniqueForBounty(bountyId); };
state.ownsBountyUnique = function(bountyId){ const u=uniqueForBounty(bountyId); return !!u && this.ownsItem(u.id); };
state.bountyUniqueCollection = function(){ return BOUNTY_UNIQUES.filter(u=>this.ownsItem(u.id)); };
