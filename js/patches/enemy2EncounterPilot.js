/* Enemy 2.0 E5 — Ch1 Encounter Pool pilot.
   1-1 and 1-B stay fixed. 1-2..1-5 opt in; Boss types never swap. */
import { BattleEngine } from '../battleEngine.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { pickEncounterPoolType } from '../data/encounterPools2.js';

export const CH1_ENCOUNTER_POOL_TYPES=Object.freeze([
  Object.freeze({type:'grunt',weight:1.20}),
  Object.freeze({type:'fast',weight:1.00}),
  Object.freeze({type:'tank',weight:.60}),
  Object.freeze({type:'ch1_attacker',weight:.80}),
  Object.freeze({type:'ch1_caster',weight:.55}),
  Object.freeze({type:'ch1_trickster',weight:.55}),
  Object.freeze({type:'ch1_support',weight:.45}),
  Object.freeze({type:'ch1_global_slime',weight:.75}),
  Object.freeze({type:'ch1_global_wolf',weight:.45}),
]);

const ch1=CHAPTERS.find(ch=>ch.id==='ch1');
for(const stage of ch1?.stages||[]){
  if(['1-2','1-3','1-4','1-5'].includes(stage.id)){
    stage.encounterPool={id:'ch1-field-pilot',types:CH1_ENCOUNTER_POOL_TYPES.map(x=>({...x}))};
  }
}

const MARK=Symbol.for('bladeVale.enemy2EncounterPilot.engine');
if(!BattleEngine.prototype[MARK]){
  BattleEngine.prototype[MARK]=true;
  const originalSpawn=BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy=function(originalType){
    const type=pickEncounterPoolType(this.stage,originalType,ENEMY_TYPES,Math.random);
    const enemy=originalSpawn.call(this,type);
    const template=ENEMY_TYPES[type];
    if(enemy&&template){
      enemy.encounterSourceType=originalType;
      enemy.encounterPooled=type!==originalType;
      for(const key of ['role','speciesId','speciesFamily','chapterId','regional','globalSpecies','trueGlobal','rareIdentity']){
        if(template[key]!==undefined)enemy[key]=template[key];
      }
      if(Array.isArray(template.behaviorTags))enemy.behaviorTags=[...template.behaviorTags];
      if(Array.isArray(template.habitats))enemy.habitats=[...template.habitats];
    }
    return enemy;
  };
}
