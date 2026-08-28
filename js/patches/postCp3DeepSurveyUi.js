/* Post-Gear Deep Survey — compact annotations on existing Adventure/Secret Realm UI only. */
import './postCp3SurveyConditionCombat.js';
import { state } from '../state.js';
import { CP3_DEEP_SURVEYS } from '../data/postCp3DeepSurvey.js';
import {
  activeDeepSurveyConditions,
  clearActiveDeepSurveyCondition,
  encodeDeepSurveyConditionStageId,
  setActiveDeepSurveyConditions,
  surveyConditionMastery,
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
  if(found){const heading=[...list.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('深淵で発見した異界'));if(heading)heading.textContent='異界・深層観測';}
}

function conditionPicker(){
  let el=document.getElementById('deepSurveyConditionPicker');if(el)return el;
  const mods=document.getElementById('confirmModifiers');if(!mods?.parentElement)return null;
  el=document.createElement('div');el.id='deepSurveyConditionPicker';el.className='hidden';
  el.style.cssText='margin-top:8px;padding:8px;border:1px solid var(--border,#444);border-radius:8px';mods.insertAdjacentElement('afterend',el);return el;
}

function renderConditionPicker(def){
  const picker=conditionPicker();if(!picker)return;
  if(!def){picker.innerHTML='';picker.classList.add('hidden');return;}
  picker.classList.remove('hidden');picker.innerHTML='';
  const conditions=surveyConditionsForRegion(def.id);
  const mastery=surveyConditionMastery(def.id,def.realmId,id=>state.isStageCleared(id));
  const maxConditions=mastery.complete?2:1;
  let active=activeDeepSurveyConditions(def.realmId).filter(c=>c.regionId===def.id).slice(0,maxConditions);
  if(activeDeepSurveyConditions(def.realmId).length!==active.length)setActiveDeepSurveyConditions(def.realmId,active.map(c=>c.id),maxConditions);

  const heading=document.createElement('div');heading.className='section-heading';heading.textContent=`Survey Condition（任意・最大${maxConditions}つ）`;picker.appendChild(heading);
  const hint=document.createElement('div');hint.style.cssText='font-size:.82em;opacity:.78;margin-bottom:6px';
  hint.textContent=mastery.complete
    ? '単独3/3 MASTER：2条件を組み合わせ可能。地域Option傾向は最大42%。'
    : `単独 ${mastery.cleared}/3：各条件を単独クリアすると2条件が解禁。1条件時は最大38%。`;
  picker.appendChild(hint);

  const buttons=document.createElement('div');buttons.style.cssText='display:flex;gap:5px;flex-wrap:wrap';
  const none=document.createElement('button');none.className=active.length?'btn-sub':'btn-main';none.textContent='なし';
  none.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();clearActiveDeepSurveyCondition(def.realmId);renderConditionPicker(def);});buttons.appendChild(none);

  for(const condition of conditions){
    const selected=active.some(c=>c.id===condition.id);
    const singleId=encodeDeepSurveyConditionStageId(def.realmId,[condition.id]);
    const cleared=state.isStageCleared(singleId);
    const button=document.createElement('button');button.className=selected?'btn-main':'btn-sub';button.textContent=`${cleared?'★ ':''}${condition.name}`;button.title=condition.desc;
    button.disabled=!selected&&active.length>=maxConditions;
    button.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      const now=activeDeepSurveyConditions(def.realmId).filter(c=>c.regionId===def.id).slice(0,maxConditions);
      const ids=now.map(c=>c.id);
      const next=ids.includes(condition.id)?ids.filter(id=>id!==condition.id):[...ids,condition.id];
      setActiveDeepSurveyConditions(def.realmId,next,maxConditions);renderConditionPicker(def);
    });buttons.appendChild(button);
  }
  picker.appendChild(buttons);

  active=activeDeepSurveyConditions(def.realmId).filter(c=>c.regionId===def.id).slice(0,maxConditions);
  const detail=document.createElement('div');detail.style.cssText='font-size:.82em;margin-top:7px;opacity:.86';
  detail.textContent=active.length?`選択中：${active.map(c=>c.name).join(' ＋ ')} — Option傾向 最大${active.length>=2?'42':'38'}%`:'条件なし：通常の深層観測（34%）';picker.appendChild(detail);
}

function annotateConfirm(){
  const title=document.getElementById('confirmStageName');const mods=document.getElementById('confirmModifiers');if(!title||!mods)return;
  const def=matchDef(title.textContent);if(!def){renderConditionPicker(null);return;}
  if(!mods.textContent.includes('BUILD TARGET：')){const base=mods.textContent||'';mods.textContent=`${base}\nBUILD TARGET：${def.role}\nMIXED CHASE：${def.rewardHint}`.trim();}
  mods.dataset.deepSurveyFor=def.id;mods.style.whiteSpace='pre-line';mods.classList.remove('hidden');renderConditionPicker(def);
}

let scheduled=false;
function refresh(){scheduled=false;annotateStageList();annotateConfirm();}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
const list=document.getElementById('stageList');if(list)new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
document.addEventListener('click',schedule);schedule();
