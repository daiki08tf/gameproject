/* ============================================================
   Living World & Discovery C3 — Fishing UI (Settlement screen)
   ------------------------------------------------------------
   Compact ACTIVE text interaction (合わせる/待つ/糸を緩める), not an
   idle timer. Lives inside the existing Settlement screen -- no new
   screen, no new Home button. Follows the same idempotent-append
   pattern as settlementFortuneTellingUi.js/settlementDefenseUi.js.
   ============================================================ */
import { state } from '../state.js';
import './fishing.js'; // guarantees state.fishingSpots()/startFishing()/fishingAction() exist
import { FISHING_ACTIONS, FISHING_ACTION_LABELS } from '../data/fishing.js';

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function rewardText(gained = {}) { return Object.entries(gained).filter(([, v]) => v > 0).map(([k, v]) => `${k} +${v}`).join(' / '); }

function spotCard(spot) {
  if (!spot.unlocked) {
    return `<div class="forge-card" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">???</div><strong>LOCKED</strong></div><div class="forge-card-sub">その地域の冒険を進めると、釣り場が見つかる。</div></div>`;
  }
  return `<div class="forge-card" data-fishing-spot="${spot.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${escapeHtml(spot.name)}</div></div><div class="forge-card-sub">${escapeHtml(spot.desc)}</div><button class="forge-card-btn fishing-start" data-spot="${spot.id}" style="margin-top:8px;">糸を垂らす</button><div class="fishing-session" data-fishing-session-for="${spot.id}"></div></div>`;
}

function sessionHtml(state_) {
  const dots = Array.from({ length: state_.roundsNeeded }, (_, i) => (i < state_.progress ? '●' : '○')).join(' ');
  const missDots = Array.from({ length: state_.maxMisses }, (_, i) => (i < state_.misses ? '×' : '・')).join(' ');
  const buttons = FISHING_ACTIONS.map((a) => `<button class="forge-card-btn fishing-action" data-action="${a}">${FISHING_ACTION_LABELS[a]}</button>`).join(' ');
  return `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(state_.cueText)}</div><div class="forge-card-sub">手応え ${dots}　油断 ${missDots}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${buttons}</div>`;
}

function renderSession(container, spotId, session) {
  if (!session) { container.innerHTML = ''; return; }
  container.innerHTML = sessionHtml(session);
  container.querySelectorAll('.fishing-action').forEach((btn) => btn.addEventListener('click', () => {
    const result = state.fishingAction(btn.dataset.action);
    if (!result?.ok) return;
    if (result.outcome === 'ongoing') { renderSession(container, spotId, result); return; }
    if (result.outcome === 'escaped') { container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.fish.name)}に逃げられた。</div>`; return; }
    const reward = rewardText(result.gained);
    container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.fish.name)}を釣り上げた！${result.first ? '（初めての記録）' : `（累計${result.caught}匹）`}${reward ? `<br>獲得: ${reward}` : ''}</div>`;
  }));
}

function render() {
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-fishing]')) return;
  const spots = state.fishingSpots?.() || [];
  const section = document.createElement('section');
  section.dataset.fishing = 'true';
  section.style.marginTop = '14px';
  section.innerHTML = `<details class="forge-card" open><summary>釣り</summary><div class="forge-card-sub" style="margin:8px 0;">冒険で訪れた地域には、それぞれ違う魚がいる。糸を垂らして手応えを読み、合わせる／待つ／糸を緩める、のどれかで応える。</div><div style="display:grid;gap:8px;">${spots.map(spotCard).join('')}</div></details>`;
  root.appendChild(section);
  section.querySelectorAll('.fishing-start').forEach((btn) => btn.addEventListener('click', () => {
    const spotId = btn.dataset.spot;
    const result = state.startFishing(spotId);
    if (!result?.ok) return;
    const container = section.querySelector(`[data-fishing-session-for="${spotId}"]`);
    if (container) renderSession(container, spotId, result);
  }));
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!root.querySelector('[data-fishing]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
