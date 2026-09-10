/* ============================================================
   Blade Vale — Monster Codex Compact UI
   ------------------------------------------------------------
   #monsterCodexContent is built by codexUi.js's own base renderer
   (a full innerHTML rewrite -- completion/bonuses/ecology/monster
   list, all as one flat run of siblings, not individually tagged)
   plus five add-on files that each append one further top-level
   section: fishingCodexUi.js ([data-fish-codex]),
   archaeologyCodexUi.js ([data-archaeology-codex]),
   systemDeepeningPackC.js's rumor notebook ([data-packc-rumors]),
   enemy3CodexUi.js's tactical analysis (#enemy3CodexAnalysis) and
   phase12FinaleRuntime.js's horizontal ecology summary
   ([data-phase12-codex]). Same problem as Settlement, same fix:
   the same tabbed-navigation technique monsterRanchCompactUi.js
   and settlementCompactUi.js already proved out, without touching
   any of the files that actually render content.

   Unlike Settlement, codexUi.js's own output isn't already wrapped
   in named sections -- rather than touch that render function just
   to add wrapper tags, everything NOT claimed by one of the five
   known add-on selectors is tagged into the 図鑑 (base) tab as a
   catch-all. That keeps this file a zero-touch overlay, matching
   settlementCompactUi.js's own scope discipline.
   ============================================================ */

import { ensureInserted } from './domSafety.js';

const TABS = [
  ['base', '図鑑'],
  ['tactics', '戦術解析'],
  ['rumors', '噂帳'],
  ['fish', '釣果'],
];

// Known add-on selectors, matched against DIRECT children of
// #monsterCodexContent. Anything left over after these (codexUi.js's own
// unwrapped completion/bonus/ecology/monster-list output) falls into the
// 'base' catch-all in tagSections() below, rather than requiring codexUi.js
// to wrap its own output in named sections.
const SELECTOR_TAB = [
  ['#enemy3CodexAnalysis', 'tactics'],
  ['[data-phase12-codex]', 'tactics'],
  ['[data-packc-rumors]', 'rumors'],
  ['[data-archaeology-codex]', 'rumors'],
  ['[data-fish-codex]', 'fish'],
];

let activeTab = 'base';
let compactScheduled = false;

function ensureStyles() {
  if (document.querySelector('link[data-codex-compact-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/monsterCodexCompact.css';
  link.dataset.codexCompactStyle = 'true';
  document.head.appendChild(link);
}

function installTabs(root) {
  ensureInserted(
    () => !!root.querySelector('.codex-compact-nav'),
    () => {
      const nav = document.createElement('div');
      nav.className = 'codex-compact-nav';
      nav.setAttribute('role', 'tablist');
      for (const [id, label] of TABS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'codex-compact-tab';
        button.dataset.codexTab = id;
        button.textContent = label;
        button.setAttribute('role', 'tab');
        button.addEventListener('click', () => { activeTab = id; applyTab(root); });
        nav.appendChild(button);
      }
      root.insertBefore(nav, root.firstChild);
    },
  );
}

function tagSections(root) {
  for (const [selector, tabId] of SELECTOR_TAB) {
    root.querySelectorAll(`:scope > ${selector}`).forEach((el) => { el.dataset.codexTabGroup = tabId; });
  }
  // Catch-all: codexUi.js's own flat output, and anything else not claimed
  // by a known add-on above -- excluding the nav bar this file itself owns.
  [...root.children].forEach((el) => {
    if (el.dataset.codexTabGroup || el.classList.contains('codex-compact-nav')) return;
    el.dataset.codexTabGroup = 'base';
  });
}

function applyTab(root) {
  root.dataset.codexTab = activeTab;
  root.querySelectorAll('.codex-compact-tab').forEach((btn) => {
    const active = btn.dataset.codexTab === activeTab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

function applyCompactCodex() {
  compactScheduled = false;
  const root = document.getElementById('monsterCodexContent');
  if (!root) return;
  ensureStyles();
  root.dataset.codexCompact = 'true';
  installTabs(root);
  tagSections(root);
  applyTab(root);
}

function scheduleCompactCodex() {
  if (compactScheduled) return;
  compactScheduled = true;
  queueMicrotask(applyCompactCodex);
}

// Registered after every monsterCodexContent-writing patch (see this file's
// own import position in homeNavigation.js, at the very end of its import
// list): on any mutation, this observer's callback runs last among the ones
// watching the same root, so its scheduled microtask is enqueued after
// every other section's own re-render microtask -- by the time
// applyCompactCodex() actually runs, the full section stack (including a
// fresh codexUi.js rebuild on every screen visit) has already been rebuilt.
const root = document.getElementById('monsterCodexContent');
if (root && typeof MutationObserver !== 'undefined') {
  new MutationObserver(scheduleCompactCodex).observe(root, { childList: true });
}
scheduleCompactCodex();

export { applyCompactCodex, TABS };
