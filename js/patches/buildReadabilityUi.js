/* ============================================================
   PLAY / TUNE / SYSTEM & UI POLISH IV — Build Readability Layer
   ------------------------------------------------------------
   Explains what a choice changes without adding a new screen,
   save field, currency, or combat modifier.
   ============================================================ */
import { state } from '../state.js';
import { getItem, WEAPON_TYPES } from '../data/equipment.js';
import { getJob } from '../data/jobsPhase8.js';
import { COMPANION_NATURES } from '../data/companions.js';
import { unlockedCompanionSkills } from '../data/companionSkills.js';
import { uniqueBranchEffect } from '../data/uniqueBranchEffects.js';

const ROLE_RULES = [
  ['ボス特化', /boss|強敵|王殺|断頭|execute|巨大/i],
  ['ローテ型', /action.?divers|異なる行動|sequence|no.?repeat|連続して同じ|戦術の差/i],
  ['反撃型', /counter|報復|反撃|guardNext|hurtCharge|受け止め|ガード/i],
  ['高HP維持', /high.?hp|高HP|HP70|HP50|満タン/i],
  ['瀕死火力', /low.?hp|瀕死|HP35|窮地/i],
  ['継戦型', /lifesteal|吸収|回復|refund|還元/i],
  ['魔法型', /MAG|魔法|spell|杖|MP/i],
  ['会心型', /CRIT|会心|crit/i],
  ['速度型', /SPD|速度|先手|spd/i],
  ['耐久型', /DEF|防御|HP|盾|fortress|守り/i],
  ['物理型', /ATK|攻撃|剣|atk/i],
];

function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function tagsFromText(text, max=3){
  const out=[];
  for(const [label,re] of ROLE_RULES){if(re.test(text)&&!out.includes(label))out.push(label);if(out.length>=max)break;}
  return out.length?out:['万能型'];
}
function chipHtml(tags){return tags.map(t=>`<span class="readability-chip">${escapeHtml(t)}</span>`).join('');}
function lineHtml(label,tags,note=''){return `<div class="readability-line"><span class="readability-label">${escapeHtml(label)}</span>${chipHtml(tags)}${note?`<span class="readability-note">${escapeHtml(note)}</span>`:''}</div>`;}
function textOfEffects(effects=[]){return effects.map(e=>`${e.name||''} ${e.desc||''} ${e.kind||''} ${e.trigger||''}`).join(' ');}

export function equipmentReadability(item, visibleText='', currentJob=state.currentJob){
  const source=[visibleText,item?.name,item?.weaponType,item?.implicit?.desc,textOfEffects(item?.effects)].filter(Boolean).join(' ');
  const tags=tagsFromText(source);
  let note='';
  if(item?.weaponType&&currentJob?.weapon){
    const weapon=WEAPON_TYPES[item.weaponType]?.name||item.weaponType;
    note=item.weaponType===currentJob.weapon?`現在職と得意武器一致：${weapon}`:`${weapon}向け。現在職の得意武器とは別系統`;
  }else if(tags.includes('耐久型')) note='火力値だけでなく、生存や受けから価値が出る装備';
  else note='数値差だけでなく、固有効果とAffixの方向性で判断';
  return {tags,note};
}

function profileTags(job){
  const p=job?.profile||{};
  const ranked=[['物理型',Number(p.atk)||0],['魔法型',Number(p.mag)||0],['耐久型',Math.max(Number(p.def)||0,Number(p.hp)||0)],['速度型',Number(p.spd)||0]].sort((a,b)=>b[1]-a[1]);
  const fromProfile=ranked.filter(x=>x[1]>0).slice(0,2).map(x=>x[0]);
  const fromText=tagsFromText(`${job?.name||''} ${job?.desc||''}`,2);
  return [...new Set([...fromProfile,...fromText])].slice(0,3);
}
function equippedWeapon(){const id=state.data.equipped?.weapon;return id?getItem(id):null;}
export function jobReadability(job){
  const tags=profileTags(job);
  const weapon=equippedWeapon();
  let note='';
  if(job?.weapon&&weapon?.weaponType){
    note=job.weapon===weapon.weaponType
      ? `装備相性◎：現在の${WEAPON_TYPES[weapon.weaponType]?.name||weapon.weaponType}をそのまま活かせる`
      : `装備相性△：現在武器は${WEAPON_TYPES[weapon.weaponType]?.name||weapon.weaponType}`;
  }else if(job?.weapon){
    note=`得意武器：${WEAPON_TYPES[job.weapon]?.name||job.weapon}`;
  }else note='職業説明と成長傾向から役割を表示';
  return {tags,note};
}

export function companionReadability(companion){
  if(!companion)return {tags:['万能型'],note:''};
  const {species,instance,stats}=companion;
  const skills=unlockedCompanionSkills(species,instance.level);
  const nature=COMPANION_NATURES[instance.nature];
  const statPairs=[['物理型',stats.atk],['魔法型',stats.mag],['耐久型',(stats.hp/5)+stats.def],['速度型',stats.spd]].sort((a,b)=>b[1]-a[1]);
  const skillTags=tagsFromText(skills.map(s=>`${s.name} ${s.desc}`).join(' '),2);
  const tags=[...new Set([statPairs[0][0],...skillTags])].slice(0,3);
  const ai=nature?.ai||instance.nature;
  const aiLabel={aggressive:'攻撃優先',defensive:'守備優先',support:'支援優先',balanced:'バランス'}[ai]||nature?.name||'役割自動';
  return {tags,note:`AI傾向：${aiLabel}。編成では他2体と役割をずらすと「役割分担」を狙いやすい`};
}

