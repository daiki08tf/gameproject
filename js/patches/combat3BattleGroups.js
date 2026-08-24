import { BattleEngine } from '../battleEngine.js';
import { buildBattleGroups, battleGroupEnemyCount } from '../data/battleGroups.js';

function ensureGroups(engine){
  if(engine._combat3GroupsReady)return;
  const groups=buildBattleGroups(engine.stage);
  engine.encounterQueue=groups.map((g,i)=>({...g,_combat3Group:true,index:i,total:groups.length}));
  engine.totalToDefeat=battleGroupEnemyCount(groups);
  engine.currentBattleGroup=null;
  engine._combat3GroupsReady=true;
}

const originalHasMore=BattleEngine.prototype.hasMoreEncounters;
BattleEngine.prototype.hasMoreEncounters=function(){
  ensureGroups(this);
  if(!this._combat3GroupsReady)return originalHasMore.call(this);
  return this.encounterQueue.length>0||this.enemies.some(e=>!e.dead);
};

const originalBegin=BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter=function(){
  ensureGroups(this);
  const spec=this.encounterQueue.shift();
  if(!spec)return null;
  if(!spec._combat3Group){ this.encounterQueue.unshift(spec); return originalBegin.call(this); }
  const group=[];
  for(const member of spec.enemies){ for(let i=0;i<member.count;i++)group.push(this._spawnEnemy(member.type)); }
  this.enemies=group;
  this.currentBattleGroup={id:spec.id,label:spec.label,bossWave:spec.bossWave,index:spec.index+1,total:spec.total};
  this._freshGroupPending=true;
  return {
    type:'encounterStart',
    label:spec.label,
    groupIndex:spec.index+1,
    groupTotal:spec.total,
    bossWave:spec.bossWave,
    enemies:group.map(e=>({id:e.id,name:e.name,boss:e.boss,elite:e.elite})),
  };
};
