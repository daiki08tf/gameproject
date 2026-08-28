/* Phase 10.4 — compact "what should I do now?" home guidance. */
import { state } from '../state.js';
import { buildEndgameGuidance } from '../data/endgameGuidance.js';

function ensureStyles(){
  if(document.querySelector('link[data-endgame-guidance]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='css/endgameGuidance.css';link.dataset.endgameGuidance='true';document.head.appendChild(link);
}
function activeNemesisLevel(){return Number(state.activeBountyNemesis?.()?.level)||0;}
export function currentEndgameGuidance(){return buildEndgameGuidance({level:state.characterLevel,abyssBestDepth:state.data.abyssBestDepth||0,worldTierId:state.data.worldTierId||'normal',nemesisLevel:activeNemesisLevel(),abyssUnlocked:state.isAbyssUnlocked()});}
export function renderEndgameGuidance(){
  const menu=document.querySelector('#homeScreen .home-menu');if(!menu)return;
  ensureStyles();
  const g=currentEndgameGuidance();
  let card=menu.querySelector('[data-endgame-guide]');
  if(!card){card=document.createElement('button');card.type='button';card.className='endgame-guide-card';card.dataset.endgameGuide='true';const primary=menu.querySelector('.home-primary-action');if(primary)primary.after(card);else menu.prepend(card);card.addEventListener('click',()=>{const id=card.dataset.targetButton;document.getElementById(id)?.click();});}
  card.dataset.targetButton=g.targetButtonId;
  const storyLike=g.laneId==='story'||g.laneId==='story_gate';
  const meta=storyLike
    ?`${g.recommendedWorldTierName} ・ ${g.laneId==='story_gate'?'全章ボス撃破で深淵解禁':'Lv 3,000からWorld Tier / 深淵導線へ'}`
    :`${g.recommendedWorldTierName} ・ 深淵 ${g.nextAbyssDepth}F / 推奨Lv ${g.nextAbyssLevel.toLocaleString()} / IP ${g.nextAbyssItemPower}`;
  const farm=g.lootRoleSummary?`<span class="endgame-guide-farm">目的別ファーム：${g.lootRoleSummary}</span>`:'';
  card.innerHTML=`<span class="endgame-guide-kicker">NEXT / Lv ${g.level.toLocaleString()}</span><strong>${g.title}</strong><span class="endgame-guide-reason">${g.reason}</span><span class="endgame-guide-meta">${meta}</span>${farm}<span class="endgame-guide-reward">報酬基準 Drop ×${g.reward.drop} / Gold ×${g.reward.gold} / IP +${g.reward.itemPowerBonus}</span>`;
}

queueMicrotask(renderEndgameGuidance);
const home=document.getElementById('homeScreen');
if(home)new MutationObserver(()=>{if(home.classList.contains('active'))renderEndgameGuidance();}).observe(home,{attributes:true,attributeFilter:['class']});
