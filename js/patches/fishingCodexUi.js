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

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-fish-codex]')) return;
  const fish = state.fishCodex?.() || [];
  const summary = state.fishCodexSummary?.() || { seen: 0, total: fish.length, mastersSeen: 0, mastersTotal: 0 };
  const box = document.createElement('section');
  box.dataset.fishCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">FISH ${summary.seen}/${summary.total}（ヌシ ${summary.mastersSeen}/${summary.mastersTotal}）</div><details class="ui-detail-disclosure" style="margin-top:6px;"><summary>釣果記録</summary><div class="ui-detail-body">${fish.map(fishRow).join('')}</div></details>`;
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
