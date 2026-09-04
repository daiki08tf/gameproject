/* System Deepening Pack C — Exploration Intelligence runtime */
import './world2Core.js';
import './phase12FinaleRuntime.js';
import { state } from '../state.js';
import { PHASE12_RUMORS } from '../data/phase12WorldActivity.js';
import {
  PACK_C_SITE_STAGE,PACK_C_SITE_CHAPTER,TREASURE_CLUES,SECRET_CHAIN,
  rumorStateFor,regionalKnowledgeBenefit,enhancedRumorHint,secretChainProgress,
} from '../data/systemDeepeningPackC.js';

function ensureWorld(){
  state.data.world2??={};
  state.data.world2.discoveries??={};
  return state.data.world2;
}
function chapterKey(chapter){return `ch${Number(chapter)}`;}
function masteryForSite(siteId){
  const chapter=PACK_C_SITE_CHAPTER[siteId];
  if(!chapter)return null;
  return state.phase9RegionMastery?.(chapterKey(chapter))||state.phase9RegionMastery?.(String(chapter))||null;
}
function traceSeen(siteId){return !!ensureWorld().discoveries[`trace:${siteId}`];}
function upsertDiscovery(id,patch){
  const w=ensureWorld(),prev=w.discoveries[id]||{};
  w.discoveries[id]={...prev,...patch,at:prev.at||Date.now()};
  return w.discoveries[id];
}

function syncPhase12Rumors(){
  const w=ensureWorld();
  for(const rumor of PHASE12_RUMORS){
    const id=`rumor:${rumor.id}`,entry=w.discoveries[id];
    if(!entry)continue;
    const mastery=masteryForSite(rumor.targetSiteId);
    const stateInfo=rumorStateFor({targetSiteId:rumor.targetSiteId,discoveries:w.discoveries,isStageCleared:x=>state.isStageCleared(x)});
    const benefit=regionalKnowledgeBenefit({mastered:!!mastery?.mastered,horizontalCleared:state.isStageCleared(PACK_C_SITE_STAGE[rumor.targetSiteId]),traceSeen:traceSeen(rumor.targetSiteId)});
    entry.rumor=true;entry.rumorId=rumor.id;entry.rumorState=stateInfo.id;entry.rumorStateLabel=stateInfo.label;
    entry.hint=enhancedRumorHint(rumor,{mastered:!!mastery?.mastered,traceSeen:traceSeen(rumor.targetSiteId)});
    entry.regionKnowledge=benefit.knowledge;
    if(stateInfo.id==='resolved'&&!entry.resolvedAt)entry.resolvedAt=Date.now();
    const clue=TREASURE_CLUES[rumor.id];
    if(clue&&(stateInfo.id!=='unresolved'||mastery?.mastered)){
      upsertDiscovery(`clue:${clue.id}`,{name:`手掛かり：${clue.name}`,hint:clue.text,clueItem:true,rumorId:rumor.id,targetSiteId:rumor.targetSiteId});
    }
  }
}

