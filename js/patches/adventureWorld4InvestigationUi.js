/* Adventure / World 4.0 — W8 Settlement-side Investigation Board.
   Adds a compact evidence-connection view inside the existing Research screen. */
import { state } from '../state.js';
import { ADVENTURE4_INVESTIGATION_CATALOG } from '../data/adventureWorld4Investigation.js';
import { WORLD3_REGIONS } from '../data/world3Regions.js';
import './adventureWorld4InvestigationRuntime.js';

function boardSignature(board){return JSON.stringify(board.map(region=>[region.regionId,region.traces.map(x=>x.id),region.clues.map(x=>x.id)]));}

function clueCard(clue){
  const evidence=clue.evidence.length?clue.evidence.map(name=>`<span class="adventure4-evidence-chip">${name}</span>`).join(''):'<span class="forge-card-sub">関連証拠を整理中</span>';
  return `<div class="forge-card" data-investigation-clue style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">🧩 ${clue.name}</div><strong>CLUE</strong></div><div class="forge-card-sub">${clue.summary}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">${evidence}</div></div>`;
}
function traceCard(trace){return `<div class="forge-card" data-investigation-trace style="padding:9px 11px;"><div class="forge-card-top"><div class="forge-card-name">🔎 ${trace.name}</div><strong>${trace.typeLabel}</strong></div><div class="forge-card-sub">${trace.text}</div></div>`;}
function regionBlock(region){
  const clues=region.clues.map(clueCard).join('');
  const traces=region.traces.map(traceCard).join('');
  return `<div data-investigation-region="${region.regionId}" style="margin-top:10px;"><div class="forge-card-name" style="margin-bottom:7px;">${region.regionName}</div>${clues?`<div style="display:grid;gap:7px;">${clues}</div>`:''}<details class="forge-card" style="margin-top:7px;"><summary>記録済みの痕跡 ${region.traces.length}件</summary><div style="display:grid;gap:7px;margin-top:8px;">${traces}</div></details></div>`;
}

export function renderAdventure4InvestigationBoard(){
  const content=document.getElementById('settlementResearchContent');if(!content)return;
  let panel=document.getElementById('adventure4InvestigationBoard');
  if(!state.settlementResearchUnlocked?.()){panel?.remove();return;}
  const board=state.adventure4InvestigationBoard?.({catalog:ADVENTURE4_INVESTIGATION_CATALOG,regions:WORLD3_REGIONS})||[];
  const sig=boardSignature(board);
  if(panel?.dataset.sig===sig)return;
  if(!panel){panel=document.createElement('section');panel.id='adventure4InvestigationBoard';panel.style.marginTop='14px';content.appendChild(panel);}
  panel.dataset.sig=sig;
  const body=board.length?board.map(regionBlock).join(''):'<div class="forge-card"><div class="forge-card-sub">持ち帰った痕跡・手掛かりはまだない。未知の痕跡やSecretの件数はここでは表示しない。</div></div>';
  panel.innerHTML=`<details class="forge-card" open><summary>🧭 調査記録 — 情報をつなぐ</summary><div class="forge-card-sub" style="margin:8px 0 10px;">依頼の達成チェックではなく、実際に持ち帰った痕跡同士のつながりを整理する。複数の証拠が揃うと新しい手掛かりとして結び付く。</div>${body}</details>`;
}

function install(){
  const content=document.getElementById('settlementResearchContent');if(!content)return;
  const observer=new MutationObserver(()=>queueMicrotask(renderAdventure4InvestigationBoard));
  observer.observe(content,{childList:true});
  queueMicrotask(renderAdventure4InvestigationBoard);
}
install();
