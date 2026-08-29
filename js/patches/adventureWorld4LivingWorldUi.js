/* Adventure / World 4.0 — W18-W22 Living World UI surface.
   Adds only contextual optional actions to the existing Adventure screen. */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { renderResult } from '../screens/result.js';
import { renderAdventureRoute } from './adventureWorld4Ui.js';
import './adventureWorld4LivingWorldRuntime.js';

const battle=new TextBattleScreen();
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id)?.classList.add('active');}
function resultReturn(){
  let btn=document.getElementById('adventure4LivingResultContinue');
  if(!btn){btn=document.createElement('button');btn.id='adventure4LivingResultContinue';btn.className='btn-main';btn.textContent='追跡へ戻る';document.querySelector('#resultScreen .confirm-actions')?.appendChild(btn);}
  btn.classList.remove('hidden');btn.onclick=()=>{btn.classList.add('hidden');renderAdventureRoute();};
}
function launchNemesis(stageId){
  if(!stageId)return;
  state.checkpointAdventure4({pendingEncounter:{nodeId:`nemesis:${stageId}`,stageId}});
  showScreen('textBattleScreen');
  battle.start(stageId,result=>{
    if(result?.cleared&&state.rollRune2DropForStage)result.rune2Drops=state.rollRune2DropForStage(stageId);
    state.checkpointAdventure4({pendingEncounter:null});
    renderResult(result);resultReturn();showScreen('resultScreen');
  });
}

function render(){
  const screen=document.getElementById('adventureRoute4Screen'),body=screen?.querySelector('.adventure4-body');
  if(!screen||!body||!screen.classList.contains('active'))return;
  body.querySelector('[data-adventure4-living-world]')?.remove();
  const session=state.adventure4Session?.();if(!session?.active)return;
  state.adventure4RefreshLivingWorldFlags?.();
  const ctx=state.adventure4LivingWorldContext?.();if(!ctx)return;
  const box=document.createElement('section');box.dataset.adventure4LivingWorld='true';box.className='adventure4-card';
  const bits=[ctx.seasonName,ctx.weatherName,ctx.daypartName].filter(Boolean).join(' / ');
  box.innerHTML=`<div class="adventure4-meta">Living World</div><h3>${bits||'地域状況'}</h3><p>World Event・環境・World Tierは探索の見え方や任意コンテンツを変える。既存の戦闘/報酬倍率はここでは変更しない。</p>`;
  if(ctx.worldEvent){const p=document.createElement('p');p.className='hint';p.textContent=`World Event: ${ctx.worldEvent.name||ctx.worldEvent.id}`;box.appendChild(p);}
  if(ctx.utility?.count>=2){const p=document.createElement('p');p.className='hint';p.textContent=`探索Utility Set ${ctx.utility.count}部位: ${ctx.utility.effects.join(' / ')}`;box.appendChild(p);}
  const hunt=ctx.hunt;
  if(hunt?.active&&hunt.regionId===session.regionId){
    const btn=document.createElement('button');btn.type='button';btn.className='adventure4-choice adventure4-nemesis';
    if(hunt.stage==='located'){
      btn.innerHTML=`<span><strong>Nemesisを捕捉</strong><small>既存Bounty/Nemesis戦へ接続</small></span><span>›</span>`;
      btn.addEventListener('click',()=>launchNemesis(hunt.targetStageId));
    }else{
      btn.innerHTML=`<span><strong>Nemesisを追跡</strong><small>${hunt.stage} → 次の手掛かり</small></span><span>›</span>`;
      btn.addEventListener('click',()=>{state.advanceAdventure4NemesisHunt?.();renderAdventureRoute();});
    }
    box.appendChild(btn);
    const escape=document.createElement('button');escape.type='button';escape.className='btn-sub';escape.textContent='追跡を切って移動する';escape.addEventListener('click',()=>{state.escapeAdventure4NemesisHunt?.();renderAdventureRoute();});box.appendChild(escape);
  }
  if(ctx.worldTierAvailability?.anomaly){const p=document.createElement('p');p.className='hint';p.textContent='World Tierにより異常地点が探索候補へ出現中。';box.appendChild(p);}
  body.appendChild(box);
}

const observer=new MutationObserver(()=>queueMicrotask(render));observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});queueMicrotask(render);
export { render as renderAdventure4LivingWorld, launchNemesis as launchAdventure4NemesisBattle };
