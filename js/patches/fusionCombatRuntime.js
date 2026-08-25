import { state } from '../state.js';
import { fusionCombatIdentity } from '../data/fusionCombatIdentity.js';

function ensure(s=state){s.data.fusionCombat||={};return s.data.fusionCombat;}
function slot(s,id){const d=ensure(s);d[id]||={gauge:0,commandsUsed:0};return d[id];}
state.fusionCombatIdentity=function(jobId=this.currentJobId){return fusionCombatIdentity(jobId);};
state.fusionGauge=function(jobId=this.currentJobId){return slot(this,jobId).gauge||0;};
state.gainFusionGauge=function(amount,jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);if(!i)return 0;const s=slot(this,jobId),mastered=this.isMastered?.(jobId);const gain=Math.max(0,amount)*(mastered?1.2:1);s.gauge=Math.min(i.gauge.max,Math.round((s.gauge+gain)*10)/10);return s.gauge;};
state.canUseFusionCommand=function(jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);return !!i&&this.fusionGauge(jobId)>=i.command.cost;};
state.useFusionCommand=function(jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);if(!i||!this.canUseFusionCommand(jobId))return{ok:false};const s=slot(this,jobId);s.gauge=this.isMastered?.(jobId)?25:0;s.commandsUsed++;return{ok:true,command:i.command,gauge:s.gauge};};
state.fusionTraitActive=function(jobId=this.currentJobId){return !!fusionCombatIdentity(jobId)&&this.fusionGauge(jobId)>=50;};
state.fusionMasteryPassive=function(jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);return i&&this.isMastered?.(jobId)?i.mastery:null;};
state.resetFusionBattleResource=function(jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);if(!i)return false;slot(this,jobId).gauge=i.gauge.start;return true;};
state.fusionCombatSummary=function(jobId=this.currentJobId){const i=fusionCombatIdentity(jobId);if(!i)return null;return{...i,gaugeValue:this.fusionGauge(jobId),traitActive:this.fusionTraitActive(jobId),commandReady:this.canUseFusionCommand(jobId),mastered:!!this.isMastered?.(jobId)};};
ensure();
