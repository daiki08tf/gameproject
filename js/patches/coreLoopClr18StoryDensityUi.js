/* CLR-18 — Stage-first Story density bridge.
   Shows concise representative-Chapter aftermath only after the first canonical clear.
   No Story/save/progression authority is added. */
import { state } from '../state.js';
import { clr18StoryAftermath,clr18ShouldShowAftermath } from '../data/coreLoopClr18.js';

let armedStageId=null;
let armedWasCleared=false;

function stageIdFromConfirm(){return document.getElementById('confirmStageName')?.dataset.stageId||null;}
function stageIdFromNextButton(){
  const text=document.getElementById('resultNextBtn')?.textContent||'';
  return text.match(/次へ：([^\s]+)/)?.[1]||null;
}
function arm(stageId){
  armedStageId=stageId||null;
  armedWasCleared=armedStageId?!!state.isStageCleared?.(armedStageId):false;
}
function clearArm(){armedStageId=null;armedWasCleared=false;}

function renderAftermath(){
  const result=document.getElementById('resultScreen');
  if(!result?.classList.contains('active'))return false;
  document.getElementById('clr18StoryAftermath')?.remove();
  const cleared=document.getElementById('resultTitle')?.textContent?.includes('STAGE CLEAR');
  if(!clr18ShouldShowAftermath({stageId:armedStageId,cleared,wasCleared:armedWasCleared,retreated:false})){clearArm();return false;}
  const beat=clr18StoryAftermath(armedStageId);if(!beat){clearArm();return false;}
  const items=document.getElementById('resultItems');if(!items){clearArm();return false;}
  const card=document.createElement('section');card.id='clr18StoryAftermath';card.className='stage-card branch';card.style.cssText='margin:10px 0;display:block;text-align:left';
  card.innerHTML=`<div class="rec" style="margin-bottom:4px">戦いの跡</div><div class="name">${beat.title}</div><div class="rec" style="margin-top:6px;line-height:1.6">${beat.text}</div>`;
  items.prepend(card);clearArm();return true;
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('#confirmStartBtn')){arm(stageIdFromConfirm());return;}
  if(target.closest('#resultRetryBtn')){arm(stageIdFromConfirm());return;}
  if(target.closest('#resultNextBtn')){arm(stageIdFromNextButton());return;}
  if(target.closest('#resultHomeBtn')||target.closest('#stageFirstResultStagesBtn'))clearArm();
},true);

const result=document.getElementById('resultScreen');
if(result)new MutationObserver(()=>queueMicrotask(renderAftermath)).observe(result,{attributes:true,attributeFilter:['class']});

export { arm as armClr18StoryAftermath,renderAftermath as renderClr18StoryAftermath };
