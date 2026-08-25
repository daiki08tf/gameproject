/* Phase 9.4 — permanent regional mastery rewards. */
import { state } from '../state.js';
import { PHASE9_REGIONAL_MASTERY } from '../data/phase9RegionalMastery.js';

function routeIds(def){return [1,2,3].map(i=>`${def.chapter}-X${i}`);}

state.phase9RegionMastery=function(chapterId){
  const def=PHASE9_REGIONAL_MASTERY[chapterId];
  if(!def)return null;
  const routes=routeIds(def),cleared=routes.filter(id=>this.isStageCleared(id)).length,hiddenBossCleared=this.isStageCleared(def.hiddenStage);
  return{chapterId,...def,routes,explored:cleared,total:routes.length,hiddenBossCleared,mastered:hiddenBossCleared,facilityUnlocked:hiddenBossCleared};
};

state.phase9RegionalMasteries=function(){
  return Object.keys(PHASE9_REGIONAL_MASTERY).map(id=>this.phase9RegionMastery(id));
};

state.phase9RegionalBonuses=function(){
  const total={hp:0,atk:0,def:0,mag:0,spd:0,recruitChanceBonus:0,nextWorld:false};
  for(const mastery of this.phase9RegionalMasteries()){
    if(!mastery?.mastered)continue;
    for(const key of ['hp','atk','def','mag','spd','recruitChanceBonus'])total[key]+=Number(mastery.bonus?.[key])||0;
    if(mastery.bonus?.nextWorld)total.nextWorld=true;
  }
  return total;
};

state.phase9NextWorldUnlocked=function(){return !!this.phase9RegionalBonuses().nextWorld;};

const previousGetStats=state.getStats.bind(state);
state.getStats=function phase9RegionalMasteryStats(){
  const stats=previousGetStats(),bonus=this.phase9RegionalBonuses();
  for(const key of ['hp','atk','def','mag'])if(Number.isFinite(stats[key])&&bonus[key])stats[key]=Math.round(stats[key]*(1+bonus[key]));
  if(Number.isFinite(stats.spd)&&bonus.spd)stats.spd=Math.round(stats.spd*(1+bonus.spd)*10)/10;
  return stats;
};
