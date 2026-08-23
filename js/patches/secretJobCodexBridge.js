import { state } from '../state.js';

function renderSecretCodexBlock(){
  const screen=document.getElementById('jobCodexScreen');
  const content=document.getElementById('jobCodexContent');
  if(!screen||!content||!screen.classList.contains('active')||document.getElementById('secretJobCodexBlock')) return;
  const jobs=state.getSecretJobs?.()||[];
  if(!jobs.length)return;
  const block=document.createElement('div'); block.id='secretJobCodexBlock'; block.className='status-section';
  const found=jobs.filter(j=>state.isSecretJobDiscovered(j.id)).length;
  block.innerHTML=`<h3>秘密職 ${found}/???</h3><p class="hint">秘密職は条件を満たすまで正体も総数も明かされません。</p>`+jobs.map(j=>{
    const known=state.isSecretJobDiscovered(j.id); const cond=state.secretJobConditions(j.id);
    return `<div class="pick-row" style="margin:6px 0"><div><div class="item-name">${known?j.name:'？？？？？'}</div><div class="item-stats">${known?`${j.desc}<br>${cond.map(c=>`${c.done?'✓':'□'} ${c.label}`).join(' / ')}<br>Job Lv.${state.jobProgress(j.id).level} / MASTER ${j.masteryLv}`:j.hint}</div></div></div>`;
  }).join('');
  content.appendChild(block);
}

const observer=new MutationObserver(()=>queueMicrotask(renderSecretCodexBlock));
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
