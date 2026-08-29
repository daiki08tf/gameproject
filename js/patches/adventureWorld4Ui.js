/* Adventure / World 4.0 — W4 Adventure UI Foundation
   Mobile-first World -> Region -> Route flow using W1-W3 foundations.
   Existing Story/Battle systems remain authoritative. */
import { CHAPTERS,isChapterUnlocked } from '../data/stages.js';
import { buildWorld4RegionCatalog,world4RegionPresentation,world4RegionState,world4RegionById } from '../data/adventureWorld4Regions.js';
import { buildAdventure4PilotRoute,adventure4PilotPreview } from '../data/adventureWorld4Pilot.js';
import { adventure4NodeById } from '../data/adventureWorld4Routes.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { renderHome } from '../screens/home.js';
import { renderResult } from '../screens/result.js';
import './adventureWorld4Session.js';
import './adventureWorld4RouteEngine.js';

const battle=new TextBattleScreen();
let activeRoute=null;
let adventureBattleActive=false;

function showScreen(id){
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}
function ensureStyles(){
  if(document.querySelector('link[data-adventure-world4]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='css/adventureWorld4.css';link.dataset.adventureWorld4='true';document.head.appendChild(link);
}
function makeScreen(id,title){
  let screen=document.getElementById(id);if(screen)return screen;
  screen=document.createElement('section');screen.id=id;screen.className='screen adventure4-screen';
  screen.innerHTML=`<div class="adventure4-shell"><header class="adventure4-header"><button class="btn-sub adventure4-back" type="button">← 戻る</button><div><div class="adventure4-kicker">WORLD 4.0</div><h2>${title}</h2></div></header><div class="adventure4-body"></div></div>`;
  document.body.appendChild(screen);return screen;
}
function regionCatalog(){return buildWorld4RegionCatalog(CHAPTERS);}
function regionState(region){return world4RegionState(region,CHAPTERS,{isStageCleared:id=>state.isStageCleared(id),isChapterUnlocked:index=>isChapterUnlocked(index,id=>state.isStageCleared(id))});}
function goHome(){renderHome();showScreen('homeScreen');}

function restoreResultActions(snapshot){
  for(const [id,hidden] of Object.entries(snapshot||{})){const el=document.getElementById(id);if(el)el.classList.toggle('hidden',hidden);}
}
function configureAdventureResultActions(onContinue){
  const ids=['resultHomeBtn','resultEquipBtn','resultRetryBtn','resultNextBtn'];
  const snapshot={};for(const id of ids){const el=document.getElementById(id);if(el){snapshot[id]=el.classList.contains('hidden');el.classList.add('hidden');}}
  let btn=document.getElementById('adventure4ResultContinue');
  if(!btn){btn=document.createElement('button');btn.id='adventure4ResultContinue';btn.className='btn-main';btn.textContent='冒険へ戻る';document.querySelector('#resultScreen .confirm-actions')?.appendChild(btn);}
  btn.classList.remove('hidden');btn.onclick=()=>{Audio_.tap();btn.classList.add('hidden');restoreResultActions(snapshot);onContinue();};
}

function currentRegionAndRoute(){
  const session=state.adventure4Session();
  const region=world4RegionById(regionCatalog(),session.regionId);if(!region)return{session,region:null,route:null};
  const route=activeRoute&&activeRoute.regionId===region.id?activeRoute:buildAdventure4PilotRoute(region,regionState(region));
  activeRoute=route;return{session,region,route};
}

function returnAdventure(){
  state.returnFromAdventure4();activeRoute=null;goHome();
}
function suspendAdventure(){state.suspendAdventure4();goHome();}

function launchAdventureBattle(node){
  if(!node?.stageId)return;
  adventureBattleActive=true;
  state.checkpointAdventure4({pendingEncounter:{nodeId:node.id,stageId:node.stageId}});
  showScreen('textBattleScreen');
  battle.start(node.stageId,result=>{
    if(result?.cleared&&state.rollRune2DropForStage)result.rune2Drops=state.rollRune2DropForStage(node.stageId);
    state.checkpointAdventure4({pendingEncounter:null});
    renderResult(result);
    configureAdventureResultActions(()=>{adventureBattleActive=false;renderAdventureRoute();});
    showScreen('resultScreen');
  });
}

function nodeButton(node,route){
  const button=document.createElement('button');button.type='button';button.className=`adventure4-choice adventure4-${node.type}`;
  const typeLabel={battle:'戦闘',boss:'強敵',elite:'強敵',event:'分岐',camp:'帰還',scene:'移動'}[node.type]||'探索';
  button.innerHTML=`<span><strong>${node.name}</strong><small>${typeLabel}</small></span><span>›</span>`;
  button.addEventListener('click',()=>{
    Audio_.tap();const moved=state.moveAdventure4ToNode(route,node.id);if(!moved.ok)return;
    if(['battle','elite','boss'].includes(node.type)){launchAdventureBattle(node);return;}
    if(node.type==='camp'&&node.tags?.includes('return')){returnAdventure();return;}
    renderAdventureRoute();
  });return button;
}

export function renderAdventureRoute(){
  ensureStyles();const screen=makeScreen('adventureRoute4Screen','冒険');const body=screen.querySelector('.adventure4-body');
  const {session,region,route}=currentRegionAndRoute();
  if(!session.active||!region||!route){renderAdventureWorld();return;}
  if(!session.routeId){const entered=state.enterAdventure4Route(route);if(!entered.ok){returnAdventure();return;}}
  const view=state.adventure4RouteState(route);if(!view.ok){returnAdventure();return;}
  const current=view.current;const preview=adventure4PilotPreview(route,current.id);
  body.innerHTML='';
  const summary=document.createElement('section');summary.className='adventure4-card adventure4-current';
  summary.innerHTML=`<div class="adventure4-meta">${region.name}</div><h3>${current.name}</h3><p>${current.type==='battle'?'既存Storyの戦闘へ接続します。結果は通常の進行・報酬処理へそのまま反映されます。':'次に進む道を選びます。見えているのは直近の行き先だけです。'}</p>`;
  body.appendChild(summary);
  const trail=document.createElement('div');trail.className='adventure4-trail';
  for(const item of preview){const chip=document.createElement('span');chip.className=`adventure4-trail-${item.state}`;chip.textContent=item.name;trail.appendChild(chip);}body.appendChild(trail);
  const pending=session.pendingEncounter;
  if(pending?.stageId&&pending.nodeId===current.id){const retry=document.createElement('button');retry.className='adventure4-choice adventure4-battle';retry.innerHTML='<span><strong>中断した戦闘へ戻る</strong><small>戦闘</small></span><span>›</span>';retry.addEventListener('click',()=>launchAdventureBattle({...current,stageId:pending.stageId}));body.appendChild(retry);}
  const choices=document.createElement('section');choices.className='adventure4-choices';
  view.next.forEach(node=>choices.appendChild(nodeButton(node,route)));body.appendChild(choices);
  const suspend=document.createElement('button');suspend.type='button';suspend.className='btn-sub adventure4-suspend';suspend.textContent='中断して拠点へ戻る';suspend.addEventListener('click',()=>{Audio_.tap();suspendAdventure();});body.appendChild(suspend);
  screen.querySelector('.adventure4-back').onclick=()=>{Audio_.tap();suspendAdventure();};showScreen(screen.id);
}

function startRegion(region){
  const started=state.startAdventure4({regionId:region.id,returnTarget:'home'});if(!started.ok)return;
  activeRoute=buildAdventure4PilotRoute(region,regionState(region));renderAdventureRoute();
}

export function renderAdventureWorld(){
  ensureStyles();const screen=makeScreen('adventureWorld4Screen','世界を選ぶ');const body=screen.querySelector('.adventure4-body');body.innerHTML='';
  const catalog=regionCatalog();const existing=state.adventure4Session();
  if(existing.active){
    const region=world4RegionById(catalog,existing.regionId);const resume=document.createElement('section');resume.className='adventure4-card adventure4-resume';
    resume.innerHTML=`<div class="adventure4-meta">中断中の冒険</div><h3>${region?.name||'未詳の地域'}</h3><p>前回の地点から再開できます。</p>`;
    const button=document.createElement('button');button.className='btn-main';button.textContent='冒険を再開';button.addEventListener('click',()=>{Audio_.tap();state.resumeAdventure4();activeRoute=null;renderAdventureRoute();});resume.appendChild(button);body.appendChild(resume);
  }
  for(const region of catalog){
    const progress=regionState(region);if(progress.status==='locked')continue;
    const view=world4RegionPresentation(region,progress);const card=document.createElement('button');card.type='button';card.className='adventure4-region-card';
    card.innerHTML=`<span class="adventure4-region-main"><strong>${view.name}</strong><small>${view.subtitle}</small><small>${view.theme}</small></span><span class="adventure4-region-side"><b>${view.stateLabel}</b><small>${view.recommendedLabel}</small><small>${view.routeLabel||'主要路を踏破済み'}</small></span>`;
    card.disabled=existing.active;card.addEventListener('click',()=>{Audio_.tap();startRegion(region);});body.appendChild(card);
  }
  screen.querySelector('.adventure4-back').onclick=()=>{Audio_.tap();goHome();};showScreen(screen.id);
}

function installEntry(){
  const button=document.getElementById('goStageBtn');if(!button||button.dataset.adventure4Entry==='true')return;
  button.dataset.adventure4Entry='true';
  button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();Audio_.tap();renderAdventureWorld();},true);
}

ensureStyles();installEntry();
window.addEventListener('DOMContentLoaded',installEntry,{once:true});
export { installEntry as installAdventure4Entry };
