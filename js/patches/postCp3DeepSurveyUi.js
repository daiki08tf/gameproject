/* Post-Gear Deep Survey — compact annotations on existing Adventure/Secret Realm UI only. */
import './postCp3SurveyConditionCombat.js';
import { CP3_DEEP_SURVEYS } from '../data/postCp3DeepSurvey.js';
import {
  activeDeepSurveyCondition,
  clearActiveDeepSurveyCondition,
  setActiveDeepSurveyCondition,
  surveyConditionsForRegion,
} from '../data/postCp3SurveyConditions.js';

function matchDef(text=''){
  return CP3_DEEP_SURVEYS.find(def=>String(text).includes(def.realmName)||String(text).includes(`深層観測・${def.realmName.replace('・深層観測','')}`))||null;
}

function annotateStageList(){
  const list=document.getElementById('stageList');if(!list)return;
  let found=false;
  for(const card of list.querySelectorAll('.stage-card')){
    const def=matchDef(card.querySelector('.name')?.textContent||'');if(!def)continue;found=true;
    if(card.dataset.deepSurveyAnnotated)return;card.dataset.deepSurveyAnnotated='true';
    const rec=card.querySelector('.rec');
    if(rec)rec.innerHTML=`<strong>深層観測 / MIXED CHASE</strong> ・ 推奨Lv 99,999 ・ 目標IP 10,000<br>${def.role}<br><span style="opacity:.76">${def.rewardHint}</span>`;
  }
  if(found){
    const heading=[...list.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('深淵で発見した異界'));
    if(heading)heading.textContent='異界・深層観測';
  }
}

function conditionPicker(){
  let el=document.getElementById('deepSurveyConditionPicker');
  if(el)return el;
  const mods=document.getElementById('confirmModifiers');if(!mods?.parentElement)return null;
  el=document.createElement('div');el.id='deepSurveyConditionPicker';el.className='hidden';
  el.style.cssText='margin-top:8px;padding:8px;border:1px solid var(--border,#444);border-radius:8px';
  mods.insertAdjacentElement('afterend',el);return el;
}

function renderConditionPicker(def){
  const picker=conditionPicker();if(!picker)return;
  if(!def){picker.innerHTML='';picker.classList.add('hidden');return;}
  picker.classList.remove('hidden');picker.innerHTML='';
  const active=activeDeepSurveyCondition(def.realmId);
  const heading=document.createElement('div');heading.className='section-heading';
  heading.textContent='Survey Condition（任意・1つまで）';picker.appendChild(heading);
  const hint=document.createElement('div');hint.style.cssText='font-size:.82em;opacity:.78;margin-bottom:6px';
  hint.textContent='条件なしでも挑戦可能。条件付きは地域Option傾向が34%→最大38%。';picker.appendChild(hint);
  const buttons=document.createElement('div');buttons.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
  const none=document.createElement('button');none.className=active?'btn-sub':'btn-main';none.textContent='なし';
  none.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();clearActiveDeepSurveyCondition(def.realmId);renderConditionPicker(def);});
  buttons.appendChild(none);
  for(const condition of surveyConditionsForRegion(def.id)){
    const button=document.createElement('button');button.className=active?.id===condition.id?'btn-main':'btn-sub';button.textContent=condition.name;
    button.title=condition.desc;
    button.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();setActiveDeepSurveyCondition(def.realmId,condition.id);renderConditionPicker(def);});
    buttons.appendChild(button);
  }
  picker.appendChild(buttons);
  const selected=activeDeepSurveyCondition(def.realmId);
  const detail=document.createElement('div');detail.style.cssText='font-size:.82em;margin-top:7px;opacity:.86';
  detail.textContent=selected?`選択中：${selected.name} — ${selected.desc}`:'条件なし：通常の深層観測';picker.appendChild(detail);
}

function annotateConfirm(){
  const title=document.getElementById('confirmStageName');const mods=document.getElementById('confirmModifiers');if(!title||!mods)return;
  const def=matchDef(title.textContent);
  if(!def){renderConditionPicker(null);return;}
  // renderStageConfirm rewrites textContent but leaves dataset on the same DOM node,
  // so test actual content instead of relying only on the previous annotation marker.
  if(!mods.textContent.includes('BUILD TARGET：')){
    const base=mods.textContent||'';
    mods.textContent=`${base}\nBUILD TARGET：${def.role}\nMIXED CHASE：${def.rewardHint}`.trim();
  }
  mods.dataset.deepSurveyFor=def.id;
  mods.style.whiteSpace='pre-line';mods.classList.remove('hidden');
  renderConditionPicker(def);
}

let scheduled=false;
function refresh(){scheduled=false;annotateStageList();annotateConfirm();}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
const list=document.getElementById('stageList');if(list)new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
document.addEventListener('click',schedule);
schedule();
