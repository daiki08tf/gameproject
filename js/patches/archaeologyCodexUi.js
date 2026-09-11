/* ============================================================
   Living World & Discovery C4 — Archaeology Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   ============================================================ */
import { state } from '../state.js';
import './archaeology.js'; // guarantees state.archaeologyCodex()/archaeologyRecords()/archaeologySummary() exist
import './fieldKnowledge.js'; // guarantees state.archaeologyFieldNote() exists

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

function fragmentRow(f) {
  if (!f.seen) return `<div class="forge-card-sub" style="margin:4px 0;">？？？</div>`;
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(f.name)}</b>　×${f.count}<br>${escapeHtml(f.flavor)}</div>`;
}
function recordRow(r) {
  if (!r.unlocked) return `<div class="forge-card-sub" style="margin:4px 0;">？？？（未復元）</div>`;
  // C9-1: a field note (flavor only, never a gate) appended once the
  // player has genuinely fought through roughly half this record's
  // region's own native creatures -- see data/fieldKnowledge.js.
  const fieldNote = state.archaeologyFieldNote?.(r.id);
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(r.name)}</b><br>${escapeHtml(r.text)}${fieldNote ? `<br><span class="hint">${escapeHtml(fieldNote)}</span>` : ''}</div>`;
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-archaeology-codex]')) return;
  const fragments = state.archaeologyCodex?.() || [];
  const records = state.archaeologyRecords?.() || [];
  const summary = state.archaeologySummary?.() || { found: 0, total: fragments.length, recordsUnlocked: 0, recordsTotal: records.length };
  const box = document.createElement('section');
  box.dataset.archaeologyCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">発掘記録 ${summary.found}/${summary.total}（復元済み記録 ${summary.recordsUnlocked}/${summary.recordsTotal}）</div><div class="sub">埋もれた破片を掘り出し、揃えると一つの記録が復元される。</div><details class="ui-detail-disclosure" style="margin-top:6px;" open><summary>復元された記録</summary><div class="ui-detail-body">${records.map(recordRow).join('')}</div></details><details class="ui-detail-disclosure" style="margin-top:6px;"><summary>発掘した破片</summary><div class="ui-detail-body">${fragments.map(fragmentRow).join('')}</div></details>`;
  const heading = [...root.querySelectorAll('h3')].find((h) => h.textContent?.includes('魔物一覧')) || root.querySelector('h3');
  root.insertBefore(box, heading || root.firstChild?.nextSibling || null);
}

// #goMonsterCodexBtn/#monsterCodexContent already exist by the time this
// module runs: codexUi.js (which creates both synchronously at its own
// module top-level) is imported directly from main.js BEFORE
// homeNavigation.js, and this file is only ever imported from within
// homeNavigation.js's own import list -- unlike enemy3CodexUi.js (imported
// much earlier, before codexUi.js runs), a direct getElementById listener
// here is safe. See fishingCodexUi.js for the identical, already-proven
// pattern.
document.getElementById('goMonsterCodexBtn')?.addEventListener('click', () => queueMicrotask(render));
if (typeof MutationObserver !== 'undefined') {
  const root = document.getElementById('monsterCodexContent');
  if (root) new MutationObserver(() => { if (root.childElementCount && !root.querySelector('[data-archaeology-codex]')) queueMicrotask(render); }).observe(root, { childList: true });
}
render();
export { render as renderArchaeologyCodex };
