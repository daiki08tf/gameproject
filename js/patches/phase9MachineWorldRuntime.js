/* Phase 9.6 — Machine World runtime bridge. */
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../data/phase9MachineWorld.js';

function scaledEnemy(def){
  const base=ENEMY_TYPES[def.base];
  if(!base)return null;
  const m=def.mult||{};
  return{
    ...base,
    name:def.name,
    hp:Math.max(1,Math.round(base.hp*(m.hp||1))),
    atk:Math.max(1,Math.round(base.atk*(m.atk||1))),
    def:Math.max(0,Math.round(base.def*(m.def||1))),
    speed:Math.max(1,Math.round((base.speed||80)*(m.speed||1))),
    xp:Math.max(1,Math.round((base.xp||1)*1.35)),
    gold:Math.max(1,Math.round((base.gold||1)*1.4)),
    machineWorld:true,
  };
}

for(const [id,def] of Object.entries(MACHINE_WORLD_ENEMIES)){
  const enemy=scaledEnemy(def);
  if(enemy)ENEMY_TYPES[id]=enemy;
}

state.phase9MachineWorldProgress=function(){
  const unlocked=!!this.phase9MachineWorldUnlocked?.();
  const progress=machineWorldProgress(id=>this.isStageCleared(id));
  return{...progress,unlocked,stages:MACHINE_WORLD_STAGES.map(def=>({...def,unlocked:unlocked&&(!def.requires||this.isStageCleared(def.requires)),cleared:this.isStageCleared(def.id)}))};
};

state.phase9MachineWorldStageUnlocked=function(stageId){
  return !!this.phase9MachineWorldProgress().stages.find(s=>s.id===stageId)?.unlocked;
};