function syncSecretChain(){
  const w=ensureWorld();
  const oldClear=state.isStageCleared('secret-old-king-tomb');
  const libraryClear=state.isStageCleared('secret-inverted-library');
  const dragonClear=state.isStageCleared('secret-dragonbone-canyon');
  if(!oldClear)return;

  upsertDiscovery('clue:buried-coordinate-tablet',{name:`手掛かり：${SECRET_CHAIN.steps[0].title}`,hint:SECRET_CHAIN.steps[0].text,clueItem:true,secretChain:SECRET_CHAIN.id,chainStep:1});
  let completed=1;
  if(libraryClear){
    completed=2;
    upsertDiscovery('clue:buried-coordinate-decoded',{name:`手掛かり：${SECRET_CHAIN.steps[1].title}`,hint:SECRET_CHAIN.steps[1].text,clueItem:true,secretChain:SECRET_CHAIN.id,chainStep:2});
  }
  if(libraryClear&&dragonClear){
    completed=3;
    upsertDiscovery('clue:buried-coordinate-zero',{name:`手掛かり：${SECRET_CHAIN.steps[2].title}`,hint:SECRET_CHAIN.steps[2].text,clueItem:true,secretChain:SECRET_CHAIN.id,chainStep:3});
    upsertDiscovery('secret-chain:buried-observation-coordinate',{name:`秘密連鎖：${SECRET_CHAIN.name}`,hint:SECRET_CHAIN.resolution,secretChain:SECRET_CHAIN.id,chainResolved:true,targetSiteId:'convergence_observatory',resolvedAt:Date.now()});
  }
  const record=upsertDiscovery(`rumor:${SECRET_CHAIN.id}`,{
    name:`噂：${SECRET_CHAIN.name}`,hint:completed>=3?SECRET_CHAIN.resolution:SECRET_CHAIN.steps[completed]?.text||SECRET_CHAIN.steps[completed-1].text,
    rumor:true,rumorId:SECRET_CHAIN.id,secretChain:SECRET_CHAIN.id,chainCompleted:completed,chainTotal:3,
    rumorState:completed>=3?'resolved':'tracking',rumorStateLabel:completed>=3?'解決済み':'追跡中',targetSiteId:completed>=3?'convergence_observatory':SECRET_CHAIN.steps[completed]?.siteId||null,
  });
  if(completed>=3&&!record.resolvedAt)record.resolvedAt=Date.now();
  if(w.discoveries['rumor:nameless-king'])w.discoveries['rumor:nameless-king'].chainLead=SECRET_CHAIN.id;
}

function syncPackC({save=false}={}){
  ensureWorld();
  syncPhase12Rumors();
  syncSecretChain();
  if(save)state.save();
}

state.rumorNotebook=function rumorNotebook(){
  syncPackC();
  const discoveries=ensureWorld().discoveries;
  return Object.entries(discoveries)
    .filter(([,v])=>v?.rumor)
    .map(([id,v])=>({id,...v}))
    .sort((a,b)=>{
      const rank={tracking:0,unresolved:1,resolved:2};
      return (rank[a.rumorState]??9)-(rank[b.rumorState]??9)||(b.at||0)-(a.at||0);
    });
};
state.rumorNotebookSummary=function(){
  const all=this.rumorNotebook();
  const count=id=>all.filter(x=>x.rumorState===id).length;
  return{total:all.length,unresolved:count('unresolved'),tracking:count('tracking'),resolved:count('resolved')};
};
state.packCClueItems=function(){syncPackC();return Object.entries(ensureWorld().discoveries).filter(([,v])=>v?.clueItem).map(([id,v])=>({id,...v})).sort((a,b)=>(a.chainStep||99)-(b.chainStep||99)||(b.at||0)-(a.at||0));};
state.packCSecretChain=function(){syncPackC();return{...secretChainProgress({isStageCleared:id=>this.isStageCleared(id)}),definition:SECRET_CHAIN};};
state.regionKnowledgeBenefit=function(chapter){
  const mastery=this.phase9RegionMastery?.(chapterKey(chapter))||this.phase9RegionMastery?.(String(chapter));
  const horizontal=mastery?.horizontalDepth;
  return regionalKnowledgeBenefit({mastered:!!mastery?.mastered,horizontalCleared:!!horizontal?.cleared,traceSeen:!!horizontal?.traceSeen});
};

// Preserve the existing mastery contract and attach exploration intelligence only.
if(state.phase9RegionMastery&&!state.phase9RegionMastery.__packC){
  const previous=state.phase9RegionMastery.bind(state);
  const wrapped=function packCRegionMastery(chapterId){
    const base=previous(chapterId);if(!base)return base;
    const horizontal=base.horizontalDepth;
    return{...base,knowledgeBenefit:regionalKnowledgeBenefit({mastered:!!base.mastered,horizontalCleared:!!horizontal?.cleared,traceSeen:!!horizontal?.traceSeen})};
  };
  wrapped.__packC=true;state.phase9RegionMastery=wrapped;
}

