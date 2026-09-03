import { state } from '../state.js';
import { allJobs, getJob, unlockRequirementText, TIERS } from '../data/jobs.js';
import { Audio_ } from '../audio.js';

const TIER_ORDER=['basic','advanced','special','hero','secret'];
const TIER_LABEL={basic:'基本職',advanced:'上級職',special:'特級職',hero:'勇者',secret:'秘密職'};
const STAT_LABEL={hp:'HP',mp:'MP',atk:'ATK',def:'DEF',mag:'MAG',mdef:'MDEF',spd:'SPD'};
let activeTier='basic';
let selectedJobId=null;

function discovered(job){
  if(!job.secret) return job.tier==='basic' || state.canSwitchTo(job.id) || state.isMastered(job.id) || !!state.data.jobs?.[job.id];
  return !!state.data.discoveredSecretJobs?.includes(job.id);
}
function visibleName(job){ return job.secret&&!discovered(job)?'？？？？？':job.name; }
function masteryLevel(job){ return TIERS[job.tier]?.masteryLv ?? null; }
function pctBar(value,max){ const p=max?Math.min(100,value/max*100):100; return `<div style="height:6px;background:#242735;border-radius:99px;overflow:hidden;margin-top:5px"><div style="width:${p}%;height:100%;background:#d7b35c"></div></div>`; }
function growthStars(values,key){
  const nums=Object.values(values).filter(v=>Number.isFinite(v)); const max=Math.max(...nums,1); const n=Math.max(1,Math.min(5,Math.round((values[key]||0)/max*5))); return '★'.repeat(n)+'☆'.repeat(5-n);
}
function techniqueRows(job){
  const rows=[];
  for(const s of job.skills||[]) rows.push({name:s.name||s.id,learn:s.learnLevel,type:'特技'});
  for(const s of job.spells||[]) rows.push({name:s.name||s.id,learn:s.learnLevel,type:'呪文'});
  rows.sort((a,b)=>{ const av=a.learn==='master'?999:Number(a.learn||1),bv=b.learn==='master'?999:Number(b.learn||1); return av-bv; });
  return rows;
}
function derivativeJobs(job){ return allJobs().filter(j=>Array.isArray(j.requires)&&j.requires.includes(job.id)); }
function masteryBonusText(job){
  const b=job.masterBonus||job.masterAbility; if(!b)return 'なし';
  if(b.kind==='stat') return `${String(b.stat).toUpperCase()} +${Math.round((b.pct||0)*100)}%`;
  if(b.kind==='skillPower') return `特技威力 +${Math.round((b.pct||0)*100)}%`;
  if(b.kind==='healPower') return `回復力 +${Math.round((b.pct||0)*100)}%`;
  if(b.kind==='passive') return `${b.channel} +${Math.round((b.pct||0)*100)}%`;
  if(b.effect) return `${String(b.effect.stat||'特殊').toUpperCase()} ${Math.round((b.effect.pct||0)*100)}%`;
  return '特殊能力';
}
function collectionSummary(){
  const jobs=allJobs().filter(j=>!j.secret); const found=jobs.filter(discovered).length;
  const tier=Object.fromEntries(['basic','advanced','special','hero'].map(t=>{const a=jobs.filter(j=>j.tier===t);return[t,[a.filter(discovered).length,a.length]];}));
  const secrets=allJobs().filter(j=>j.secret); const secretFound=secrets.filter(discovered).length;
  return `<div class="status-section"><h3>職業図鑑 ${found} / ${jobs.length}</h3>${pctBar(found,jobs.length)}<div class="character-metric-grid" style="margin-top:10px">${Object.entries(tier).map(([t,[f,n]])=>`<div class="character-metric"><span>${TIER_LABEL[t]}</span><strong>${f}/${n}</strong></div>`).join('')}<div class="character-metric"><span>秘密職</span><strong>${secretFound}/???</strong></div></div></div>`;
}
function listView(){
  const content=document.getElementById('jobCodexContent'); if(!content)return;
  const jobs=allJobs().filter(j=>(j.secret?'secret':j.tier)===activeTier);
  const tabs=TIER_ORDER.filter(t=>t!=='secret'||allJobs().some(j=>j.secret)).map(t=>`<button class="tab-btn${activeTier===t?' active':''}" data-jc-tier="${t}">${TIER_LABEL[t]}</button>`).join('');
  const cards=jobs.map(job=>{
    const known=discovered(job), prog=state.jobProgress(job.id), ml=masteryLevel(job), mastered=state.isMastered(job.id);
    return `<button class="pick-row" data-jc-job="${job.id}" style="width:100%;text-align:left;opacity:${known?1:.62}"><div><div class="item-name">${visibleName(job)} ${mastered?'★MASTER':''}</div><div class="item-stats">${known?`${job.desc||''}<br>Job Lv.${prog.level}${ml?` / MASTER ${ml}`:''}`:'まだこの職業の正体は分からない。'}</div></div><span>›</span></button>`;
  }).join('')||'<p class="hint">まだ記録はありません。</p>';
  content.innerHTML=collectionSummary()+`<div class="tab-row">${tabs}</div><div class="status-section"><div>${cards}</div></div>`;
  content.querySelectorAll('[data-jc-tier]').forEach(b=>b.addEventListener('click',()=>{Audio_.tap();activeTier=b.dataset.jcTier;listView();}));
  content.querySelectorAll('[data-jc-job]').forEach(b=>b.addEventListener('click',()=>{Audio_.tap();selectedJobId=b.dataset.jcJob;detailView(selectedJobId);}));
}
function detailView(jobId){
  const content=document.getElementById('jobCodexContent'); const job=getJob(jobId); if(!content||!job)return;
  if(job.secret&&!discovered(job)){
    content.innerHTML=`<button class="btn-sub" id="jcListBack">← 一覧</button><div class="status-section"><h2>？？？？？</h2><p class="hint">未知の職業。特別な条件を満たすことで、その存在が明らかになる。</p></div>`;
    document.getElementById('jcListBack').onclick=()=>listView(); return;
  }
  const g=state.getGrowthPerCharacterLevel(job.id); const history=state.getGrowthHistory?.()||{}; const prog=state.jobProgress(job.id); const ml=masteryLevel(job);
  const growthHtml=Object.keys(STAT_LABEL).map(k=>`<div class="status-row"><span class="status-label">${STAT_LABEL[k]}</span><span><strong>${g[k]>=0?'+':''}${Number(g[k]||0).toFixed(k==='spd'?1:2)}</strong> <span class="status-cap">${growthStars(g,k)}</span></span></div>`).join('');
  const techniques=techniqueRows(job).map(t=>`<div class="status-row"><span>${t.type}：${t.name}</span><strong>${t.learn==='master'?'MASTER':`Lv.${t.learn}`}</strong></div>`).join('')||'<p class="hint">習得技なし</p>';
  const derivatives=derivativeJobs(job).map(j=>`<button class="btn-sub" data-jc-next="${j.id}" style="margin:3px">${visibleName(j)}</button>`).join('')||'<span class="hint">派生先なし</span>';
  content.innerHTML=`<button class="btn-sub" id="jcListBack">← 一覧</button>
    <div class="status-section"><h2>${job.name}</h2><p class="hint">${TIER_LABEL[job.tier]||job.tier} ・ 得意武器：${job.weapon||'—'}<br>${job.desc||''}</p><div class="status-grid"><div class="status-row"><span>Job Lv</span><strong>${prog.level}${ml?` / ${ml}`:''}</strong></div><div class="status-row"><span>解放条件</span><strong>${unlockRequirementText(job.id)}</strong></div><div class="status-row"><span>この職でCharacter Lv UP</span><strong>${history[job.id]||0}回</strong></div><div class="status-row"><span>MASTERボーナス</span><strong>${masteryBonusText(job)}</strong></div></div></div>
    <div class="status-section"><h3>Character Lvアップ時の永久成長</h3><p class="hint">この職業でCharacter Lvが上がると、以下の値がキャラクターへ永久に加算されます。</p><div class="status-grid">${growthHtml}</div></div>
    <div class="status-section"><h3>習得する特技・呪文</h3><div class="status-grid">${techniques}</div></div>
    <div class="status-section"><h3>派生する職業</h3><div>${derivatives}</div></div>`;
  document.getElementById('jcListBack').onclick=()=>{Audio_.tap();listView();};
  content.querySelectorAll('[data-jc-next]').forEach(b=>b.addEventListener('click',()=>{Audio_.tap();selectedJobId=b.dataset.jcNext;detailView(selectedJobId);}));
}
function openCodex(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('jobCodexScreen').classList.add('active'); selectedJobId=null; listView(); }
function backToJobs(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('jobsScreen').classList.add('active'); }
function install(){
  const jobs=document.getElementById('jobsScreen'); if(!jobs||document.getElementById('jobCodexScreen'))return;
  const header=jobs.querySelector('.subbar'); const btn=document.createElement('button'); btn.id='jobCodexBtn';btn.className='btn-sub';btn.textContent='図鑑';header.appendChild(btn);btn.addEventListener('click',()=>{Audio_.tap();openCodex();});
  const screen=document.createElement('section');screen.id='jobCodexScreen';screen.className='screen';screen.innerHTML='<header class="subbar"><button class="btn-back" id="jobCodexBackBtn">←</button><h2>職業図鑑</h2></header><div id="jobCodexContent" class="blacksmith-content"></div>';document.body.appendChild(screen);
  document.getElementById('jobCodexBackBtn').addEventListener('click',()=>{Audio_.tap();backToJobs();});
}
install();
