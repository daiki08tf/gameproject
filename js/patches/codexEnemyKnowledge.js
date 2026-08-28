import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ensureCodexEntry } from '../data/codex.js';
import { enemyCombatProfile, enemyRole } from '../data/enemyCombat3.js';
import { enemyAffinityProfile, affinityTier } from '../data/enemyAffinity2.js';

function codex(){if(!state.data.monsterCodex)state.data.monsterCodex={};return state.data.monsterCodex;}
function idOf(enemy){return enemy&&(enemy.type||enemy.enemyType);}
function entryFor(enemy){const id=idOf(enemy);if(!id)return null;return ensureCodexEntry(codex(),id,enemy.name||id);}
state.markEnemySkillObserved=function(enemy,skillName){const e=entryFor(enemy);if(!e||!skillName)return false;e.observedSkills=Array.isArray(e.observedSkills)?e.observedSkills:[];if(e.observedSkills.includes(skillName))return false;e.observedSkills.push(skillName);e.behaviorKnown=true;this.save();return true;};
state.markEnemyAffinityObserved=function(enemy,element,mult){const e=entryFor(enemy);if(!e||!element)return false;const tier=affinityTier(mult);if(tier==='neutral')return false;e.observedAffinities=e.observedAffinities&&typeof e.observedAffinities==='object'?e.observedAffinities:{};if(e.observedAffinities[element]===tier)return false;e.observedAffinities[element]=tier;this.save();return true;};
state.markEnemyAnalyzed=function(enemy){const e=entryFor(enemy);if(!e)return false;e.analyzed=true;e.behaviorKnown=true;e.roleKnown=true;e.affinityKnown=true;e.affinityProfile=enemyAffinityProfile(enemy);const p=enemyCombatProfile(idOf(enemy));e.observedSkills=Array.isArray(e.observedSkills)?e.observedSkills:[];if(p.skill?.name&&!e.observedSkills.includes(p.skill.name))e.observedSkills.push(p.skill.name);this.save();return true;};
state.enemyKnowledge=function(enemyId){const e=codex()[enemyId]||{},p=enemyCombatProfile(enemyId),r=enemyRole(enemyId);return{seen:!!e.seen,kills:e.kills||0,roleKnown:!!e.roleKnown||!!e.analyzed,behaviorKnown:!!e.behaviorKnown||!!e.analyzed,affinityKnown:!!e.affinityKnown||!!e.analyzed,analyzed:!!e.analyzed,role:r,skill:p.skill,observedSkills:Array.isArray(e.observedSkills)?e.observedSkills:[],observedAffinities:e.observedAffinities&&typeof e.observedAffinities==='object'?e.observedAffinities:{},affinityProfile:e.affinityProfile||null,observedEliteAffixes:Array.isArray(e.observedEliteAffixes)?e.observedEliteAffixes:[],observedRareBehaviors:Array.isArray(e.observedRareBehaviors)?e.observedRareBehaviors:[],bossPhase2Observed:!!e.bossPhase2Observed,bossPhaseKnown:!!e.bossPhaseKnown};};

const proto=BattleEngine.prototype;
const originalTurn=proto.performEnemyTurn;
proto.performEnemyTurn=function(enemy){const result=originalTurn.call(this,enemy);if(result?.enemySkill&&result.skillName)state.markEnemySkillObserved(enemy,result.skillName);return result;};
const originalKill=proto._grantKillRewards;
proto._grantKillRewards=function(enemy){const result=originalKill.call(this,enemy);const e=entryFor(enemy);if(e&&!e.roleKnown){e.roleKnown=true;state.save();}return result;};
const originalInspect=proto._resolveTechniqueInspect;
proto._resolveTechniqueInspect=function(tech,targetId,result){const target=this._pickTarget(targetId);originalInspect.call(this,tech,targetId,result);if(target&&result.inspected)state.markEnemyAnalyzed(target);};
const originalDebuff=proto._resolveTechniqueDebuff;
proto._resolveTechniqueDebuff=function(tech,targetId,result){const target=this._pickTarget(targetId);originalDebuff.call(this,tech,targetId,result);if(target&&tech?.inspect)state.markEnemyAnalyzed(target);};