// Events and clears can advance notebook state without manual note-taking.
if(state.world2ResolveEvent&&!state.world2ResolveEvent.__packC){
  const previous=state.world2ResolveEvent.bind(state);
  const wrapped=function packCResolveEvent(...args){const out=previous(...args);if(out?.ok)syncPackC({save:true});return out;};
  wrapped.__packC=true;state.world2ResolveEvent=wrapped;
}
if(state.rollWorld2ClearRewards&&!state.rollWorld2ClearRewards.__packC){
  const previous=state.rollWorld2ClearRewards.bind(state);
  const wrapped=function packCClearRewards(...args){const out=previous(...args);syncPackC({save:true});return out;};
  wrapped.__packC=true;state.rollWorld2ClearRewards=wrapped;
}

function escapeHtml(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function rumorGroup(title,items){
  if(!items.length)return'';
  return `<details class="ui-detail-disclosure packc-rumor-group" ${title==='追跡中'?'open':''}><summary>${title} ${items.length}</summary><div class="ui-detail-body">${items.map(r=>`<div class="forge-card" style="margin:6px 0"><div class="forge-card-name">${escapeHtml(r.name?.replace(/^噂：/,''))}</div><div class="forge-card-sub">${escapeHtml(r.hint||'')}</div>${r.regionKnowledge?`<div class="hint">土地勘 Lv.${r.regionKnowledge}</div>`:''}</div>`).join('')}</div></details>`;
}
function appendRumorNotebook(){
  const root=document.getElementById('monsterCodexContent');if(!root)return;
  root.querySelector('[data-packc-rumors]')?.remove();
  const list=state.rumorNotebook(),summary=state.rumorNotebookSummary(),clues=state.packCClueItems(),chain=state.packCSecretChain();
  const box=document.createElement('section');box.dataset.packcRumors='1';box.className='forge-card';
  box.innerHTML=`<div class="forge-card-name">RUMORS ${summary.resolved}/${summary.total}</div><div class="sub">追跡 ${summary.tracking} ／ 未解決 ${summary.unresolved} ／ 解決 ${summary.resolved}</div>`
    +rumorGroup('追跡中',list.filter(x=>x.rumorState==='tracking'))+rumorGroup('未解決',list.filter(x=>x.rumorState==='unresolved'))+rumorGroup('解決済み',list.filter(x=>x.rumorState==='resolved'))
    +`<details class="ui-detail-disclosure"><summary>手掛かり ${clues.length}</summary><div class="ui-detail-body">${clues.length?clues.map(c=>`<div class="forge-card-sub" style="margin:6px 0"><b>${escapeHtml(c.name?.replace(/^手掛かり：/,''))}</b><br>${escapeHtml(c.hint)}</div>`).join(''):'まだ手掛かりはない。'}</div></details>`
    +`<div class="hint" style="margin-top:6px">秘密連鎖：${chain.completed}/${chain.total}${chain.resolved?' — RESOLVED':''}</div>`;
  const heading=[...root.querySelectorAll('h3')].find(h=>h.textContent?.includes('魔物一覧'))||root.querySelector('h3');
  root.insertBefore(box,heading||root.firstChild?.nextSibling||null);
}

document.getElementById('goMonsterCodexBtn')?.addEventListener('click',()=>queueMicrotask(appendRumorNotebook));
if(typeof MutationObserver!=='undefined'){
  const root=document.getElementById('monsterCodexContent');
  if(root)new MutationObserver(()=>{if(root.childElementCount&&!root.querySelector('[data-packc-rumors]'))queueMicrotask(appendRumorNotebook);}).observe(root,{childList:true});
}
syncPackC({save:false});
export { syncPackC,appendRumorNotebook };
