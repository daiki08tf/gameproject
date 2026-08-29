/* ============================================================
   Codex 2.0 foundation - battle/recruit tracking + permanent bonuses
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { codexCompletion, codexBonuses, ensureCodexEntry } from '../data/codex.js';
import { recordEnemy2Discovery, isEnemy2GeneratedMaterializationId, enemy2ActivityId } from '../data/enemyCodex2Discovery.js';
import './codexEnemyKnowledge.js';

function ensureCodex(){if(!state.data.monsterCodex)state.data.monsterCodex={};return state.data.monsterCodex;}
function enemyCodexId(enemy){return enemy&&(enemy.type||enemy.enemyType||enemy.name);}
export function knownCodexEnemyIds(){return Object.keys(ENEMY_TYPES).filter(id=>!id.startsWith('__')&&!isEnemy2GeneratedMaterializationId(id));}
// Endgame-mode visibility for EVERY Codex entry, Boss included. The Enemy 2.0
// ecology roll-up (recordEnemy2Discovery) intentionally excludes Bosses --
// it aggregates interchangeable common enemies by species, not unique
// authored identities -- so a Boss fought only in e.g. Abyss/Rift never
// showed which endgame mode(s) it was actually encountered in. This reuses
// the same enemy2ActivityId(stage) classifier already used by the ecology
// system, just recorded onto the plain per-enemy entry instead. It adds no
// Codex milestone/point and no new save root.
function recordEndgameActivity(e,stage){const id=enemy2ActivityId(stage);if(!Array.isArray(e.activities))e.activities=[];if(!e.activities.includes(id))e.activities.push(id);}
state.markCodexSeen=function(enemy,stage=null){const id=enemyCodexId(enemy);if(!id)return;const entries=ensureCodex(),e=ensureCodexEntry(entries,id,enemy.name||id);e.seen=true;if(enemy?.rank==='rare'||enemy?.rareIdentity)e.rare=true;recordEndgameActivity(e,stage);recordEnemy2Discovery(entries,enemy,stage);state.save();};
state.markCodexKill=function(enemy,stage=null){const id=enemyCodexId(enemy);if(!id)return;const entries=ensureCodex(),e=ensureCodexEntry(entries,id,enemy.name||id);e.seen=true;e.kills=(e.kills||0)+1;if(enemy?.rank==='rare'||enemy?.rareIdentity)e.rare=true;recordEndgameActivity(e,stage);recordEnemy2Discovery(entries,enemy,stage,{kill:true});state.save();};
state.markCodexRecruit=function(enemyType,rarity='normal'){if(!enemyType)return;const e=ensureCodexEntry(ensureCodex(),enemyType,ENEMY_TYPES[enemyType]?.name||enemyType);e.seen=true;e.recruited=true;if(['rare','epic','legendary','mythic'].includes(rarity))e.rare=true;if(['legendary','mythic'].includes(rarity))e.legendary=true;state.save();};
state.codexSummary=function(){const completion=codexCompletion(ensureCodex(),knownCodexEnemyIds());return{...completion,bonuses:codexBonuses(completion.pct)};};
state.codexStatMult=function codexStatMult(){return this.codexSummary().bonuses.allStatMult;};
state.characterExpRewardMult=function codexCharacterExpRewardMult(){return this.codexSummary().bonuses.expMult;};
const originalDropRateMult=state.dropRateMult.bind(state);
state.dropRateMult=function codexDropRateMult(){return originalDropRateMult()*this.codexSummary().bonuses.dropMult;};
if(state.createCompanion){const originalCreateCompanion=state.createCompanion.bind(state);const speciesToEnemy={goblin:'grunt',bat:'fast'};state.createCompanion=function codexCreateCompanion(speciesId,opts={}){const id=originalCreateCompanion(speciesId,opts),enemyType=opts.enemyType||speciesToEnemy[speciesId];if(id&&enemyType){const c=this.getCompanion?.(id);this.markCodexRecruit(enemyType,c?.instance?.rarity||opts.rarity||'normal');}return id;};}
const originalBeginNextEncounter=BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter=function codexBeginNextEncounter(...args){const event=originalBeginNextEncounter.apply(this,args);for(const enemy of(this.enemies||[]))state.markCodexSeen(enemy,this.stage);return event;};
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function codexGrantKillRewards(enemy){state.markCodexKill(enemy,this.stage);return originalGrantKillRewards.call(this,enemy);};
export { ensureCodex };
