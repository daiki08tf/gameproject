/* Enemy 2.0 E7–E9 — Rare / generic Elite / environmental Variant integration. */
import './enemy2EncounterTemplates.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { state } from '../state.js';
import {
  planRareOverrideTypes,markRare,finalizeGenericEliteLevel,
  chooseEnvironmentalVariant,applyEnvironmentalVariant,
} from '../data/enemyRankVariants2.js';

const ch1=CHAPTERS.find(ch=>ch.id==='ch1');
for(const stage of ch1?.stages||[]){
  if(!['1-2','1-3','1-4','1-5'].includes(stage.id)||!stage.encounterPool)continue;
  Object.assign(stage.encounterPool,{
    rareChance:.04,
    rareTypes:[{type:'ch1_rare',weight:1}],
    regionTags:['grassland'],
    variantChance:.10,
  });
}

const BEGIN_MARK=Symbol.for('bladeVale.enemy2RankVariants.begin');
if(!BattleEngine.prototype[BEGIN_MARK]){
  BattleEngine.prototype[BEGIN_MARK]=true;
  const originalBegin=BattleEngine.prototype.beginNextEncounter;
  BattleEngine.prototype.beginNextEncounter=function(){
    const spec=this.encounterQueue?.[0];
    const tier=!this.stage?.isAbyss&&typeof state.activeWorldTier==='function'
      ? state.activeWorldTier()
      : {id:'normal',rank:0};
    this._enemy2RankOverrideTypes=planRareOverrideTypes(this.stage,spec,ENEMY_TYPES,tier,Math.random);
    try{return originalBegin.call(this);}finally{this._enemy2RankOverrideTypes=null;}
  };
}

const SPAWN_MARK=Symbol.for('bladeVale.enemy2RankVariants.spawn');
if(!BattleEngine.prototype[SPAWN_MARK]){
  BattleEngine.prototype[SPAWN_MARK]=true;
  const originalSpawn=BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy=function(type){
    const enemy=originalSpawn.call(this,type);
    if(!enemy||enemy.boss)return enemy;
    if(this.stage?.isAbyss){
      // Historical Abyss `enemy.elite` remains the reward-eligible flag. E9 only
      // adds bounded visual/stat flavor and never converts it to generic Elite.
      const variant=chooseEnvironmentalVariant(this.stage?.encounterPool,enemy,Math.random);
      if(variant)applyEnvironmentalVariant(enemy,variant);
      enemy.rank ||= enemy.elite?'elite':'common';
      return enemy;
    }
    if(enemy.rareIdentity)markRare(enemy,this.stage,Math.random);
    else if(enemy.genericElite)finalizeGenericEliteLevel(enemy,this.stage,Math.random);
    const variant=chooseEnvironmentalVariant(this.stage?.encounterPool,enemy,Math.random);
    if(variant)applyEnvironmentalVariant(enemy,variant);
    enemy.rank ||= 'common';
    return enemy;
  };
}

const SCREEN_MARK=Symbol.for('bladeVale.enemy2RankVariants.screen');
if(!TextBattleScreen.prototype[SCREEN_MARK]){
  TextBattleScreen.prototype[SCREEN_MARK]=true;
  const originalRender=TextBattleScreen.prototype._renderEnemies;
  TextBattleScreen.prototype._renderEnemies=function(){
    const result=originalRender.call(this);
    const cards=[...(this.el?.enemyList?.querySelectorAll?.('.tb-enemy-card')||[])];
    for(let i=0;i<cards.length;i++){
      const enemy=this.engine?.enemies?.[i];
      const name=cards[i].querySelector?.('.tb-enemy-name-row span:first-child');
      if(!enemy||!name)continue;
      const label=enemy.rank==='elite'?' [ELITE]':enemy.rank==='rare'?' [RARE]':'';
      if(label&&!name.textContent.endsWith(label))name.textContent+=label;
    }
    return result;
  };
}
