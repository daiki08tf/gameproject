/* ============================================================
   Awakening 3.0 — permanent rank choices
   ============================================================ */
import { state } from '../state.js';
import { awakeningImprintList, getAwakeningImprint } from '../data/awakeningImprints.js';

function ensureAwakening3(){
  if(!state.data.awakening3Imprints||typeof state.data.awakening3Imprints!=='object')state.data.awakening3Imprints={};
}
ensureAwakening3();

state.awakening3ImprintChoices=function awakening3ImprintChoices(){ensureAwakening3();return awakeningImprintList();};
state.awakening3ImprintForRank=function awakening3ImprintForRank(rank){ensureAwakening3();return this.data.awakening3Imprints[String(rank)]||null;};
state.canChooseAwakening3Imprint=function canChooseAwakening3Imprint(rank,id){
  ensureAwakening3();
  const r=Math.max(1,Math.floor(Number(rank)||0));
  if(r>this.awakeningV2Rank())return false;
  if(this.awakening3ImprintForRank(r))return false;
  return !!getAwakeningImprint(id);
};
state.chooseAwakening3Imprint=function chooseAwakening3Imprint(rank,id){
  if(!this.canChooseAwakening3Imprint(rank,id))return false;
  this.data.awakening3Imprints[String(rank)]=id;this.save();return true;
};
state.awakening3Effects=function awakening3Effects(){
  ensureAwakening3();const out=[];
  for(let rank=1;rank<=this.awakeningV2Rank();rank++){
    const id=this.awakening3ImprintForRank(rank),def=getAwakeningImprint(id);if(def)out.push(def.effectForRank(rank));
  }
  return out;
};

const previousEffects=state.getEquippedEffects.bind(state);
state.getEquippedEffects=function getEquippedEffectsWithAwakening3(){return[...previousEffects(),...this.awakening3Effects()];};

function renderAwakening3Panel(){
  const content=document.getElementById('rebirthContent');
  if(!content||!content.querySelector('.rebirth-count')||document.getElementById('awakening3ImprintsPanel'))return;
  const rank=state.awakeningV2Rank();
  const wrap=document.createElement('div');wrap.id='awakening3ImprintsPanel';
  let html='<div class="section-heading">覚醒の刻印 — Rankごとの永久選択</div><div class="forge-card"><div class="forge-card-sub">各覚醒Rankで1つだけ選択。選んだ刻印は継承・転職後も残り、現在は変更できません。</div></div>';
  for(let r=1;r<=rank;r++){
    const selected=state.awakening3ImprintForRank(r);
    html+=`<div class="forge-card"><div class="forge-card-top"><div class="forge-card-name">Rank ${r}</div><strong>${selected?'刻印済み':'未選択'}</strong></div>`;
    for(const def of state.awakening3ImprintChoices()){
      const chosen=selected===def.id;
      html+=`<div class="forge-card-sub" style="margin-top:6px;"><strong>${def.icon} ${def.name}${chosen?' ★':''}</strong><br>${def.desc}${selected?'':`<br><button class="btn-sub awakening3-pick" data-rank="${r}" data-id="${def.id}" style="margin-top:4px;">この刻印を選ぶ</button>`}</div>`;
    }
    html+='</div>';
  }
  wrap.innerHTML=html;content.appendChild(wrap);
  wrap.querySelectorAll('.awakening3-pick').forEach(btn=>btn.addEventListener('click',()=>{
    if(state.chooseAwakening3Imprint(Number(btn.dataset.rank),btn.dataset.id)){
      document.getElementById('awakening3ImprintsPanel')?.remove();renderAwakening3Panel();
    }
  }));
}
if(typeof MutationObserver!=='undefined'){
  const content=document.getElementById('rebirthContent');
  if(content)new MutationObserver(()=>renderAwakening3Panel()).observe(content,{childList:true,subtree:false});
}

export { ensureAwakening3, renderAwakening3Panel };
