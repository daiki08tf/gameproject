/* CLR-16 — behavior-oriented mobile navigation semantics.
   Clarifies suspend/return meaning without changing Adventure/session authority. */

function ensureStyles(){
  if(document.querySelector('link[data-clr16-mobile]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='css/coreLoopClr16Mobile.css';
  link.dataset.clr16Mobile='true';
  document.head.appendChild(link);
}

function clarifyAdventureControls(){
  const screen=document.getElementById('adventureRoute4Screen');
  if(!screen?.classList.contains('active'))return false;
  const back=screen.querySelector('.adventure4-back');
  if(back){
    back.textContent='← 中断';
    back.title='冒険を中断して拠点へ戻る';
    back.setAttribute('aria-label','冒険を中断して拠点へ戻る');
  }
  const suspend=screen.querySelector('.adventure4-suspend');
  if(suspend){
    suspend.textContent='冒険を中断して拠点へ戻る';
    suspend.dataset.clr16Action='suspend';
  }
  for(const button of screen.querySelectorAll('.adventure4-choice')){
    const strong=button.querySelector('strong');
    if(strong?.textContent?.trim()==='帰還路'){
      strong.textContent='安全に帰還する';
      button.dataset.clr16Action='return';
    }
  }
  return true;
}

function clarifyStageActions(){
  const screen=document.getElementById('stageConfirmScreen');
  if(!screen?.classList.contains('active'))return false;
  const story=document.getElementById('confirmStartBtn');
  if(story){
    story.dataset.clr16Primary='story';
    story.setAttribute('aria-label',story.textContent||'ステージへ出撃');
  }
  const hunt=document.getElementById('stageFirstHuntBtn');
  if(hunt){
    hunt.dataset.clr16Primary='hunt';
    hunt.setAttribute('aria-label',hunt.textContent||'Huntを開始');
  }
  return true;
}

function applyActiveScreenSemantics(){
  clarifyAdventureControls();
  clarifyStageActions();
}

ensureStyles();
applyActiveScreenSemantics();

for(const id of ['stageConfirmScreen','adventureRoute4Screen']){
  const screen=document.getElementById(id);
  if(!screen)continue;
  const observer=new MutationObserver(()=>queueMicrotask(applyActiveScreenSemantics));
  observer.observe(screen,{attributes:true,attributeFilter:['class']});
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('#stageList .stage-card[data-stage-id]')||target.closest('#stageFirstHuntBtn')||target.closest('#adventure4ResultContinue')){
    queueMicrotask(applyActiveScreenSemantics);
  }
});

export { ensureStyles as ensureClr16MobileStyles, clarifyAdventureControls, clarifyStageActions };
