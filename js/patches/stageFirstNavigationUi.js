/* CLR-13/14 — Stage-first browser + Stage detail presentation bridge.
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

let selectedStageId=null;
let stageBattleArmed=false;

function restoreCanonicalAdventureEntry(){
  const button=document.getElementById('goStageBtn');
  if(!button||button.dataset.stageFirstEntry==='true')return button;
  // adventureWorld4Ui installs a capture listener before main.js attaches the
  // canonical Chapter handler. Replacing this not-yet-wired button removes only
  // that early interception while keeping the same DOM id/content for main.js.
  const replacement=button.cloneNode(true);
  replacement.dataset.stageFirstEntry='true';
  replacement.removeAttribute('data-adventure4-entry');
  button.replaceWith(replacement);
  return replacement;
}

restoreCanonicalAdventureEntry();

function canonicalStageById(id){
  if(!id)return null;
  for(const chapter of CHAPTERS){
    const stage=chapter.stages.find(item=>item.id===id);
    if(stage)return{chapter,stage};
  }
  return null;
}

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

function nextCanonicalMainStage(stageId){
  const found=canonicalStageById(stageId);if(!found)return null;
  const main=found.chapter.stages.filter(stage=>!stage.branch&&!stage.bounty);
  const index=main.findIndex(stage=>stage.id===stageId);
  return index>=0?main[index+1]||null:null;
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

export function enhanceStageFirstDetail(stageId=selectedStageId){
  const found=canonicalStageById(stageId);if(!found)return false;
  const {stage}=found;
  const name=document.getElementById('confirmStageName');
  const start=document.getElementById('confirmStartBtn');
  if(name){name.textContent=`${stage.id} ${stage.name}`;name.dataset.stageId=stage.id;}
  if(start){
    const cleared=state.isStageCleared(stage.id);
    start.textContent=stage.branch||stage.bounty?(cleared?'もう一度挑む':'挑戦する'):(cleared?'再戦する':'物語を進める');
    start.dataset.stageId=stage.id;
  }
  return true;
}

function showExistingStageList(){
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
  document.getElementById('stageSelectScreen')?.classList.add('active');
  enhanceStageFirstStageList();
}

function ensureStageResultContext(){
  const result=document.getElementById('resultScreen');
  if(!result?.classList.contains('active')||!stageBattleArmed||!selectedStageId)return false;
  const found=canonicalStageById(selectedStageId);if(!found)return false;
  const actions=result.querySelector('.confirm-actions');if(!actions)return false;
  let back=document.getElementById('stageFirstResultStagesBtn');
  if(!back){
    back=document.createElement('button');
    back.id='stageFirstResultStagesBtn';
    back.className='btn-sub';
    back.textContent='ステージ一覧へ';
    back.addEventListener('click',()=>{stageBattleArmed=false;showExistingStageList();});
    actions.appendChild(back);
  }
  back.classList.remove('hidden');
  const next=nextCanonicalMainStage(selectedStageId);
  const nextButton=document.getElementById('resultNextBtn');
  if(next&&nextButton&&!nextButton.classList.contains('hidden'))nextButton.textContent=`次へ：${next.id} ${next.name}`;
  stageBattleArmed=false;
  return true;
}

function queueEnhance(target){
  queueMicrotask(()=>{
    if(target==='chapter')enhanceStageFirstChapterList();
    if(target==='stage')enhanceStageFirstStageList();
    if(target==='detail')enhanceStageFirstDetail();
  });
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('#goStageBtn')){selectedStageId=null;stageBattleArmed=false;queueEnhance('chapter');return;}
  if(target.closest('#stageBackBtn')){queueEnhance('chapter');return;}

  const stageCard=target.closest('#stageList .stage-card[data-stage-id]');
  if(stageCard&&stageCard.dataset.stageState!=='locked'){
    selectedStageId=stageCard.dataset.stageId||null;
    queueEnhance('detail');
    return;
  }
  if(target.closest('#confirmBackBtn')){stageBattleArmed=false;queueEnhance('stage');return;}
  if(target.closest('#confirmStartBtn')){stageBattleArmed=!!selectedStageId;return;}
  if(target.closest('#resultRetryBtn')){stageBattleArmed=!!selectedStageId;return;}
  if(target.closest('#resultNextBtn')){
    const next=nextCanonicalMainStage(selectedStageId);
    if(next){selectedStageId=next.id;stageBattleArmed=true;}
    return;
  }
  if(target.closest('#goAbyssBtn')||target.closest('#resultHomeBtn')){selectedStageId=null;stageBattleArmed=false;}
});

const resultScreen=document.getElementById('resultScreen');
if(resultScreen){
  const observer=new MutationObserver(()=>queueMicrotask(ensureStageResultContext));
  observer.observe(resultScreen,{attributes:true,attributeFilter:['class']});
}

window.addEventListener('DOMContentLoaded',()=>{
  enhanceStageFirstChapterList();
  enhanceStageFirstStageList();
},{once:true});
