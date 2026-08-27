/* Post-CP3 Deep Survey — compact annotations on the existing Adventure/Secret Realm UI. */
import { CP3_DEEP_SURVEYS } from '../data/postCp3DeepSurvey.js';

function matchDef(text=''){return CP3_DEEP_SURVEYS.find(def=>String(text).includes(def.realmName)||String(text).includes(`深層観測・${def.realmName.replace('・深層観測','')}`))||null;}

function annotateStageList(){
  const list=document.getElementById('stageList');if(!list)return;
  let found=false;
  for(const card of list.querySelectorAll('.stage-card')){
    const def=matchDef(card.querySelector('.name')?.textContent||'');if(!def)continue;found=true;
    if(card.dataset.deepSurveyAnnotated)return;card.dataset.deepSurveyAnnotated='true';
    const rec=card.querySelector('.rec');if(rec)rec.innerHTML=`<strong>深層観測</strong> / 推奨Lv 99,999 / 目標IP 10,000<br>${def.role}<br><span style="opacity:.76">${def.rewardHint}</span>`;
  }
  if(found){
    const headings=[...list.querySelectorAll('.section-heading')];
    const h=headings.find(x=>x.textContent.includes('深淵で発見した異界'));
    if(h)h.textContent='異界・深層観測';
  }
}

function annotateConfirm(){
  const title=document.getElementById('confirmStageName');const mods=document.getElementById('confirmModifiers');if(!title||!mods)return;
  const def=matchDef(title.textContent);if(!def||mods.dataset.deepSurveyFor===def.id)return;
  mods.dataset.deepSurveyFor=def.id;
  const base=mods.textContent||'';
  mods.textContent=`${base}\nBUILD TARGET：${def.role}\nREWARD：${def.rewardHint}`.trim();
  mods.style.whiteSpace='pre-line';mods.classList.remove('hidden');
}

let scheduled=false;
function refresh(){scheduled=false;annotateStageList();annotateConfirm();}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(refresh);}
const list=document.getElementById('stageList');if(list)new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
document.addEventListener('click',schedule);
schedule();
