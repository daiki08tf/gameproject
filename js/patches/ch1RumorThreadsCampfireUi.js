/* ============================================================
   Living World & Discovery C2 — pre-Tavern Rumor entry point
   ------------------------------------------------------------
   The Tavern only opens at Settlement Hall Lv.5. Before that, the
   town's campfire is where the player first hears these Rumors.
   This adds one small card to the existing Settlement screen --
   no new screen, no new Home button. Once the Tavern unlocks, this
   card stops rendering and js/patches/settlementTavern.js's own
   Tavern rumor feed (already reading state.rumorNotebook()) takes
   over automatically, since both read the same world2.discoveries
   records.
   ============================================================ */
import { state } from '../state.js';
import './settlementTavern.js'; // guarantees state.settlementTavernUnlocked() exists
import './ch1RumorThreads.js'; // guarantees state.ch1RumorThreads() exists

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

function render() {
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-ch1-campfire]')) return;
  if (state.settlementTavernUnlocked?.()) return; // Tavern has taken over
  const threads = state.ch1RumorThreads?.() || [];
  const section = document.createElement('section');
  section.dataset.ch1Campfire = 'true';
  section.style.marginTop = '14px';
  const rows = threads.length
    ? threads.map((t) => `<div class="forge-card-sub" style="margin:6px 0;"><b>${escapeHtml(String(t.name || '').replace(/^噂：/, ''))}</b><br>${escapeHtml(t.hint || '')}</div>`).join('')
    : '<div class="forge-card-sub">まだ大きな話はないが、腰を落ち着けて話を聞くことはできる。</div>';
  section.innerHTML = `<details class="forge-card" open><summary>焚き火の噂話</summary><div class="forge-card-sub" style="margin:8px 0;">酒場が開くまでは、この焚き火で街の噂を耳にする。</div>${rows}</details>`;
  root.appendChild(section);
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!state.settlementTavernUnlocked?.() && !root.querySelector('[data-ch1-campfire]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
