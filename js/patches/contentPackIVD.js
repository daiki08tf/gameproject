/* Content Pack IV D — visible Branch anchor handoff runtime. */
import './contentPackIVE.js';
import { syncCP4IdentityReward } from './contentPackIVF.js';
import { state } from '../state.js';
import {
  CP4_FIRST_BRANCH_ANCHOR,
  CP4_SECOND_BRANCH_ANCHOR,
  CP4_THIRD_BRANCH_ANCHOR,
  cp4FirstBranchAnchorProgress,
  cp4SecondBranchAnchorProgress,
  cp4ThirdBranchAnchorProgress,
} from '../data/contentPackIVD.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}

export function cp4FirstBranchAnchor(){const discoveries=world().discoveries;const progress=cp4FirstBranchAnchorProgress({discoveries});return{anchor:CP4_FIRST_BRANCH_ANCHOR,progress};}
export function cp4SecondBranchAnchor(){const discoveries=world().discoveries;const progress=cp4SecondBranchAnchorProgress({discoveries});return{anchor:CP4_SECOND_BRANCH_ANCHOR,progress};}
export function cp4ThirdBranchAnchor(){const discoveries=world().discoveries;const progress=cp4ThirdBranchAnchorProgress({discoveries});return{anchor:CP4_THIRD_BRANCH_ANCHOR,progress};}

function observeAnchor(anchor,progress,extra={}){
  if(!progress.visible)return null;
  if(!progress.observed){
    put(anchor.discoveryId,{name:anchor.name,hint:anchor.observed,nextAction:anchor.next,contentPackIV:true,branchAnchor:true,observedBranchAnchor:true,sourceDiscoveryId:anchor.sourceEvidenceDiscoveryId,targetChapter:anchor.chapterNum,traversable:false,totalBranchCountHidden:true,...extra});
    state.save();
  }
  syncCP4IdentityReward();
  return world().discoveries[anchor.discoveryId];
}

export function observeCP4FirstBranchAnchor(){const{anchor,progress}=cp4FirstBranchAnchor();return observeAnchor(anchor,progress,{deepGreenAbsentHidden:true});}
export function observeCP4SecondBranchAnchor(){const{anchor,progress}=cp4SecondBranchAnchor();return observeAnchor(anchor,progress,{deepGreenAbsentObserved:true});}
export function observeCP4ThirdBranchAnchor(){const{anchor,progress}=cp4ThirdBranchAnchor();return observeAnchor(anchor,progress,{flameKingObserved:true});}

state.cp4FirstBranchAnchor=()=>cp4FirstBranchAnchor();
state.observeCP4FirstBranchAnchor=()=>observeCP4FirstBranchAnchor();
state.cp4SecondBranchAnchor=()=>cp4SecondBranchAnchor();
state.observeCP4SecondBranchAnchor=()=>observeCP4SecondBranchAnchor();
state.cp4ThirdBranchAnchor=()=>cp4ThirdBranchAnchor();
state.observeCP4ThirdBranchAnchor=()=>observeCP4ThirdBranchAnchor();

function renderOneAnchor(list,matchesChapter,key,anchor,progress,observe){
  const existing=list.querySelector(`[data-cp4-branch-anchor="${key}"]`);
  if(!matchesChapter||!progress.visible){existing?.remove();return;}
  if(existing)return;
  const card=document.createElement('div');
  card.className='stage-card branch';
  card.dataset.cp4BranchAnchor=key;
  const body=document.createElement('div');
  const name=document.createElement('div');
  name.className='name';
  name.textContent=progress.observed?anchor.name:anchor.hiddenLabel;
  const detail=document.createElement('div');
  detail.className='rec';
  detail.textContent=progress.observed?`${anchor.observed} ${anchor.next}`:anchor.preview;
  body.append(name,detail);
  if(!progress.observed){
    const action=document.createElement('button');
    action.className='btn-sub';
    action.textContent='重なりを観測';
    action.addEventListener('click',ev=>{ev.stopPropagation();observe();card.remove();renderAnchorCards();});
    body.appendChild(action);
  }
  const status=document.createElement('div');
  status.className='cleared';
  status.textContent=progress.observed?'OBSERVED':'?';
  card.append(body,status);
  list.appendChild(card);
}

function renderAnchorCards(){
  if(typeof document==='undefined')return;
  const list=document.getElementById('stageList'),screenEl=document.getElementById('stageSelectScreen');
  if(!list||!screenEl)return;
  // Read the Chapter number stageSelect.js stamps on #stageSelectScreen
  // (js/screens/stageSelect.js) instead of matching the displayed Chapter
  // name text — journeyName() strips any "第N章" prefix before display, so
  // matching against title text can never actually identify the Chapter.
  const currentChapterNum=Number(screenEl.dataset.chapterNum);
  const first=cp4FirstBranchAnchor();
  const second=cp4SecondBranchAnchor();
  const third=cp4ThirdBranchAnchor();
  renderOneAnchor(list,first.anchor.chapterNum===currentChapterNum,'tree-sovereign',first.anchor,first.progress,observeCP4FirstBranchAnchor);
  renderOneAnchor(list,second.anchor.chapterNum===currentChapterNum,'deep-green-absence',second.anchor,second.progress,observeCP4SecondBranchAnchor);
  renderOneAnchor(list,third.anchor.chapterNum===currentChapterNum,'flame-king',third.anchor,third.progress,observeCP4ThirdBranchAnchor);
}

if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){
  const start=()=>{const root=document.getElementById('stageList');if(!root)return;new MutationObserver(()=>renderAnchorCards()).observe(root,{childList:true});renderAnchorCards();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
