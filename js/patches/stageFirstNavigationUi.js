/* CLR-13 — Stage-first browser presentation bridge.
   Restores canonical Chapter/Stage navigation as the visible Story spine while
   preserving World 4.0 runtime modules for later Hunt attachment. */
import { CHAPTERS } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { isStageDiscovered } from '../screens/stageSelect.js';
import { state } from '../state.js';
import './adventureWorld4RouteEngine.js';
import './adventureWorld4SceneRuntime.js';
import './adventureWorld4ContentPackI.js';
import './adventureWorld4HighLevelRuntime.js';

function currentCanonicalChapter(){
  const title=document.getElementById('chapterTitle')?.textContent||'';
  return CHAPTERS.find(ch=>journeyName(ch)===title)||null;
}

function ordinaryVisibleStages(chapter){
  return chapter?.stages?.filter((stage,index)=>isStageDiscovered(chapter,stage,index))||[];
}

function statusLabel(stage){
  if(state.isStageCleared(stage.id))return 'CLEAR';
  if(stage.branch||stage.bounty)return 'OPEN';
  return 'NEXT';
}

export function enhanceStageFirstStageList(){
  const list=document.getElementById('stageList');
  const chapter=currentCanonicalChapter();
  if(!list||!chapter)return false;

  const visibleStages=ordinaryVisibleStages(chapter);
  const cards=[...list.querySelectorAll(':scope > .stage-card')];
  for(let index=0;index<Math.min(cards.length,visibleStages.length);index++){
    const stage=visibleStages[index],card=cards[index];
    const name=card.querySelector('.name'),cleared=card.querySelector('.cleared');
    if(name&&!name.textContent.includes(stage.id))name.textContent=`${stage.id} ${name.textContent}`;
    if(cleared)cleared.textContent=statusLabel(stage);
    card.dataset.stageId=stage.id;
    card.dataset.stageState=statusLabel(stage).toLowerCase();
  }

  const visibleIds=new Set(visibleStages.map(stage=>stage.id));
  const lockedMain=chapter.stages.filter((stage,index)=>!stage.branch&&!stage.bounty&&!visibleIds.has(stage.id)&&!isStageDiscovered(chapter,stage,index));
  for(const stage of lockedMain){
    if(list.querySelector(`[data-stage-id="${stage.id}"]`))continue;
    const card=document.createElement('div');
    card.className='stage-card locked';
    card.dataset.stageId=stage.id;
    card.dataset.stageState='locked';
    card.innerHTML=`<div><div class="name">🔒 ${stage.id} ???</div><div class="rec">直前のステージをクリアすると開放</div></div><div class="cleared">LOCKED</div>`;
    list.appendChild(card);
  }
  return true;
}

export function enhanceStageFirstChapterList(){
  const list=document.getElementById('chapterList');
  if(!list)return false;
  const regions=[...list.querySelectorAll(':scope > .world3-region')];
  if(regions.length)list.prepend(...regions);
  return true;
}

function queueEnhance(target){
  queueMicrotask(()=>{
    if(target==='chapter')enhanceStageFirstChapterList();
    if(target==='stage')enhanceStageFirstStageList();
  });
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('#goStageBtn')||target.closest('#stageBackBtn'))queueEnhance('chapter');
  if(target.closest('#chapterList .stage-card')||target.closest('#confirmBackBtn'))queueEnhance('stage');
});

window.addEventListener('DOMContentLoaded',()=>{
  enhanceStageFirstChapterList();
  enhanceStageFirstStageList();
},{once:true});
