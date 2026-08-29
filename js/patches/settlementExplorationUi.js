import { state } from '../state.js';

function rewardText(gained={}){const parts=Object.entries(gained).filter(([,v])=>v>0).map(([k,v])=>`${k} +${v}`);return parts.join(' / ');}
function card(location){
 const status=!location.discovered?'LOCKED':location.completed&&!location.repeatable?'COMPLETE':location.completed?'再訪可':'未探索';
 const action=!location.discovered?'未発見':location.completed&&!location.repeatable?'探索完了':location.completed?'再訪する':'調べる';
 return `<div class="forge-card" data-settlement-exploration-location="${location.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${location.icon} ${location.discovered?location.name:'???'}</div><strong>${status}</strong></div><div class="forge-card-sub">${location.discovered?`${location.area} ／ ${location.desc}`:'街を発展させると、新しい探索地点が見つかる。'}</div>${location.discovered?`<div class="forge-card-sub" style="margin-top:5px;">訪問 ${location.visits}回${location.repeatable?' ／ 再訪可能':' ／ 一度きり'}</div>`:''}<button class="forge-card-btn settlement-explore-location" data-location="${location.id}" ${!location.discovered||location.completed&&!location.repeatable?'disabled':''} style="margin-top:8px;">${action}</button></div>`;
}
export function renderSettlementExploration(){
 const root=document.getElementById('settlementContent');if(!root||root.querySelector('[data-settlement-exploration]'))return;
 const list=state.settlementExplorationLocations?.()||[],summary=state.settlementExplorationSummary?.()||{discovered:0,completed:0,total:list.length};
 const section=document.createElement('section');section.dataset.settlementExploration='true';section.style.marginTop='14px';
 section.innerHTML=`<details class="forge-card"><summary>🧭 拠点探索 ${summary.completed}/${summary.total}発見済み</summary><div class="forge-card-sub" style="margin:8px 0;">街の発展で内部探索地点が増える。初回発見報酬と再訪可能地点は分離し、再訪だけで素材を無限獲得できない。</div><div style="display:grid;gap:8px;">${list.map(card).join('')}</div></details>`;
 root.appendChild(section);
 section.querySelectorAll('.settlement-explore-location').forEach(btn=>btn.addEventListener('click',()=>{const r=state.exploreSettlementLocation?.(btn.dataset.location);if(!r?.ok)return;const reward=rewardText(r.gained);alert(`${r.location.icon} ${r.location.name}\n${r.event}${reward?`\n獲得: ${reward}`:''}`);section.remove();renderSettlementExploration();}));
}
function install(){if(typeof document==='undefined')return;const root=document.getElementById('settlementContent');if(!root)return;if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver(()=>{if(!root.querySelector('[data-settlement-exploration]'))queueMicrotask(renderSettlementExploration);});observer.observe(root,{childList:true});}queueMicrotask(renderSettlementExploration);}
install();
