/* Post-Gear Deep Survey — compact annotations on existing Adventure/Secret Realm UI only. */
import './postCp3SurveyConditionCombat.js';
import { state } from '../state.js';
import { CP3_DEEP_SURVEYS } from '../data/postCp3DeepSurvey.js';
import { CONVERGENCE_APEX_ID } from '../data/postCp3ConvergenceApex.js';
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
function isApexText(text=''){return String(text).includes('CONVERGENCE APEX')||String(text).includes('収束観測');}

function annotateStageList(){
  const list=document.getElementById('stageList');if(!list)return;
  let found=false;
  for(const card of list.querySelectorAll('.stage-card')){
    const name=card.querySelector('.name')?.textContent||'';
    if(isApexText(name)){
      found=true;
      if(card.dataset.convergenceApexAnnotated)return;card.dataset.convergenceApexAnnotated='true';
      const rec=card.querySelector('.rec');
      if(rec)rec.innerHTML='<strong>APEX / 4-PHASE</strong> ・ 推奨Lv 99,999 ・ 目標IP 10,000<br>ASH → NINTH → ROOT → CONVERGENCE<br><span style="opacity:.76">全3地域OptionのMIXED CHASE / 36%（保証なし）</span>';
      continue;
    }
    const def=matchDef(name);if(!def)continue;found=true;
    if(card.dataset.deepSurveyAnnotated)return;card.dataset.deepSurveyAnnotated='true';
    const rec=card.querySelector('.rec');
    if(rec)rec.innerHTML=`<strong>深層観測 / MIXED CHASE</strong> ・ 推奨Lv 99,999 ・ 目標IP 10,000<br>${def.role}<br><span style="opacity:.76">${def.rewardHint}</span>`;
  }
  if(found){const heading=[...list.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('深淵で発見した異界')||x.textContent.includes('異界・深層観測'));if(heading)heading.textContent='異界・深層観測 / APEX';}
}

function conditionPicker(){
  let el=document.getElementById('deepSurveyConditionPicker');if(el)return el;
  const mods=document.getElementById('confirmModifiers');if(!mods?.parentElement)return null;
  el=document.createElement('div');el.id='deepSurveyConditionPicker';el.className='hidden';
  el.style.cssText='margin-top:8px;padding:9px;border:1px solid var(--border,#444);border-radius:9px';mods.insertAdjacentElement('afterend',el);return el;
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

  const heading=document.createElement('div');heading.className='section-heading';heading.textContent=`Survey Condition（任意・最大${maxConditions}）`;picker.appendChild(heading);
  const hint=document.createElement('div');hint.style.cssText='font-size:.82em;line-height:1.45;opacity:.8;margin-bottom:7px';
  hint.textContent=mastery.complete
    ? '単独3/3 MASTER｜2条件まで組合せ可｜Option傾向 最大42%'
    : `単独 ${mastery.cleared}/3｜各条件を単独クリアで2条件解禁｜1条件 最大38%`;
  picker.appendChild(hint);

  const buttons=document.createElement('div');buttons.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px';
  const none=document.createElement('button');none.className=active.length?'btn-sub':'btn-main';none.textContent='なし';none.style.minHeight='42px';none.setAttribute('aria-pressed',String(active.length===0));
  none.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();clearActiveDeepSurveyCondition(def.realmId);renderConditionPicker(def);});buttons.appendChild(none);

  for(const condition of conditions){
    const selected=active.some(c=>c.id===condition.id);
    const singleId=encodeDeepSurveyConditionStageId(def.realmId,[condition.id]);
    const cleared=state.isStageCleared(singleId);
    const button=document.createElement('button');button.className=selected?'btn-main':'btn-sub';button.textContent=`${cleared?'★ ':''}${condition.name}`;button.title=condition.desc;button.style.minHeight='42px';button.setAttribute('aria-pressed',String(selected));
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
  const detail=document.createElement('div');detail.style.cssText='font-size:.82em;line-height:1.45;margin-top:8px;opacity:.88';
  detail.textContent=active.length?`選択：${active.map(c=>c.name).join(' ＋ ')}｜Option傾向 最大${active.length>=2?'42':'38'}%`:'条件なし｜通常の深層観測｜34%';picker.appendChild(detail);
}

function annotateApexConfirm(mods){
  renderConditionPicker(null);
  if(!mods.textContent.includes('APEX PHASES：')){
    const base=mods.textContent||'';
    mods.textContent=`${base}\nAPEX PHASES：ASH → NINTH → ROOT → CONVERGENCE\nMIXED CHASE：全3地域Option / 36%（保証なし）\nFIRST CLEAR：境界反響核\nREPEAT：既存CP3 / Gearドロップ`.trim();
  }
  mods.dataset.convergenceApex=CONVERGENCE_APEX_ID;
  mods.style.whiteSpace='pre-line';mods.classList.remove('hidden');
}

function annotateConfirm(){
  const title=document.getElementById('confirmStageName');const mods=document.getElementById('confirmModifiers');if(!title||!mods)return;
  if(isApexText(title.textContent)){annotateApexConfirm(mods);return;}
  const def=matchDef(title.textContent);if(!def){renderConditionPicker(null);return;}
  if(!mods.textContent.includes('BUILD TARGET：')){const base=mods.textContent||'';mods.textContent=`${base}\nBUILD TARGET：${def.role}\nMIXED CHASE：${def.rewardHint}`.trim();}
  mods.dataset.deepSurveyFor=def.id;mods.style.whiteSpace='pre-line';mods.classList.remove('hidden');renderConditionPicker(def);
}

let scheduled=false;
function refresh(){scheduled=false;annotateStageList();annotateConfirm();}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
const list=document.getElementById('stageList');if(list)new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
document.addEventListener('click',schedule);schedule();
