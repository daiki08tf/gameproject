/* Phase 12.11-12.14 — finish horizontal content inside existing systems. */
import { state } from '../state.js';
import { PHASE12_CODEX_GROUPS,phase12MasterySnapshot } from '../data/phase12Finale.js';

state.phase12HorizontalMastery=function(){
  const discoveries=this.data.world2?.discoveries||{};
  return phase12MasterySnapshot(id=>this.isStageCleared(id),discoveries);
};

state.phase12RegionDepthMastery=function(chapter){
  return this.phase12HorizontalMastery().regions.find(x=>x.chapter===Number(chapter))||null;
};

// Preserve the Phase 9 mastery contract exactly; Phase 12 only attaches an
// optional horizontal-depth record and never revokes an already earned mastery.
if(state.phase9RegionMastery){
  const previousRegionMastery=state.phase9RegionMastery.bind(state);
  state.phase9RegionMastery=function phase12RegionMasteryExpansion(chapterId){
    const base=previousRegionMastery(chapterId);
    if(!base)return base;
    return {...base,horizontalDepth:this.phase12RegionDepthMastery(chapterId)};
  };
}

state.phase12CodexGroups=function(){
  const entries=this.data.monsterCodex||{};
  return PHASE12_CODEX_GROUPS.map(group=>{
    const seen=group.enemyIds.filter(id=>entries[id]?.seen).length;
    const completed=group.enemyIds.filter(id=>entries[id]?.seen&&(entries[id]?.kills||0)>0).length;
    return {...group,seen,completed,total:group.enemyIds.length,pct:group.enemyIds.length?completed/group.enemyIds.length*100:0};
  });
};

const previousProgress=state.explorationProgress.bind(state);
state.explorationProgress=function phase12ApexExplorationProgress(id){
  const progress=previousProgress(id);
  if(id!=='convergence_observatory'||!progress)return progress;
  const mastery=this.phase12HorizontalMastery();
  if(progress.unlocked&&!mastery.apexReady){
    return {...progress,state:'clued',unlocked:false,phase12ApexLocked:true,masteryCleared:mastery.cleared,masteryTotal:mastery.total};
  }
  return {...progress,phase12ApexLocked:false,masteryCleared:mastery.cleared,masteryTotal:mastery.total};
};

function escapeHtml(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function appendCodexHorizontalSummary(){
  const root=document.getElementById('monsterCodexContent');
  if(!root||root.querySelector('[data-phase12-codex]'))return;
  const groups=state.phase12CodexGroups();
  const box=document.createElement('div');box.dataset.phase12Codex='1';box.className='forge-card';
  box.innerHTML=`<div class="forge-card-name">横軸生態記録</div><div class="sub">${groups.map(g=>`${escapeHtml(g.name)} ${g.completed}/${g.total}`).join(' ／ ')}</div><div class="hint" style="margin-top:6px">希少観測種は実際に遭遇するまで伏せられる。既存の魔物図鑑記録をそのまま使用。</div>`;
  const firstHeading=root.querySelector('h3');root.insertBefore(box,firstHeading||root.firstChild?.nextSibling||null);
}

document.getElementById('goMonsterCodexBtn')?.addEventListener('click',appendCodexHorizontalSummary);
