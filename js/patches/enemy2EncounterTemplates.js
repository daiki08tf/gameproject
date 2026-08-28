/* Enemy 2.0 E6 — role-first template planning for the Ch1 pilot. */
import { BattleEngine } from '../battleEngine.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { CH1_TEMPLATE_IDS, planRoleFirstEncounter } from '../data/encounterTemplates2.js';

const ch1=CHAPTERS.find(ch=>ch.id==='ch1');
for(const stage of ch1?.stages||[]){
  if(stage.encounterPool&&['1-2','1-3','1-4','1-5'].includes(stage.id)){
    stage.encounterPool.templates=[...CH1_TEMPLATE_IDS];
  }
}

const MARK=Symbol.for('bladeVale.enemy2EncounterTemplates.engine');
if(!BattleEngine.prototype[MARK]){
  BattleEngine.prototype[MARK]=true;
  const originalBegin=BattleEngine.prototype.beginNextEncounter;
  BattleEngine.prototype.beginNextEncounter=function(){
    const spec=this.encounterQueue?.[0];
    const plan=planRoleFirstEncounter(this.stage,spec,ENEMY_TYPES,Math.random);
    if(plan){
      this._enemy2PlannedTypes=[...plan.types];
      this._enemy2ActiveTemplateId=plan.templateId;
    }else{
      this._enemy2PlannedTypes=null;
      this._enemy2ActiveTemplateId=null;
    }
    try{
      const event=originalBegin.call(this);
      if(event&&plan){
        event.encounterTemplate={id:plan.templateId,name:plan.templateName,roles:[...plan.roles]};
      }
      return event;
    }finally{
      this._enemy2PlannedTypes=null;
      this._enemy2ActiveTemplateId=null;
    }
  };
}
