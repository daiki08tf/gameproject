/* Enemy 3.0 B8 — observe Enemy 3 combat knowledge into existing monsterCodex entries. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ensureCodexEntry } from '../data/codex.js';

function entryFor(enemy){const id=enemy&&(enemy.type||enemy.enemyType);if(!id)return null;if(!state.data.monsterCodex)state.data.monsterCodex={};return ensureCodexEntry(state.data.monsterCodex,id,enemy.name||id);}
function addUnique(entry,key,value){if(!entry||!value)return false;entry[key]=Array.isArray(entry[key])?entry[key]:[];if(entry[key].includes(value))return false;entry[key].push(value);return true;}
function saveIf(changed){if(changed)state.save();return changed;}

state.markEnemy3EliteAffixObserved=function(enemy,affix){const e=entryFor(enemy);return saveIf(addUnique(e,'observedEliteAffixes',affix?.name||affix));};
state.markEnemy3RareBehaviorObserved=function(enemy,behavior){const e=entryFor(enemy);return saveIf(addUnique(e,'observedRareBehaviors',behavior?.name||behavior));};
state.markEnemy3BossPhaseObserved=function(enemy){const e=entryFor(enemy);if(!e||e.bossPhase2Observed)return false;e.bossPhase2Observed=true;this.save();return true;};
state.markEnemy3AdvancedAnalyzed=function(enemy){const e=entryFor(enemy);if(!e)return false;let changed=false;if(enemy.enemy3EliteAffix)changed=addUnique(e,'observedEliteAffixes',enemy.enemy3EliteAffix.name)||changed;if(enemy.enemy3RareBehavior)changed=addUnique(e,'observedRareBehaviors',enemy.enemy3RareBehavior.name)||changed;if(enemy.boss){e.bossPhaseKnown=true;changed=true;}return saveIf(changed);};

const proto=BattleEngine.prototype;
const TURN_MARK=Symbol.for('bladeVale.enemy3CodexAnalysis.turn');
if(!proto[TURN_MARK]){proto[TURN_MARK]=true;const originalTurn=proto.performEnemyTurn;proto.performEnemyTurn=function(enemy){const result=originalTurn.call(this,enemy);if(result?.eliteAffix)state.markEnemy3EliteAffixObserved(enemy,result.eliteAffix);if(result?.rareBehavior)state.markEnemy3RareBehaviorObserved(enemy,result.rareBehavior);if(result?.enemy3BossPhase2)state.markEnemy3BossPhaseObserved(enemy);return result;};}
const INSPECT_MARK=Symbol.for('bladeVale.enemy3CodexAnalysis.inspect');
if(!proto[INSPECT_MARK]){proto[INSPECT_MARK]=true;const originalInspect=proto._resolveTechniqueInspect;proto._resolveTechniqueInspect=function(tech,targetId,result){const target=this._pickTarget(targetId);const out=originalInspect.call(this,tech,targetId,result);if(target&&result.inspected)state.markEnemy3AdvancedAnalyzed(target);return out;};const originalDebuff=proto._resolveTechniqueDebuff;proto._resolveTechniqueDebuff=function(tech,targetId,result){const target=this._pickTarget(targetId);const out=originalDebuff.call(this,tech,targetId,result);if(target&&tech?.inspect)state.markEnemy3AdvancedAnalyzed(target);return out;};}
