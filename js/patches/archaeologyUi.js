/* ============================================================
   Living World & Discovery C4 — Archaeology UI (Settlement screen)
   ------------------------------------------------------------
   Compact ACTIVE text interaction (丁寧に払う/掘り進める/崩れを
   支える), not an idle timer. Lives inside the existing Settlement
   screen -- no new screen, no new Home button. Follows the same
   idempotent-append pattern as fishingUi.js/settlementDefenseUi.js.
   ============================================================ */
import { state } from '../state.js';
import './archaeology.js'; // guarantees state.archaeologySites()/startExcavation()/excavationAction() exist
import { EXCAVATION_ACTIONS, EXCAVATION_ACTION_LABELS, EXCAVATION_CUE_GUIDE } from '../data/archaeology.js';

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function rewardText(gained = {}) { return Object.entries(gained).filter(([, v]) => v > 0).map(([k, v]) => `${k} +${v}`).join(' / '); }

// Plain-text (no icon) legend so a first-time player can learn the cue->
// action correspondence instead of guessing blind -- built straight from
// EXCAVATION_CUE_GUIDE so it can never disagree with the real round logic.
const CUE_LEGEND_HTML = EXCAVATION_CUE_GUIDE
  .map((g) => `「${escapeHtml(g.cueText)}」→ ${escapeHtml(g.label)}`)
  .join('　／　');

function siteCard(site) {
  if (!site.unlocked) {
    return `<div class="forge-card" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">???</div><strong>LOCKED</strong></div><div class="forge-card-sub">その地域の冒険を進めると、発掘地点が見つかる。</div></div>`;
  }
  const progress = `発掘記録 ${site.foundCount}/${site.totalCount}${site.recordUnlocked ? '（記録・復元済み）' : ''}`;
  return `<div class="forge-card" data-archaeology-site="${site.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${escapeHtml(site.name)}</div></div><div class="forge-card-sub">${escapeHtml(site.desc)}</div><div class="forge-card-sub" style="margin-top:4px;">${escapeHtml(progress)}</div><button class="forge-card-btn archaeology-start" data-site="${site.id}" style="margin-top:8px;">発掘する</button><div class="archaeology-session" data-archaeology-session-for="${site.id}"></div></div>`;
}

// lastHit: null before the first action of a dig, then true/false for
// whether the previous guess matched the cue -- shown as plain text (no
// icon glyphs) directly above the new cue, matching Fishing's convention.
function sessionHtml(state_, lastHit = null) {
  const dots = Array.from({ length: state_.roundsNeeded }, (_, i) => (i < state_.progress ? '●' : '○')).join(' ');
  const missDots = Array.from({ length: state_.maxMisses }, (_, i) => (i < state_.misses ? '×' : '・')).join(' ');
  const buttons = EXCAVATION_ACTIONS.map((a) => `<button class="forge-card-btn archaeology-action" data-action="${a}">${EXCAVATION_ACTION_LABELS[a]}</button>`).join(' ');
  const feedback = lastHit === null ? '' : `<div class="forge-card-sub" style="margin-top:6px;">${lastHit ? '見立てが当たった！' : '外れた…'}</div>`;
  return `${feedback}<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(state_.cueText)}</div><div class="forge-card-sub">手応え ${dots}（${state_.progress}/${state_.roundsNeeded}）　崩れ ${missDots}（${state_.misses}/${state_.maxMisses}）</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">${buttons}</div>`;
}

function recordHtml(record) {
  if (!record) return '';
  const reward = rewardText(record.gained);
  return `<div class="forge-card-sub" style="margin-top:8px;border-top:1px solid rgba(255,255,255,.12);padding-top:8px;"><b>記録が復元された：${escapeHtml(record.name)}</b><br>${escapeHtml(record.text)}${reward ? `<br>獲得: ${reward}` : ''}</div>`;
}

// C6-8: a companion reaction is flavor only -- a plain line, no icon, no
// separate badge, so it never reads as a mechanical bonus.
function reactionHtml(reaction) {
  if (!reaction) return '';
  return `<div class="forge-card-sub" style="margin-top:4px;">${escapeHtml(reaction.text)}</div>`;
}

function renderSession(container, siteId, session, onEnd, lastHit = null) {
  if (!session) { container.innerHTML = ''; return; }
  container.innerHTML = sessionHtml(session, lastHit);
  container.querySelectorAll('.archaeology-action').forEach((btn) => btn.addEventListener('click', () => {
    const result = state.excavationAction(btn.dataset.action);
    if (!result?.ok) return;
    if (result.outcome === 'ongoing') { renderSession(container, siteId, result, onEnd, result.hit); return; }
    onEnd?.();
    if (result.outcome === 'crumbled') {
      container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.fragment.name)}は崩れてしまった…（もう一度「発掘する」を押すと再挑戦できる）</div>`;
      return;
    }
    const reward = rewardText(result.gained);
    container.innerHTML = `<div class="forge-card-sub" style="margin-top:8px;">${escapeHtml(result.fragment.name)}を掘り出した！${result.first ? '（初めての記録）' : `（累計${result.count}個）`}${reward ? `<br>獲得: ${reward}` : ''}<br>（「発掘する」を押すと再挑戦できる）</div>${reactionHtml(result.companionReaction)}${recordHtml(result.record)}`;
  }));
}

// Only one dig can be in progress at a time (see state.startExcavation's
// busy guard). Disabling every site's start button while a dig is in
// flight keeps that rule visible instead of a click silently doing
// nothing or resetting whichever dig was already running.
function setAllStartButtonsDisabled(section, disabled) {
  section.querySelectorAll('.archaeology-start').forEach((btn) => {
    btn.disabled = disabled;
    btn.title = disabled ? '今は他の発掘地点で作業中。決着をつけると再開できる。' : '';
  });
}

function render() {
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-archaeology]')) return;
  const sites = state.archaeologySites?.() || [];
  const section = document.createElement('section');
  section.dataset.archaeology = 'true';
  section.style.marginTop = '14px';
  section.innerHTML = `<details class="forge-card" open><summary>発掘</summary><div class="forge-card-sub" style="margin:8px 0;">冒険で訪れた地域には、それぞれ埋もれた過去がある。掘り出した破片の手応えを読み、丁寧に払う／掘り進める／崩れを支える、のどれかで応える。破片を全て揃えると、その地の記録が一つ復元される。<br>合図の読み方：${CUE_LEGEND_HTML}</div><div style="display:grid;gap:8px;">${sites.map(siteCard).join('')}</div></details>`;
  root.appendChild(section);
  section.querySelectorAll('.archaeology-start').forEach((btn) => btn.addEventListener('click', () => {
    const siteId = btn.dataset.site;
    const result = state.startExcavation(siteId);
    if (!result?.ok) return;
    const container = section.querySelector(`[data-archaeology-session-for="${siteId}"]`);
    if (container) {
      setAllStartButtonsDisabled(section, true);
      renderSession(container, siteId, result, () => setAllStartButtonsDisabled(section, false));
    }
  }));
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!root.querySelector('[data-archaeology]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
