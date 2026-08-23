/* ============================================================
   Codex 2.0 foundation - battle/recruit tracking + permanent bonuses
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { codexCompletion, codexBonuses, ensureCodexEntry } from '../data/codex.js';

function ensureCodex(){if(!state.data.monsterCodex)state.data.monsterCodex={};return state.data.monsterCodex;}
function enemyCodexId(enemy){return enemy&&(enemy.type||enemy.enemyType||enemy.name);}
export function knownCodexEnemyIds(){return Object.keys(ENEMY_TYPES).filter(id=>!id.startsWith('__'));}
state.markCodexSeen=function(enemy){const id=enemyCodexId(enemy);if(!id)return;const e=ensureCodexEntry(ensureCodex(),id,enemy.name||id);e.seen=true;state.save();};
state.markCodexKill=function(enemy){const id=enemyCodexId(enemy);if(!id)return;const e=ensureCodexEntry(ensureCodex(),id,enemy.name||id);e.seen=true;e.kills=(e.kills||0)+1;state.save();};
state.markCodexRecruit=function(enemyType,rarity='normal'){if(!enemyType)return;const e=ensureCodexEntry(ensureCodex(),enemyType,ENEMY_TYPES[enemyType]?.name||enemyType);e.seen=true;e.recruited=true;if(['rare','epic','legendary','mythic'].includes(rarity))e.rare=true;if(['legendary','mythic'].includes(rarity))e.legendary=true;state.save();};
state.codexSummary=function(){const completion=codexCompletion(ensureCodex(),knownCodexEnemyIds());return{...completion,bonuses:codexBonuses(completion.pct)};};

// Codex stat multiplier is consumed dynamically by Rune 2.0 so the calculation
// order remains: lower layers -> Codex -> Rune (Rune stays the final multiplier).
state.codexStatMult=function codexStatMult(){return this.codexSummary().bonuses.allStatMult;};
state.characterExpRewardMult=function codexCharacterExpRewardMult(){return this.codexSummary().bonuses.expMult;};
const originalDropRateMult=state.dropRateMult.bind(state);
state.dropRateMult=function codexDropRateMult(){return originalDropRateMult()*this.codexSummary().bonuses.dropMult;};

if(state.createCompanion){
  const originalCreateCompanion=state.createCompanion.bind(state);
  const speciesToEnemy={goblin:'grunt',bat:'fast'};
  state.createCompanion=function codexCreateCompanion(speciesId,opts={}){const id=originalCreateCompanion(speciesId,opts),enemyType=opts.enemyType||speciesToEnemy[speciesId];if(id&&enemyType){const c=this.getCompanion?.(id);this.markCodexRecruit(enemyType,c?.instance?.rarity||opts.rarity||'normal');}return id;};
}
const originalBeginNextEncounter=BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter=function codexBeginNextEncounter(...args){const event=originalBeginNextEncounter.apply(this,args);for(const enemy of(this.enemies||[]))state.markCodexSeen(enemy);return event;};
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function codexGrantKillRewards(enemy){state.markCodexKill(enemy);return originalGrantKillRewards.call(this,enemy);};
export { ensureCodex };
