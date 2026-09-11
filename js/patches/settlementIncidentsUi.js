/* ============================================================
   Living World & Discovery C7-1 — Settlement Incidents UI
   ------------------------------------------------------------
   Reuses the exact excavation-session UI shape archaeologyUi.js
   already established (cue legend, hit/miss dots, action buttons) --
   the investigation IS Archaeology's minigame, just against a single
   incident-local fragment instead of a site's pool. Lives inside the
   existing Settlement screen -- no new screen, no new Home button.

   DOM safety: render() only INSERTS the section when it is missing
   (same guard shape as archaeologyUi.js's own render()) -- it never
   removes/rebuilds an existing section, so the {childList:true}
   observer below can never retrigger itself. An action's outcome is
   written only into that incident's own small session container
   (never the whole section), matching archaeologyUi.js exactly; the
   card's own "発生中"/"解決済み" status text goes stale until the
   next natural full re-render (leaving/reentering the Settlement
   screen), same tradeoff archaeologyUi.js already makes for its
   per-site progress line.
   ============================================================ */
import { state } from '../state.js';
import './settlementIncidents.js'; // guarantees state.settlementIncidents()/startSettlementIncidentInvestigation()/settlementIncidentAction() exist
import { EXCAVATION_ACTIONS, EXCAVATION_ACTION_LABELS, EXCAVATION_CUE_GUIDE } from '../data/archaeology.js';

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function rewardText(gained = {}) { return Object.entries(gained).filter(([, v]) => v > 0).map(([k, v]) => `${k} +${v}`).join(' / '); }

const CUE_LEGEND_HTML = EXCAVATION_CUE_GUIDE
  .map((g) => `「${escapeHtml(g.cueText)}」→ ${escapeHtml(g.label)}`)
  .join('　／　');

function incidentCard(incident) {
  if (!incident.eligible) {
    return `<div class="forge-card" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">???</div><strong>未発生</strong></div><div class="forge-card-sub">拠点がもう少し発展すると、何かが起こるかもしれない。</div></div>`;
  }
  const status = incident.resolved ? '解決済み' : '発生中';
  return `<div class="forge-card" data-settlement-incident="${incident.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${escapeHtml(incident.name)}</div><strong>${status}</strong></div><div class="forge-card-sub">${escapeHtml(incident.resolved ? incident.record.text : incident.desc)}</div>${incident.resolved ? '' : `<button class="forge-card-btn settlement-incident-start" data-incident="${incident.id}" style="margin-top:8px;">調査する</button>`}<div class="settlement-incident-session" data-settlement-incident-session-for="${incident.id}"></div></div>`;
}

function sessionHtml(session) {
  const dots = Array.from({ length: session.roundsNeeded }, (_, i) => (i < session.progress ? '●' : '○')).join(' ');
  const missDots = Array.from({ length: session.maxMisses }, (_, i) => (i < session.misses ? '×' : '・')).join(' ');
  const buttons = EXCAVATION_ACTIONS.map((a) => `<button class="forge-card-btn settlement-incident-action" data-action="${a}">${EXCAVATION_ACTION_LABELS[a]}</button>`).join(' ');
  return `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(session.cueText)}</div><div class="forge-card-sub">手応え ${dots}（${session.progress}/${session.roundsNeeded}）　崩れ ${missDots}（${session.misses}/${session.maxMisses}）</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${buttons}</div>`;
}

function renderSession(container, session, onEnd) {
  if (!session) { container.innerHTML = ''; return; }
  container.innerHTML = sessionHtml(session);
  container.querySelectorAll('.settlement-incident-action').forEach((btn) => btn.addEventListener('click', () => {
    const result = state.settlementIncidentAction(btn.dataset.action);
    if (!result?.ok) return;
    if (result.outcome === 'ongoing') { renderSession(container, result); return; }
    onEnd?.();
    if (result.outcome === 'crumbled') {
      container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.fragment.name)}は崩れてしまった…（もう一度「調査する」を押すと再挑戦できる）</div>`;
      return;
    }
    const reward = rewardText(result.gained);
    const recordReward = rewardText(result.recordGained);
    container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.incident.fragment.name)}を掘り出した！${reward ? `<br>獲得: ${reward}` : ''}</div><div class="forge-card-sub" style="margin-top:8px;border-top:1px solid rgba(255,255,255,.12);padding-top:8px;"><b>${escapeHtml(result.record.name)}</b><br>${escapeHtml(result.record.text)}${recordReward ? `<br>獲得: ${recordReward}` : ''}</div>`;
  }));
}

function setAllStartButtonsDisabled(section, disabled) {
  section.querySelectorAll('.settlement-incident-start').forEach((btn) => {
    btn.disabled = disabled;
    btn.title = disabled ? '今は他の出来事を調査中。決着をつけると再開できる。' : '';
  });
}

function render() {
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-settlement-incidents]')) return;
  const incidents = state.settlementIncidents?.() || [];
  const section = document.createElement('section');
  section.dataset.settlementIncidents = 'true';
  section.style.marginTop = '14px';
  section.innerHTML = `<details class="forge-card" open><summary>出来事</summary><div class="forge-card-sub" style="margin:8px 0;">拠点の外で、時おり何かが起きている。噂帳にも記録されるが、実際に何が起きたのかは調査してみないと分からない。<br>合図の読み方：${CUE_LEGEND_HTML}</div><div style="display:grid;gap:8px;">${incidents.map(incidentCard).join('')}</div></details>`;
  root.appendChild(section);
  section.querySelectorAll('.settlement-incident-start').forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.incident;
    const result = state.startSettlementIncidentInvestigation(id);
    if (!result?.ok) return;
    const container = section.querySelector(`[data-settlement-incident-session-for="${id}"]`);
    if (container) {
      setAllStartButtonsDisabled(section, true);
      renderSession(container, result, () => setAllStartButtonsDisabled(section, false));
    }
  }));
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!root.querySelector('[data-settlement-incidents]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
