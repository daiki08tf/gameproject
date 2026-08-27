import { state } from '../state.js';
import { getItem } from '../data/equipment.js';
import './buildReadabilityUi.js';

function equippedUniqueIds(){
  return Object.values(state.data.equipped||{}).filter(id=>id&&state.getUniqueTrialProgress?.(id));
}

function buildPanel(){
  const host=document.getElementById('equipPicker');
  if(!host) return;
  const old=document.getElementById('uniqueTrialPanel');
  if(old) old.remove();
  const ids=equippedUniqueIds();
  if(!ids.length) return;

  const panel=document.createElement('div');
  panel.id='uniqueTrialPanel';
  panel.className='pick-row';
  panel.style.display='block';
  panel.style.marginBottom='10px';
  panel.innerHTML='<div class="section-heading">⚔️ ユニーク覚醒試練</div>';

  for(const id of ids){
    const item=getItem(id), p=state.getUniqueTrialProgress(id);
    const box=document.createElement('div');
    box.style.margin='8px 0 12px';
    const lines=p.trials.map(t=>`${t.done?'✓':'□'} ${t.label} (${t.count}/${t.target})`).join('<br>');
    box.innerHTML=`<div class="item-name">${item?.name||id}${p.awakened?' ✨覚醒済':''}</div><div class="item-stats">${p.def.flavor}<br>${lines}</div>`;

    if(p.ready&&!p.awakened){
      const b=document.createElement('button'); b.textContent='覚醒する';
      b.addEventListener('click',()=>{ if(state.awakenUnique(id)) buildPanel(); }); box.appendChild(b);
    }
    if(p.awakened&&!p.branch){
      const title=document.createElement('div'); title.className='item-stats'; title.textContent='— 分岐試練 —'; box.appendChild(title);
      for(const br of state.uniqueBranchAvailability(id)){
        const row=document.createElement('div'); row.className='item-stats';
        row.dataset.uniqueBranchItem=id;
        row.dataset.uniqueBranchId=br.id;
        const req=br.requirements.map(r=>`${(p.counts[r.event]||0)>=r.target?'✓':'□'} ${r.event} ${Math.min(r.target,p.counts[r.event]||0)}/${r.target}`).join(' / ');
        row.innerHTML=`<strong>${br.ready?'✨':'🔒'} ${br.name}</strong> — ${br.hint}<br>${req}`;
        if(br.ready){ const btn=document.createElement('button');btn.textContent=`${br.name}へ進化`;btn.addEventListener('click',()=>{state.chooseUniqueBranch(id,br.id);buildPanel();});row.appendChild(btn); }
        box.appendChild(row);
      }
    }
    if(p.branch){
      const br=p.def.branches.find(b=>b.id===p.branch);
      const done=document.createElement('div'); done.className='item-stats'; done.textContent=`最終進化：${br?.name||p.branch}`; box.appendChild(done);
    }
    panel.appendChild(box);
  }
  host.prepend(panel);
}

// equipment.jsはクリック操作のたびに同期的に再描画するため、クリック処理の
// 完了後に1回だけ試練パネルを差し戻す。MutationObserverは自己更新ループを
// 起こしやすいため使わない。
document.addEventListener('click',(ev)=>{
  const target=ev.target;
  const equipmentScreen=document.getElementById('equipmentScreen');
  const opensEquipment=['goEquipBtn','resultEquipBtn','weaponCodexBackBtn'].includes(target?.id);
  const insideEquipment=equipmentScreen?.contains(target);
  if(opensEquipment||insideEquipment) queueMicrotask(buildPanel);
});

export { buildPanel as renderUniqueTrialPanel };
