/* Phase 14 — Final Integration UI. No new screen; enrich existing surfaces. */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { buildSecretRealmStage } from '../data/secretRealms.js';

function ensureStyles(){
  if(document.querySelector('link[data-final-integration]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='css/finalIntegration.css';link.dataset.finalIntegration='true';document.head.appendChild(link);
}
function uiData(){
  if(!state.data.ui14)state.data.ui14={recentStageIds:[],favoriteStageIds:[]};
  state.data.ui14.recentStageIds ||= [];
  state.data.ui14.favoriteStageIds ||= [];
  return state.data.ui14;
}
function rememberRecent(stageId){
  if(!stageId)return;
  const d=uiData();d.recentStageIds=[stageId,...d.recentStageIds.filter(x=>x!==stageId)].slice(0,6);state.save();
}
function toggleFavorite(stageId){
  const d=uiData(),i=d.favoriteStageIds.indexOf(stageId);
  if(i>=0)d.favoriteStageIds.splice(i,1);else d.favoriteStageIds.unshift(stageId);
  state.save();return d.favoriteStageIds.includes(stageId);
}
function allKnownStages(){
  const out=[];
  for(const chapter of CHAPTERS)for(const stage of chapter.stages||[])out.push(stage);
  for(const site of state.explorationSites||[]){if(!site.realm)continue;const stage=buildSecretRealmStage(site.realm.id);if(stage)out.push(stage);}
  return out;
}
function cleanName(v=''){return String(v).replace(/^[\s\p{Extended_Pictographic}◇◆🔀🎯👑🚪✦🔒]+/u,'').trim();}
function stageFromCard(card){
  const name=cleanName(card.querySelector('.name')?.textContent||'');
  if(!name)return null;
  return allKnownStages().find(s=>name.includes(s.name)||s.name.includes(name))||null;
}
function nextGoal(){
  for(const chapter of CHAPTERS){
    for(const stage of chapter.stages||[]){
      if(stage.branch||stage.bounty)continue;
      if(!state.isStageCleared(stage.id))return {title:stage.name,sub:`メイン進行 / 推奨Lv ${stage.recLevel}`,stageId:stage.id};
    }
  }
  const mastery=state.phase12HorizontalMastery?.();
  if(mastery&&!mastery.complete)return {title:'横軸探索を進める',sub:`任意異界 ${mastery.cleared}/${mastery.total} 踏破`,stageId:null};
  if((state.data.abyssBestDepth||0)<3000)return {title:'深淵をさらに進む',sub:`最高 ${state.data.abyssBestDepth||0}F / 3000F`,stageId:null};
  return {title:'記録とビルドを更新する',sub:'Challenge / REMATCH+ / Rare Hunt',stageId:null};
}
function enhanceHome(){
  const menu=document.querySelector('#homeScreen .home-menu');if(!menu)return;
  let goal=menu.querySelector('.phase14-next-goal');
  if(!goal){goal=document.createElement('div');goal.className='phase14-next-goal';menu.prepend(goal);}
  const n=nextGoal();goal.innerHTML=`<div class="phase14-next-kicker">NEXT GOAL</div><div class="phase14-next-title">${n.title}</div><div class="phase14-next-sub">${n.sub}</div>`;
  goal.onclick=()=>document.getElementById('goStageBtn')?.click();
  let sum=menu.querySelector('.phase14-home-summary');if(!sum){sum=document.createElement('div');sum.className='phase14-home-summary';goal.after(sum);}
  const d=uiData(),p13=state.phase13Data?.()||{};
  sum.innerHTML=`<span class="phase14-chip">最高Lv ${state.highestCharacterLevel||state.currentLevel}</span><span class="phase14-chip">深淵 ${state.data.abyssBestDepth||0}F</span><span class="phase14-chip">Challenge ${p13.challengeWins||0}勝</span><span class="phase14-chip">★ ${d.favoriteStageIds.length}</span>`;
}
function applyStageFilter(list,mode){
  const d=uiData();
  list.querySelectorAll(':scope > .stage-card').forEach(card=>{
    const id=card.dataset.phase14StageId;if(!id){card.hidden=false;return;}
    let show=true;
    if(mode==='favorite')show=d.favoriteStageIds.includes(id);
    else if(mode==='recent')show=d.recentStageIds.includes(id);
    else if(mode==='uncleared')show=!state.isStageCleared(id);
    card.hidden=!show;
  });
}
function stageKind(stage){
  if(stage.raid)return 'RAID';
  if(stage.bounty)return 'BOUNTY';
  if(stage.boss)return 'BOSS';
  if(stage.secretRealm)return 'SECRET';
  if(stage.branch)return 'SIDE';
  return '';
}
function enhanceStageList(){
  const list=document.getElementById('stageList');if(!list)return;
  list.querySelectorAll(':scope > .stage-card').forEach(card=>{
    if(card.dataset.phase14Enhanced)return;
    const stage=stageFromCard(card);if(!stage)return;
    card.dataset.phase14Enhanced='true';card.dataset.phase14StageId=stage.id;
    card.addEventListener('click',()=>rememberRecent(stage.id),{capture:true});
    const main=card.firstElementChild;if(!main)return;
    // Generic emoji remain secondary decoration elsewhere, but stage identity is text-first.
    const nameEl=card.querySelector('.name');if(nameEl)nameEl.textContent=stage.name;
    const meta=document.createElement('div');meta.className='phase14-stage-meta';
    const r=state.phase13RecordFor?.(stage.id),kind=stageKind(stage);
    meta.innerHTML=`${kind?`<span>${kind}</span>`:''}${state.isStageCleared(stage.id)?'<span>CLEAR</span>':'<span>NEW</span>'}${r?.bestTurns?`<span>BEST ${r.bestTurns}T</span>`:''}`;main.appendChild(meta);
    const fav=document.createElement('button');fav.type='button';fav.className='btn-sub phase14-favorite-btn';fav.textContent=uiData().favoriteStageIds.includes(stage.id)?'★':'☆';fav.setAttribute('aria-label','お気に入り');
    fav.addEventListener('click',ev=>{ev.stopPropagation();fav.textContent=toggleFavorite(stage.id)?'★':'☆';enhanceHome();});card.appendChild(fav);
  });
  if(!list.querySelector('.phase14-adventure-strip')&&list.querySelector('[data-phase14-stage-id]')){
    const strip=document.createElement('div');strip.className='phase14-adventure-strip';
    for(const [id,label] of [['all','すべて'],['uncleared','未攻略'],['recent','最近'],['favorite','★お気に入り']]){
      const b=document.createElement('button');b.className=id==='all'?'btn-main':'btn-sub';b.textContent=label;b.addEventListener('click',()=>{strip.querySelectorAll('button').forEach(x=>x.className='btn-sub');b.className='btn-main';applyStageFilter(list,id);});strip.appendChild(b);
    }
    list.prepend(strip);
  }
}
function installObservers(){
  const list=document.getElementById('stageList');if(list)new MutationObserver(()=>queueMicrotask(enhanceStageList)).observe(list,{childList:true,subtree:true});
}

// Preserve existing save contract; Phase 14 only adds optional navigation history.
const previousRecordStageResult=state.recordStageResult.bind(state);
state.recordStageResult=function phase14RecordStageResult(stageId,cleared){const out=previousRecordStageResult(stageId,cleared);if(cleared)rememberRecent(stageId);return out;};

ensureStyles();enhanceStageList();installObservers();
export { enhanceHome,enhanceStageList,nextGoal,rememberRecent,toggleFavorite };