export function uniqueBranchReadability(itemId,branchId){
  const br=uniqueBranchEffect(itemId,branchId);
  if(!br)return {tags:['分岐進化'],note:'条件達成後に固有の戦闘ループへ変化'};
  const source=`${br.name} ${textOfEffects(br.effects)} ${Object.keys(br.stats||{}).join(' ')}`;
  const tags=tagsFromText(source);
  const kinds=(br.effects||[]).map(e=>e.kind);
  let note='戦い方が固有効果中心へ変化';
  if(kinds.some(k=>/lowHp/i.test(k)))note='HPをあえて削った状態で最大火力を狙う分岐';
  else if(kinds.some(k=>/highHp|lifesteal/i.test(k)))note='HPを高く維持し、吸収を絡めて安定火力を出す分岐';
  else if(kinds.some(k=>/guard|hurtCharge/i.test(k)))note=kinds.includes('guardFortress')?'ガードを軸に受け切りながら反撃する分岐':'被弾・ガードを次の大反撃へ変える分岐';
  else if(kinds.some(k=>/bossDamage|execute/i.test(k)))note='雑魚処理より強敵・終盤の削り切りを優先する分岐';
  else if(kinds.includes('strongKillMomentum'))note='強敵を倒すほど勢いを積み、連戦で伸びる分岐';
  else if(kinds.some(k=>/sequence|noRepeat/i.test(k)))note='同じ行動を連打せず、行動順を組み立てて火力を伸ばす分岐';
  else if(kinds.some(k=>/star|spell|mp/i.test(k)))note='魔法運用を軸に、MP管理か追加攻撃へ寄せる分岐';
  return {tags,note};
}

function installStyle(){
  if(document.getElementById('buildReadabilityStyle'))return;
  const style=document.createElement('style');style.id='buildReadabilityStyle';style.textContent=`
    .readability-line{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:6px;font-size:11px;line-height:1.35}
    .readability-label{font-weight:700;opacity:.78;margin-right:1px}
    .readability-chip{display:inline-flex;align-items:center;min-height:22px;padding:2px 7px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.055);font-weight:700;white-space:nowrap}
    .readability-note{flex-basis:100%;opacity:.72}
    .readability-current-strip{margin:8px 0 10px;padding:8px 10px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.035)}
    .readability-current-strip .readability-line{margin-top:2px}
    .phase8-job-row .readability-line{grid-column:1/-1;margin:5px 0 0}
    .companion-card .readability-line{margin:5px 0 7px}
    @media(max-width:600px){.readability-note{font-size:10px}.readability-chip{min-height:20px;padding:1px 6px}}
  `;document.head.appendChild(style);
}

function decorateEquipment(){
  const screen=document.getElementById('equipmentScreen');if(!screen?.classList.contains('active'))return;
  for(const row of screen.querySelectorAll('#equipPicker .pick-row:not(#uniqueTrialPanel)')){
    if(row.querySelector(':scope > .pick-main > .readability-line'))continue;
    const main=row.querySelector(':scope > .pick-main');if(!main)continue;
    const name=row.querySelector('.item-name')?.textContent||'';
    const ids=[...Object.values(state.data.equipped||{}),...Object.keys(state.data.inventory||{})].filter(Boolean);
    const id=ids.find(x=>{const i=getItem(x);return i?.name&&name.includes(i.name);});
    const item=id?getItem(id):null;
    const r=equipmentReadability(item,row.textContent||'');
    main.insertAdjacentHTML('beforeend',lineHtml('向いているビルド',r.tags,r.note));
  }
}
function decorateJobs(){
  const host=document.getElementById('jobTiers');if(!host)return;
  if(!host.querySelector('.readability-current-strip')){
    const current=state.currentJob;
    const r=jobReadability(current);
    const strip=document.createElement('div');strip.className='readability-current-strip';
    strip.innerHTML=lineHtml('現在の職業',r.tags,`${current?.name||'現在職'} — ${r.note}`);
    host.prepend(strip);
  }
  for(const btn of host.querySelectorAll('[data-job-detail]')){
    const row=btn.closest('.phase8-job-row');if(!row||row.querySelector(':scope > .readability-line'))continue;
    const job=getJob(btn.dataset.jobDetail);if(!job)continue;const r=jobReadability(job);
    row.insertAdjacentHTML('beforeend',lineHtml('噛み合い',r.tags,r.note));
  }
}
function decorateCompanions(){
  for(const card of document.querySelectorAll('.companion-card[data-companion-id]')){
    if(card.querySelector(':scope > .readability-line'))continue;
    const c=state.getCompanion?.(card.dataset.companionId);if(!c)continue;const r=companionReadability(c);
    const actions=card.querySelector('.confirm-actions');
    const wrap=document.createElement('div');wrap.innerHTML=lineHtml('得意役割',r.tags,r.note);const node=wrap.firstElementChild;
    actions?card.insertBefore(node,actions):card.appendChild(node);
  }
}
function decorateUniqueBranches(){
  for(const row of document.querySelectorAll('[data-unique-branch-item][data-unique-branch-id]')){
    if(row.querySelector(':scope > .readability-line'))continue;
    const r=uniqueBranchReadability(row.dataset.uniqueBranchItem,row.dataset.uniqueBranchId);
    row.insertAdjacentHTML('beforeend',lineHtml('戦い方',r.tags,r.note));
  }
}

let scheduled=false;
function decorate(){scheduled=false;installStyle();decorateEquipment();decorateJobs();decorateCompanions();decorateUniqueBranches();}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(decorate);}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',schedule);
schedule();
