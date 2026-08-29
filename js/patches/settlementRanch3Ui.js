/* Settlement 3.0 S8 — compact Ranch 3.0 integration panel. */
import './settlementRanch3.js';
import { state } from '../state.js';

function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function pct(v){return Number.isFinite(Number(v))?`${Math.round(Number(v)*100)}%`:'-';}
function talentLine(r){const t=r.talent||{};return `HP ${pct(t.hp)} / MP ${pct(t.mp)} / ATK ${pct(t.atk)} / DEF ${pct(t.def)} / MAG ${pct(t.mag)} / SPD ${pct(t.spd)}`;}
function facilityLine(summary){const map=summary.facilities||{};return (state.ranchFacilities||[]).map(f=>`${f.name} Lv.${map[f.id]||0}`).join(' / ');}
function rosterCard(r){const traits=r.traits.length?r.traits.join('・'):'なし',mutation=r.mutation?`✨ ${r.mutation.name}`:'未変異';return `<div class="forge-card" data-ranch3-individual="${esc(r.id)}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${r.favorite?'★ ':'🐾 '}${esc(r.name)}</div><strong>Lv.${r.level} / 第${r.generation}世代</strong></div><div class="forge-card-sub">${esc(r.species)} / ${esc(r.rarity)} / Nature: ${esc(r.natureName)} → AI【${esc(r.aiLabel)}】</div><div class="forge-card-sub" style="margin-top:5px;">育成方針：${esc(r.trainingLabel)} / Trait：${esc(traits)} / ${esc(mutation)}</div><details style="margin-top:5px;"><summary class="forge-card-sub">Talentを見る</summary><div class="forge-card-sub" style="margin-top:5px;">${talentLine(r)}</div></details></div>`;}

export function renderSettlementRanch3(){
  const root=document.getElementById('settlementContent');if(!root||root.querySelector('[data-settlement-ranch3]'))return;
  const summary=state.settlementRanch3Summary?.();if(!summary)return;
  const section=document.createElement('section');section.dataset.settlementRanch3='true';section.className='settlement-ranch3';section.style.marginTop='14px';
  if(!summary.unlocked){section.innerHTML='<div class="forge-card"><div class="forge-card-top"><div class="forge-card-name">🐾 Monster Ranch 3.0</div><strong>LOCKED</strong></div><div class="forge-card-sub">牧舎Lv.1で、既存Monster RanchとSettlementの統合状況を確認できる。</div></div>';root.appendChild(section);return;}
  const roster=state.settlementRanch3Roster?.()||[];
  const caps=summary.capabilities.map(c=>`<span style="display:inline-block;margin:2px;padding:4px 7px;border:1px solid rgba(255,255,255,.18);border-radius:999px;opacity:${c.unlocked?1:.48};">${c.icon} ${esc(c.name)} ${c.unlocked?'✓':'LOCK'}</span>`).join('');
  const policyHint=summary.policyFavored?'<div class="forge-card-sub" style="margin-top:6px;">現在の都市方針（魔物共生）により、牧舎・仲間化・魔物交流系の候補が優先的に扱われている。</div>':'';
  section.innerHTML=`<div class="forge-card"><div class="forge-card-top"><div class="forge-card-name">🐾 Monster Ranch 3.0 / 牧舎統合</div><strong>${summary.count}/${summary.capacity}体</strong></div><div class="forge-card-sub">牧舎 Lv.${summary.ranchLevel} / 卵 ${summary.eggs}個</div><div class="forge-card-sub" style="margin-top:6px;">${esc(facilityLine(summary))}</div><div style="margin-top:8px;">${caps}</div>${policyHint}<div class="forge-card-sub" style="margin-top:8px;line-height:1.6;">個体・Trait・Talent・配合・変異の正本は既存Monster Ranch / Companion。Settlementは重複システムを作らず、現在の育成状況と解禁機能を束ねるハブとして扱う。Companion AIは個体Natureの既存方針をそのまま表示する。</div><button class="forge-card-btn" data-ranch3-open style="margin-top:9px;">Monster Ranchを開く</button></div><details class="forge-card" style="margin-top:8px;"><summary>🐾 個体管理 ${roster.length}体</summary><div style="margin-top:8px;display:grid;gap:8px;">${roster.map(rosterCard).join('')||'<div class="forge-card-sub">まだ仲間の魔物はいない。</div>'}</div></details>`;
  root.appendChild(section);
  section.querySelector('[data-ranch3-open]')?.addEventListener('click',()=>document.getElementById('goCompanionBtn')?.click());
}

function install(){const root=document.getElementById('settlementContent');if(!root)return;const observer=new MutationObserver(()=>{if(!root.querySelector('[data-settlement-ranch3]'))queueMicrotask(renderSettlementRanch3);});observer.observe(root,{childList:true});queueMicrotask(renderSettlementRanch3);}
install();
