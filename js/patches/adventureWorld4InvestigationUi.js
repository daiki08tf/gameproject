/* Adventure / World 4.0 — W8/W11-W13 Settlement Investigation Board. */
import { state } from '../state.js';
import { ADVENTURE4_INVESTIGATION_CATALOG } from '../data/adventureWorld4Investigation.js';
import { ADVENTURE4_MYSTERIES } from '../data/adventureWorld4Mysteries.js';
import { WORLD3_REGIONS } from '../data/world3Regions.js';
import './adventureWorld4InvestigationRuntime.js';
import './adventureWorld4MysteryRuntime.js';

function boardSignature(board,mysteries,npcs){return JSON.stringify({board:board.map(region=>[region.regionId,region.traces.map(x=>x.id),region.clues.map(x=>x.id)]),mysteries:mysteries.map(x=>[x.id,x.stage,x.secretVisible]),npcs:npcs.map(x=>[x.id,x.location,x.meetings])});}
function clueCard(clue){const evidence=clue.evidence.length?clue.evidence.map(name=>`<span class="adventure4-evidence-chip">${name}</span>`).join(''):'<span class="forge-card-sub">関連証拠を整理中</span>';return `<div class="forge-card" data-investigation-clue style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">🧩 ${clue.name}</div><strong>CLUE</strong></div><div class="forge-card-sub">${clue.summary}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">${evidence}</div></div>`;}
function traceCard(trace){return `<div class="forge-card" data-investigation-trace style="padding:9px 11px;"><div class="forge-card-top"><div class="forge-card-name">🔎 ${trace.name}</div><strong>${trace.typeLabel}</strong></div><div class="forge-card-sub">${trace.text}</div></div>`;}
function regionBlock(region){const clues=region.clues.map(clueCard).join(''),traces=region.traces.map(traceCard).join('');return `<div data-investigation-region="${region.regionId}" style="margin-top:10px;"><div class="forge-card-name" style="margin-bottom:7px;">${region.regionName}</div>${clues?`<div style="display:grid;gap:7px;">${clues}</div>`:''}<details class="forge-card" style="margin-top:7px;"><summary>記録済みの痕跡 ${region.traces.length}件</summary><div style="display:grid;gap:7px;margin-top:8px;">${traces}</div></details></div>`;}
function mysteryCard(view){const label={rumor:'噂',trace:'痕跡',discovery:'発見',research:'研究済み',resolved:'解決'}[view.stage]||view.stage,canResearch=view.stage==='discovery';return `<div class="forge-card" data-mystery="${view.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">🕯️ ${view.name}</div><strong>${label}</strong></div><div class="forge-card-sub">${view.hint||'記録を整理中'}</div>${canResearch?`<button class="forge-card-btn mystery-research" data-mystery-id="${view.id}" style="margin-top:8px;">証拠を研究する</button>`:''}${view.secretVisible?'<div class="forge-card-sub" style="margin-top:7px;">再探索できる地点が絞り込まれた。秘密の場所の存在はここで初めて確定する。</div>':''}</div>`;}
function npcCard(npc){const role={merchant:'Merchant',traveler:'Traveler',scholar:'Scholar',tamer:'Tamer'}[npc.role]||npc.role,place=npc.location==='settlement'?'Settlement':npc.location;return `<div class="forge-card" data-npc="${npc.id}" style="padding:9px 11px;"><div class="forge-card-top"><div class="forge-card-name">🧳 ${npc.name}</div><strong>${role}</strong></div><div class="forge-card-sub">現在地: ${place} ／ 遭遇 ${npc.meetings||0}回</div></div>`;}

export function renderAdventure4InvestigationBoard(){
  const content=document.getElementById('settlementResearchContent');if(!content)return;
  let panel=document.getElementById('adventure4InvestigationBoard');if(!state.settlementResearchUnlocked?.()){panel?.remove();return;}
  const board=state.adventure4InvestigationBoard?.({catalog:ADVENTURE4_INVESTIGATION_CATALOG,regions:WORLD3_REGIONS})||[];
  const mysteries=ADVENTURE4_MYSTERIES.map(m=>state.adventure4MysteryView?.(m.id)).filter(view=>view&&view.stage!=='unknown');
  const npcs=(state.adventure4NpcNetwork?.()||[]).filter(n=>Number(n.meetings||0)>0);
  const sig=boardSignature(board,mysteries,npcs);if(panel?.dataset.sig===sig)return;
  if(!panel){panel=document.createElement('section');panel.id='adventure4InvestigationBoard';panel.style.marginTop='14px';content.appendChild(panel);}panel.dataset.sig=sig;
  const evidence=board.length?board.map(regionBlock).join(''):'<div class="forge-card"><div class="forge-card-sub">持ち帰った痕跡・手掛かりはまだない。未知の痕跡やSecretの件数はここでは表示しない。</div></div>';
  const mysteryHtml=mysteries.length?mysteries.map(mysteryCard).join(''):'<div class="forge-card-sub">記録された長期Mysteryはまだない。</div>',npcHtml=npcs.map(npcCard).join('');
  panel.innerHTML=`<details class="forge-card" open><summary>🧭 調査記録 — 情報をつなぐ</summary><div class="forge-card-sub" style="margin:8px 0 10px;">持ち帰った証拠を結び付ける。Mysteryは必須Storyから独立し、分からなくなった時だけ次のヒントを示す。</div>${evidence}<div class="forge-card-name" style="margin:12px 0 7px;">🕯️ 長期Mystery</div><div style="display:grid;gap:7px;">${mysteryHtml}</div>${npcHtml?`<details class="forge-card" style="margin-top:9px;"><summary>🧳 旅人ネットワーク</summary><div style="display:grid;gap:7px;margin-top:8px;">${npcHtml}</div></details>`:''}</details>`;
  panel.querySelectorAll('.mystery-research').forEach(btn=>btn.addEventListener('click',()=>{const r=state.researchAdventure4Mystery?.(btn.dataset.mysteryId);if(r?.ok){panel.dataset.sig='';renderAdventure4InvestigationBoard();}}));
}
function install(){const content=document.getElementById('settlementResearchContent');if(!content)return;const observer=new MutationObserver(()=>queueMicrotask(renderAdventure4InvestigationBoard));observer.observe(content,{childList:true});queueMicrotask(renderAdventure4InvestigationBoard);}
install();
