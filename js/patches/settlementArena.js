/* Settlement 3.0 S16 — Arena & Training Grounds runtime. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { CHAPTERS } from '../data/stages.js';
import { SETTLEMENT_ARENA_MODES,SETTLEMENT_ARENA_RULES } from '../data/settlementArena.js';

function meta(){state.data.settlementBuildings||={};const root=state.data.settlementBuildings.__settlement3||(state.data.settlementBuildings.__settlement3={});return root.arena||(root.arena={best:{},runs:0});}
function bossStages(){return CHAPTERS.flatMap(ch=>(ch.stages||[]).filter(s=>s.boss&&!s.arenaTraining).map(stage=>({chapter:ch,stage})));}
function clearedBosses(){const all=bossStages();const cleared=all.filter(x=>state.isStageCleared?.(x.stage.id));return cleared.length?cleared:all.slice(0,1);}
function pickBoss(rank){const list=clearedBosses();if(!list.length)return null;const idx=Math.max(0,Math.min(list.length-1,Math.round((list.length-1)*rank)));return list[idx];}
function cloneWave(w){return{...w};}
function arenaStage(modeId,ruleId='standard'){
 const mode=SETTLEMENT_ARENA_MODES.find(x=>x.id===modeId),rule=SETTLEMENT_ARENA_RULES.find(x=>x.id===ruleId)||SETTLEMENT_ARENA_RULES[0];if(!mode)return null;
 const selected=mode.kind==='gauntlet'?[pickBoss(0),pickBoss(.5),pickBoss(1)].filter(Boolean):[pickBoss(mode.sourceRank)].filter(Boolean);if(!selected.length)return null;
 const waves=mode.kind==='gauntlet'?selected.map(x=>{const bossWave=[...(x.stage.waves||[])].reverse().find(w=>String(w.type).includes('boss'))||x.stage.waves?.at(-1);return bossWave?{...cloneWave(bossWave),count:1,interval:0}:null;}).filter(Boolean):selected[0].stage.waves.map(cloneWave);
 const recLevel=Math.max(...selected.map(x=>Number(x.stage.recLevel)||1));
 return{id:`arena:${mode.id}:${rule.id}`,name:`訓練場：${mode.name} / ${rule.name}`,recLevel,boss:true,arenaTraining:true,arenaModeId:mode.id,arenaRuleId:rule.id,arenaNoFlee:!!rule.noFlee,waves,rewards:{gold:0,exp:0},dropTable:[],sourceStageIds:selected.map(x=>x.stage.id),sourceNames:selected.map(x=>x.stage.name)};
}

state.settlementArenaModes=function(){return SETTLEMENT_ARENA_MODES.map(x=>({...x}));};
state.settlementArenaRules=function(){return SETTLEMENT_ARENA_RULES.map(x=>({...x}));};
state.settlementArenaStage=function(modeId,ruleId='standard'){return arenaStage(modeId,ruleId);};
state.settlementArenaSummary=function(){const m=meta();return{runs:m.runs||0,best:{...m.best},modes:this.settlementArenaModes(),rules:this.settlementArenaRules()};};
state.recordSettlementArenaResult=function(stage,result){if(!stage?.arenaTraining)return null;const m=meta(),turns=Math.max(0,Number(result?.arenaTurns)||0),cleared=!!result?.cleared,key=`${stage.arenaModeId}:${stage.arenaRuleId}`;m.runs=(m.runs||0)+1;const prev=m.best[key];if(cleared&&(!prev||turns<prev.turns))m.best[key]={turns,at:Date.now(),sourceStageIds:[...(stage.sourceStageIds||[])]};this.save();return{key,turns,cleared,best:m.best[key]||null};};

const prevGrant=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function(enemy){if(this.stage?.arenaTraining){enemy._rewardsGranted=true;return{xp:0,gold:0,leveledUp:false,drops:[],manastone:0,onKillEvents:[],bossSlayerBuff:null,training:true};}return prevGrant.call(this,enemy);};
const prevFlee=BattleEngine.prototype.canFlee;
BattleEngine.prototype.canFlee=function(){if(this.stage?.arenaTraining&&this.stage.arenaNoFlee)return false;return prevFlee.call(this);};
const prevAdvance=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function(command){if(this.stage?.arenaTraining)this._arenaTurns=(this._arenaTurns||0)+1;const out=prevAdvance.call(this,command);if(this.stage?.arenaTraining&&out?.result)out.result.arenaTurns=this._arenaTurns||0;return out;};
const prevRetreat=BattleEngine.prototype.forceRetreat;
BattleEngine.prototype.forceRetreat=function(){const out=prevRetreat.call(this);if(this.stage?.arenaTraining&&out)out.arenaTurns=this._arenaTurns||0;return out;};
