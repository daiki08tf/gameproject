/* Content Pack II E — final integration: closure, Codex ecology, lore, revisit guidance. */
import './contentPackIICD.js';
import { state } from '../state.js';
import { CP2_RUMORS,CP2_HIDDEN_ENCOUNTERS } from '../data/contentPackIIAB.js';
import { CP2_SECRET_CHAINS,CP2_HIDDEN_BOSSES } from '../data/contentPackIICD.js';
import { CP2_CODEX_ECOLOGY,CP2_CHAIN_LORE,CP2_ROUTE_OUTCOMES,cp2SuggestedDestination } from '../data/contentPackIIE.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function escapeHtml(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function bossClearCount(chainId){return Object.entries(CP2_HIDDEN_BOSSES).filter(([,b])=>b.chainId===chainId).filter(([id])=>world().discoveries[`cp2:boss:${id}:cleared`]).length;}
function bossTotal(chainId){return Object.values(CP2_HIDDEN_BOSSES).filter(b=>b.chainId===chainId).length;}

function syncE(){
  const d=world().discoveries;
  for(const [routeId,outcome] of Object.entries(CP2_ROUTE_OUTCOMES)){
    const rec=d[`cp2:route:${routeId}`];if(!rec)continue;
    rec.outcome=outcome;rec.rewardHint=outcome;rec.contentPackII=true;
  }
  for(const rumor of CP2_RUMORS){
    const rec=d[`rumor:cp2:${rumor.id}`];if(!rec)continue;
    const dest=cp2SuggestedDestination(rumor.id,{discoveries:d,isStageCleared:id=>state.isStageCleared(id)});
    rec.nextAction=dest?`${dest.label} — ${dest.reason}`:null;
    const encounter=CP2_HIDDEN_ENCOUNTERS[rumor.stageId];
    if(rec.rumorState==='resolved'&&encounter&&d[`cp2:route:${encounter.routeId}`]){
      const route=d[`cp2:route:${encounter.routeId}`];
      rec.hint=`${d[`cp2:encounter:${rumor.id}`]?.resolution||'噂の生態を確認した。'} ${route.outcome||route.rewardHint||''}`.trim();
    }
  }
  for(const chain of Object.values(CP2_SECRET_CHAINS)){
    const chainRec=d[`cp2:chain:${chain.id}`];if(!chainRec?.chainResolved)continue;
    const lore=CP2_CHAIN_LORE[chain.id];
    if(lore)put(lore.id,{name:lore.name,hint:lore.text,loreFragment:true,contentPackII:true,chainId:chain.id,worldMystery:true});
    const rumorRec=d[`rumor:cp2:chain:${chain.id}`];if(!rumorRec)continue;
    const clears=bossClearCount(chain.id),total=bossTotal(chain.id);
    rumorRec.bossClearCount=clears;rumorRec.bossTotal=total;
    rumorRec.nextAction=clears<total?'関連地域を再訪し、収束した観測個体を追う':'討伐記録・Codex・Ranchの新系統を確認';
    if(clears>=total){rumorRec.hint=`${chain.resolution} 関連する観測個体の討伐記録も揃った。`;rumorRec.chainOutcomeComplete=true;}
  }
}

state.cp2LoreFragments=function(){syncE();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackII&&v?.loreFragment).map(([id,v])=>({id,...v}));};
state.cp2RouteOutcomes=function(){syncE();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackII&&v?.hiddenRoute).map(([id,v])=>({id,...v}));};

if(state.codexFieldGuide&&!state.codexFieldGuide.__cp2e){
  const previous=state.codexFieldGuide.bind(state);
  const wrapped=function cp2EFieldGuide(enemyId){
    const base=previous(enemyId),eco=CP2_CODEX_ECOLOGY[enemyId];if(!eco)return base;
    const entry=this.data.monsterCodex?.[enemyId]||{};
    return {...base,habitatHint:(base?.level?.rank||0)>=2?`生息・観測域：${eco.habitat}`:base?.habitatHint,ecologyHint:(base?.level?.rank||0)>=3?eco.ecology:base?.ecologyHint,cp2Ecology:true,hiddenEcology:!!entry.seen};
  };
  wrapped.__cp2e=true;state.codexFieldGuide=wrapped;
}
if(state.rumorNotebook&&!state.rumorNotebook.__cp2e){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp2ENotebook(){syncE();return previous();};wrapped.__cp2e=true;state.rumorNotebook=wrapped;
}

function decorateNotebook(){
  syncE();
  const root=document.getElementById('monsterCodexContent');if(!root)return;
  const box=root.querySelector('[data-packc-rumors]');if(!box)return;
  const byName=new Map(state.rumorNotebook().map(r=>[(r.name||'').replace(/^噂：|^秘密連鎖：/,''),r]));
  box.querySelectorAll('.forge-card').forEach(card=>{
    if(card.querySelector('.cp2e-next'))return;
    const title=card.querySelector('.forge-card-name')?.textContent?.trim();if(!title)return;
    const rec=byName.get(title);if(!rec?.nextAction)return;
    const line=document.createElement('div');line.className='hint cp2e-next';line.textContent=`NEXT — ${rec.nextAction}`;card.appendChild(line);
  });
  const lore=state.worldLoreFragments?.()||state.cp2LoreFragments();
  const existingLore=box.querySelector('[data-cp2e-lore]');
  // Rebuilding this block unconditionally on every call is itself a childList
  // mutation inside #monsterCodexContent, which this function's own
  // MutationObserver watches with subtree:true — so an unconditional
  // remove+recreate here retriggers the observer forever (infinite loop,
  // reproducible as soon as the player has collected at least one 断片).
  // Only touch the DOM when the fragment count actually changed.
  if(existingLore&&Number(existingLore.dataset.cp2eLoreCount)===lore.length)return;
  existingLore?.remove();
  if(!lore.length)return;
  const details=document.createElement('details');details.className='ui-detail-disclosure';details.dataset.cp2eLore='1';details.dataset.cp2eLoreCount=String(lore.length);
  details.innerHTML=`<summary>世界断片 ${lore.length}</summary><div class="ui-detail-body">${lore.map(x=>`<div class="forge-card-sub" style="margin:6px 0"><b>${escapeHtml(x.name.replace(/^断片：/,''))}</b><br>${escapeHtml(x.hint)}</div>`).join('')}</div>`;
  box.appendChild(details);
}

if(typeof MutationObserver!=='undefined'){
  const start=()=>{const root=document.getElementById('monsterCodexContent');if(!root)return;new MutationObserver(()=>queueMicrotask(decorateNotebook)).observe(root,{childList:true,subtree:true});queueMicrotask(decorateNotebook);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}

document.getElementById('goMonsterCodexBtn')?.addEventListener('click',()=>queueMicrotask(decorateNotebook));
syncE();
export {syncE,decorateNotebook};
