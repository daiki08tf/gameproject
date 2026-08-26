/* Phase 9.8 — Machine World runtime bridge. */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { MACHINE_WORLD_ENEMIES, MACHINE_WORLD_STAGES, machineWorldProgress } from '../data/phase9MachineWorld.js';
import { buildMachineWorldStage } from '../data/phase9MachineWorldStages.js';
function scaledEnemy(def){const base=ENEMY_TYPES[def.base];if(!base)return null;const m=def.mult||{};return{...base,name:def.name,hp:Math.max(1,Math.round(base.hp*(m.hp||1))),atk:Math.max(1,Math.round(base.atk*(m.atk||1))),def:Math.max(0,Math.round(base.def*(m.def||1))),speed:Math.max(1,Math.round((base.speed||80)*(m.speed||1))),xp:Math.max(1,Math.round((base.xp||1)*1.45)),gold:Math.max(1,Math.round((base.gold||1)*1.5)),machineWorld:true,machineRole:def.role};}
for(const [id,def] of Object.entries(MACHINE_WORLD_ENEMIES)){const enemy=scaledEnemy(def);if(enemy)ENEMY_TYPES[id]=enemy;}
if(!CHAPTERS.some(ch=>ch.id==='machine_world'))CHAPTERS.push({id:'machine_world',num:26,name:'機界・三層都市圏',subtitle:'設計者の権限外へ進み、世界層を選別する観測者を追う',stages:MACHINE_WORLD_STAGES.map(def=>buildMachineWorldStage(def.id)),phase9MachineWorld:true});
state.phase9MachineWorldProgress=function(){const unlocked=!!this.phase9MachineWorldUnlocked?.();const progress=machineWorldProgress(id=>this.isStageCleared(id));return{...progress,unlocked,stages:MACHINE_WORLD_STAGES.map(def=>({...def,unlocked:unlocked&&(!def.requires||this.isStageCleared(def.requires)),cleared:this.isStageCleared(def.id)}))};};
state.phase9MachineWorldStageUnlocked=function(stageId){return !!this.phase9MachineWorldProgress().stages.find(s=>s.id===stageId)?.unlocked;};
state.phase9ArchitectDefeated=function(){return !!this.isStageCleared?.('machine-world-10');};
state.phase9ObserverDefeated=function(){return !!this.isStageCleared?.('machine-world-15');};
state.phase9MachineDeepLayerUnlocked=function(){return !!this.isStageCleared?.('machine-world-10');};
state.phase9MachineWorldComplete=function(){return !!this.phase9MachineWorldProgress().completed;};
