import { state } from '../state.js';
function render(){
 const root=document.getElementById('settlementContent');if(!root||root.querySelector('[data-settlement-endgame-network]'))return;
 const nodes=state.settlementEndgameNetwork?.()||[],summary=state.settlementEndgameSummary?.()||{};
 const section=document.createElement('section');section.dataset.settlementEndgameNetwork='true';section.style.marginTop='14px';
 section.innerHTML=`<details class="forge-card"><summary>終端ネットワーク ${summary.online||0}/${summary.total||nodes.length}接続${summary.attention?` ・ ${summary.attention}件注目`:''}</summary><div class="forge-card-sub" style="margin:8px 0;">World Tierや各Endgameの報酬倍率は正本側のまま。Settlementは状況・研究・導線だけを統合する。</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;">${nodes.map(n=>`<div class="forge-card" style="padding:9px 10px;"><div class="forge-card-top"><div class="forge-card-name">${n.name}</div><strong>${n.status}</strong></div><div class="forge-card-sub">${n.area}｜${n.detail}</div>${n.attention?'<div class="forge-card-sub" style="margin-top:4px;">● 対応・確認候補</div>':''}</div>`).join('')}</div><button class="forge-card-btn settlement-abyss-return" style="margin-top:8px;">深層帰還報告を確認</button></details>`;
 root.appendChild(section);
 section.querySelector('.settlement-abyss-return')?.addEventListener('click',()=>{const r=state.consumeSettlementAbyssReturn?.();alert(r?.text||'新しい深層帰還報告はありません。');root.querySelector('[data-settlement-endgame-network]')?.remove();render();});
}
render();new MutationObserver(render).observe(document.body,{childList:true,subtree:true});
