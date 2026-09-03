/* CLR-13/15 — Stage-first browser, Stage detail and Hunt presentation bridge.
   Canonical Chapter/Stage navigation stays the visible Story spine while
   World 4.0 remains the Region-owned runtime underneath repeatable Hunt. */
import { CHAPTERS,isChapterUnlocked } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { buildWorld4RegionCatalog,world4RegionState } from '../data/adventureWorld4Regions.js';
import { isStageDiscovered } from '../screens/stageSelect.js';
import { observedBranchById } from '../data/observedBranches.js';
import { buildObservedBranchStage } from '../data/observedBranchStages.js';
import { state } from '../state.js';
import { renderAdventureRoute } from './adventureWorld4Ui.js';
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
  // CLR-21: Observed Branch Stages are findStage()-resolvable but not part
  // of CHAPTERS (same shape as Abyss/Secret Realm/Raid stages) — resolve
  // them here too so Stage detail decoration covers them, with chapter:null
  // signalling "no Region/Chapter Hunt context" to callers below.
  const branchStage=buildObservedBranchStage(id);
  return branchStage?{chapter:null,stage:branchStage}:null;
}

function regionCatalog(){return buildWorld4RegionCatalog(CHAPTERS);}
function regionState(region){return world4RegionState(region,CHAPTERS,{isStageCleared:id=>state.isStageCleared(id),isChapterUnlocked:index=>isChapterUnlocked(index,id=>state.isStageCleared(id))});}
function regionForChapter(chapter){return regionCatalog().find(region=>region.chapterNumbers.includes(Number(chapter?.num)))||null;}

export function stageFirstHuntContext(stageId=selectedStageId){
  const found=canonicalStageById(stageId);if(!found)return null;
  const {chapter,stage}=found;
  if(stage.branch||stage.bounty||!state.isStageCleared(stage.id))return null;
  const region=regionForChapter(chapter);if(!region)return null;
  const progress=regionState(region);
  if(progress.status!=='completed')return null;
  return{chapter,stage,region,progress};
}

export function launchStageFirstHunt(stageId=selectedStageId){
  const context=stageFirstHuntContext(stageId);if(!context)return{ok:false,reason:'hunt_locked'};
  const existing=state.adventure4Session?.();
  if(existing?.active){
    if(existing.regionId!==context.region.id)return{ok:false,reason:'other_active_session'};
    state.resumeAdventure4?.();
    renderAdventureRoute();
    return{ok:true,resumed:true,regionId:context.region.id};
  }
  const started=state.startAdventure4?.({regionId:context.region.id,returnTarget:'home'});
  if(!started?.ok)return started||{ok:false,reason:'start_failed'};
  renderAdventureRoute();
  return{ok:true,resumed:false,regionId:context.region.id};
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
  if(!found.chapter){
    // Observed Branch Stage: advance through the Branch's own authored
    // stageIds order instead of a CHAPTERS chapter.
    const stageIds=observedBranchById(found.stage.observedBranchId)?.stageIds||[];
    const index=stageIds.indexOf(stageId);
    return index>=0&&index+1<stageIds.length?buildObservedBranchStage(stageIds[index+1]):null;
  }
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
    card.innerHTML=`<div><div class="name">${stage.id} ???</div><div class="rec">直前のステージをクリアすると開放</div></div><div class="cleared">LOCKED</div>`;
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

function ensureHuntAction(stageId){
  const screen=document.getElementById('stageConfirmScreen');
  const actions=screen?.querySelector('.confirm-actions');
  if(!screen||!actions)return false;
  let hunt=document.getElementById('stageFirstHuntBtn');
  let context=document.getElementById('stageFirstHuntContext');
  const available=stageFirstHuntContext(stageId);
  if(!available){hunt?.remove();context?.remove();return false;}
  if(!context){context=document.createElement('div');context.id='stageFirstHuntContext';context.style.cssText='margin:8px 0;font-size:.88rem;opacity:.82;';actions.before(context);}
  const nextText=`Story踏破済みの「${available.region.name}」を連戦周回。EXP・Loot・Elite/Bossは既存Adventure権威を使用。`;
  if(context.textContent!==nextText)context.textContent=nextText;
  if(!hunt){hunt=document.createElement('button');hunt.id='stageFirstHuntBtn';hunt.type='button';hunt.className='btn-sub';actions.appendChild(hunt);}
  const existing=state.adventure4Session?.();
  const sameActive=!!(existing?.active&&existing.regionId===available.region.id);
  const blocked=!!(existing?.active&&existing.regionId!==available.region.id);
  const label=sameActive?`Huntを再開：${available.region.name}`:`Hunt / ${available.region.name}を周回`;
  if(hunt.textContent!==label)hunt.textContent=label;
  hunt.disabled=blocked;
  hunt.title=blocked?'別地域で中断中のHuntがあります。先にそちらを再開または帰還してください。':'';
  hunt.onclick=()=>{const result=launchStageFirstHunt(stageId);if(!result?.ok&&result?.reason==='other_active_session')hunt.disabled=true;};
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
  ensureHuntAction(stage.id);
  return true;
}

function showExistingStageList(){
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
  document.getElementById('stageSelectScreen')?.classList.add('active');
  enhanceStageFirstStageList();
}

function ensureStageResultContext(){
  const result=document.getElementById('resultScreen');
  if(!result?.classList.contains('active'))return false;
  const existing=document.getElementById('stageFirstResultStagesBtn');
  if(!stageBattleArmed||!selectedStageId){existing?.classList.add('hidden');return false;}
  const found=canonicalStageById(selectedStageId);if(!found){existing?.classList.add('hidden');return false;}
  const actions=result.querySelector('.confirm-actions');if(!actions)return false;
  let back=existing;
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
  if(target.closest('#stageFirstHuntBtn')){stageBattleArmed=false;return;}
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
