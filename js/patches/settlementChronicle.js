/* Settlement 3.0 S17 / Adventure W32 — read-only Chronicle derived view. */
import './worldTierRuntime.js';
import './inheritanceCore.js';
import './bountyUniqueFoundation.js';
import './adventureWorld4WorldRecords.js';
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { SETTLEMENT_CHRONICLE_EXHIBITS } from '../data/settlementChronicle.js';

function realBossStages(){return CHAPTERS.filter(ch=>!ch.arenaTraining).flatMap(ch=>(ch.stages||[]).filter(s=>s.boss&&!s.arenaTraining).map(stage=>({chapter:ch,stage})));}
function bossRecords(){return realBossStages().filter(x=>state.isStageCleared?.(x.stage.id)).map(x=>({id:x.stage.id,name:x.stage.name,chapter:x.chapter?.name||'',recLevel:Number(x.stage.recLevel)||0}));}
function uniqueRecords(){return (state.bountyUniqueCollection?.()||[]).map(x=>({id:x.id,name:x.name,rarity:x.rarity,slot:x.slot,lore:x.lore||''}));}
function generationRecords(){const history=Array.isArray(state.data.inheritanceHistory)?state.data.inheritanceHistory:[];return history.map((x,i)=>({generation:i+1,nextGeneration:i+2,fromLevel:Number(x.fromLevel)||1,ratePct:Number(x.ratePct)||0,bonusPoints:Number(x.bonusPoints)||0,at:x.at||null}));}
function worldRecordDetail(summary){if(!summary?.total)return'探索記録なし';return`発見 ${summary.discoveries} / Region Boss ${summary.regionBosses} / Nemesis ${summary.nemesis} / Mystery ${summary.mysteries} / Secret ${summary.secrets}`;}

state.settlementChronicle=function(){
 const bosses=bossRecords(),uniques=uniqueRecords(),generations=generationRecords(),worldRecords=this.adventure4WorldRecords?.()||{all:[]},worldSummary=this.adventure4WorldRecordSummary?.()||{total:0,discoveries:0,regionBosses:0,nemesis:0,mysteries:0,secrets:0},tier=this.activeWorldTier?.()||{id:this.data.worldTierId||'normal',name:'Normal',rank:0},abyssBest=Math.max(0,Number(this.data.abyssBestDepth)||0),currentGeneration=Math.max(1,(Number(this.data.reincarnations)||0)+1);
 const rows={
  bosses:{value:`${bosses.length}体`,detail:bosses.length?bosses.slice(-5).map(x=>x.name).join(' / '):'討伐記録なし',records:bosses},
  abyss:{value:abyssBest?`${abyssBest}F`:'未到達',detail:'既存Abyss最高到達記録を表示',records:[]},
  worldTier:{value:tier.name||tier.id,detail:`Rank ${Number(tier.rank)||0}`,records:[]},
  worldRecords:{value:`${worldSummary.total}件`,detail:worldRecordDetail(worldSummary),records:worldRecords.all||[]},
  uniques:{value:`${uniques.length}点`,detail:uniques.length?uniques.slice(-5).map(x=>x.name).join(' / '):'収蔵品なし',records:uniques},
  generations:{value:`第${currentGeneration}世代`,detail:generations.length?`継承 ${generations.length}回 / 最新 Lv${generations.at(-1).fromLevel}`:'初代の記録',records:generations}
 };
 return SETTLEMENT_CHRONICLE_EXHIBITS.map(x=>({...x,...rows[x.id]}));
};
state.settlementChronicleSummary=function(){const exhibits=this.settlementChronicle(),worldRecords=this.adventure4WorldRecordSummary?.()||null;return{exhibits:exhibits.length,bosses:exhibits.find(x=>x.id==='bosses')?.records.length||0,uniques:exhibits.find(x=>x.id==='uniques')?.records.length||0,worldRecords,generation:Math.max(1,(Number(this.data.reincarnations)||0)+1),abyssBestDepth:Math.max(0,Number(this.data.abyssBestDepth)||0),worldTier:this.activeWorldTier?.()||null};};
state.settlementChronicleTimeline=function(){const rows=generationRecords().map(x=>({kind:'inheritance',generation:x.generation,title:`第${x.generation}世代`,text:`Lv ${x.fromLevel}で継承し、第${x.nextGeneration}世代へ。 継承率 ${x.ratePct}% / Bonus +${x.bonusPoints}`,at:x.at}));const current=Math.max(1,(Number(this.data.reincarnations)||0)+1);rows.push({kind:'current',generation:current,title:`第${current}世代・現在`,text:`Lv ${this.characterLevel||1} / Abyss ${Math.max(0,Number(this.data.abyssBestDepth)||0)}F / ${this.activeWorldTier?.().name||this.data.worldTierId||'Normal'}`,at:null});return rows;};
