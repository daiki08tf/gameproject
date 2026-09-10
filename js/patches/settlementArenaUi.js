/* Settlement 3.0 S16 — compact Arena UI inside Settlement. */
import { state } from '../state.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){const host=document.getElementById('settlementContent');if(!host||host.querySelector('[data-settlement-arena]'))return;const summary=state.settlementArenaSummary?.();if(!summary)return;
 const el=document.createElement('details');el.dataset.settlementArena='true';el.className='forge-card';el.innerHTML=`<summary>訓練場 / Arena　${summary.runs}戦</summary><div class="forge-card-sub">報酬・ドロップ・Companion EXPなし。本番前のビルド/AI確認専用。</div><div data-arena-modes></div>`;
 const box=el.querySelector('[data-arena-modes]');
 for(const mode of summary.modes){const row=document.createElement('div');row.className='forge-card-sub';const best=summary.best[`${mode.id}:standard`];row.innerHTML=`<div><strong>${esc(mode.name)}</strong>${best?` <span>BEST ${best.turns}T</span>`:''}</div><div>${esc(mode.description)}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>`;const actions=row.lastElementChild;
  for(const rule of summary.rules){const b=document.createElement('button');b.type='button';b.className='btn-sub';b.textContent=rule.name;b.title=rule.description;b.addEventListener('click',()=>{const stage=state.prepareSettlementArena?.(mode.id,rule.id);if(!stage)return;window.dispatchEvent(new CustomEvent('settlement-arena-start',{detail:{modeId:mode.id,ruleId:rule.id,stageId:stage.id}}));});actions.appendChild(b);}box.appendChild(row);}host.appendChild(el);
}
queueMicrotask(render);const observer=new MutationObserver(()=>render());observer.observe(document.body,{subtree:true,childList:true});
