/* Settlement 3.0 S17 — compact museum / chronicle UI. */
import { state } from '../state.js';

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
 const host=document.getElementById('settlementContent');if(!host||host.querySelector('[data-settlement-chronicle]')||!state.settlementChronicle)return;
 const exhibits=state.settlementChronicle(),timeline=state.settlementChronicleTimeline?.()||[];
 const box=document.createElement('details');box.dataset.settlementChronicle='true';box.style.marginTop='8px';
 box.innerHTML=`<summary>🏛️ 記念碑・博物館・年代記　${exhibits.map(x=>`${x.icon}${esc(x.value)}`).join('　')}</summary>
 <div class="forge-card-sub" style="padding:8px;margin-top:6px">
  <small>既存の討伐・Abyss・World Tier・Unique・継承記録を展示する閲覧レイヤー。報酬・達成率・Codex分母は変更しない。</small>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:6px;margin-top:7px">${exhibits.map(x=>`<div style="border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:7px"><strong>${x.icon} ${esc(x.place)}</strong><div>${esc(x.name)}：${esc(x.value)}</div><small>${esc(x.detail)}</small></div>`).join('')}</div>
  <details style="margin-top:7px"><summary>📜 継承年代記</summary><div style="display:grid;gap:5px;margin-top:5px">${timeline.slice(-12).reverse().map(x=>`<div><strong>${esc(x.title)}</strong><br><small>${esc(x.text)}</small></div>`).join('')}</div></details>
 </div>`;
 host.appendChild(box);
}
queueMicrotask(render);
const root=document.getElementById('settlementScreen')||document.body;new MutationObserver(render).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
export { render as renderSettlementChronicle };
