/* ============================================================
   Living World & Discovery C3 — Fish Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   ============================================================ */
import { state } from '../state.js';
import './fishing.js'; // guarantees state.fishCodex()/fishCodexSummary() exist

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

function fishRow(f) {
  if (!f.seen) return `<div class="forge-card-sub" style="margin:4px 0;">${f.master ? 'ヌシ：' : ''}？？？</div>`;
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(f.name)}</b>${f.master ? '（ヌシ）' : ''} ×${f.caught}<br>${escapeHtml(f.flavor)}</div>`;
}

// Same "永続ボーナス" checklist convention as js/patches/codexUi.js's
// Monster Codex bonusRows() -- ✓/□ are plain box-drawing glyphs, not emoji.
function bonusRows(summary) {
  const pct = summary.seen && summary.total ? (summary.seen / summary.total) * 100 : 0;
  const speciesRows = [25, 50, 75, 100].map((need) => `<div class="forge-card" style="opacity:${pct >= need ? 1 : .55}"><b>${pct >= need ? '✓' : '□'} 種類 ${need}%</b><span class="sub"> 全基礎ステータス +0.5%</span></div>`).join('');
  const masterRows = Array.from({ length: summary.mastersTotal }, (_, i) => i + 1).map((n) => `<div class="forge-card" style="opacity:${summary.mastersSeen >= n ? 1 : .55}"><b>${summary.mastersSeen >= n ? '✓' : '□'} ヌシ ${n}体</b><span class="sub"> 全基礎ステータス +0.25%</span></div>`).join('');
  return speciesRows + masterRows;
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-fish-codex]')) return;
  const fish = state.fishCodex?.() || [];
  const summary = state.fishCodexSummary?.() || { seen: 0, total: fish.length, mastersSeen: 0, mastersTotal: 0 };
  const bonuses = state.fishCodexBonuses?.() || { allStatMult: 1 };
  const box = document.createElement('section');
  box.dataset.fishCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">FISH ${summary.seen}/${summary.total}（ヌシ ${summary.mastersSeen}/${summary.mastersTotal}）</div><div class="sub">現在の永続ボーナス：全基礎ステータス ×${bonuses.allStatMult.toFixed(4)}</div><details class="ui-detail-disclosure" style="margin-top:6px;" open><summary>永続ボーナス</summary><div class="ui-detail-body">${bonusRows(summary)}</div></details><details class="ui-detail-disclosure" style="margin-top:6px;"><summary>釣果記録</summary><div class="ui-detail-body">${fish.map(fishRow).join('')}</div></details>`;
  const heading = [...root.querySelectorAll('h3')].find((h) => h.textContent?.includes('魔物一覧')) || root.querySelector('h3');
  root.insertBefore(box, heading || root.firstChild?.nextSibling || null);
}

document.getElementById('goMonsterCodexBtn')?.addEventListener('click', () => queueMicrotask(render));
if (typeof MutationObserver !== 'undefined') {
  const root = document.getElementById('monsterCodexContent');
  if (root) new MutationObserver(() => { if (root.childElementCount && !root.querySelector('[data-fish-codex]')) queueMicrotask(render); }).observe(root, { childList: true });
}
render();
export { render as renderFishCodex };
