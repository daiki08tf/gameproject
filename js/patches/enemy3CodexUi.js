/* Enemy 3.0 B8 — supplemental tactical analysis inside the existing Monster Codex. */
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { isEnemy2GeneratedMaterializationId } from '../data/enemyCodex2Discovery.js';

function escapeHtml(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function row(label,values,unknown='？？？'){const list=(values||[]).filter(Boolean);return `<b>${label}：</b>${list.length?list.map(escapeHtml).join(' / '):unknown}`;}
export function renderEnemy3CodexAnalysis(){
  const root=document.getElementById('monsterCodexContent');if(!root)return;
  root.querySelector('#enemy3CodexAnalysis')?.remove();
  const entries=state.data.monsterCodex||{};
  const ids=Object.keys(ENEMY_TYPES).filter(id=>!id.startsWith('__')&&!isEnemy2GeneratedMaterializationId(id)&&entries[id]?.seen);
  const cards=[];
  for(const id of ids){const e=entries[id]||{};const affixes=Array.isArray(e.observedEliteAffixes)?e.observedEliteAffixes:[];const rares=Array.isArray(e.observedRareBehaviors)?e.observedRareBehaviors:[];const bossKnown=!!e.bossPhaseKnown||!!e.bossPhase2Observed;if(!affixes.length&&!rares.length&&!bossKnown)continue;const lines=[];if(affixes.length)lines.push(row('Elite Affix',affixes));if(rares.length)lines.push(row('Rare Behavior',rares));if(bossKnown)lines.push(`<b>Boss Phase：</b>${e.bossPhaseKnown?'解析済み':'Phase 2 観測済み'}`);cards.push(`<div class="forge-card"><div class="forge-card-name">${escapeHtml(e.name||ENEMY_TYPES[id]?.name||id)}</div><div style="font-size:12px;margin-top:8px;line-height:1.8">${lines.join('<br>')}</div><div class="hint" style="margin-top:4px">${e.analyzed?'完全解析済み':'戦闘観測で情報を蓄積・解析で補完'}</div></div>`);}
  const section=document.createElement('div');section.id='enemy3CodexAnalysis';section.innerHTML=`<h3>Enemy 3.0 戦術解析</h3><div class="hint" style="margin-bottom:8px">Elite Affix / Rare Behavior / Boss Phaseを実戦観測。図鑑完成度には追加加点しない。</div>${cards.length?cards.join(''):'<div class="hint">Enemy 3.0の特殊行動を観測すると、ここに戦術記録が蓄積される。</div>'}`;root.appendChild(section);
}

// Bug found auditing Monster Codex structure for the compact-UI retrofit:
// this file is imported (via battle2RoadmapComplete.js -> enemy3Targeting.js)
// BEFORE codexUi.js, which is the file that actually creates #goMonsterCodexBtn
// (ensureUi() in codexUi.js). document.getElementById('goMonsterCodexBtn')
// at this file's own load time therefore returned null every single time --
// the click listener was never attached at all, and the Enemy 3.0 tactical
// analysis section had never once been visible to a player.
// Delegating to a click listener on `document` (which always exists) sidesteps
// the "does the button exist yet" ordering problem entirely -- it matches
// on the click target at CLICK time, long after codexUi.js has created the
// button. It also solves the second-order hazard for free: a delegated
// listener on an ancestor fires during the bubble phase, strictly after
// every listener attached directly to the button itself (codexUi.js's own
// listener, which does root.innerHTML=... as a full rewrite) has already run
// -- so this never risks being wiped by that rewrite the way a
// directly-attached listener registered before codexUi.js's would.
document.addEventListener('click',(event)=>{
  if(event.target?.closest?.('#goMonsterCodexBtn'))renderEnemy3CodexAnalysis();
});
