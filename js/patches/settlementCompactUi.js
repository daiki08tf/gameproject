/* ============================================================
   Blade Vale — Settlement Compact UI
   ------------------------------------------------------------
   #settlementContent is built by 14 separate patch files, each
   idempotently appending its own top-level section in a fixed,
   permanent DOM order (see settlementUi4.js's own note on this).
   That stack grew into one long flat scroll -- reaching Fishing
   or the Tavern means scrolling past a dozen unrelated systems
   first. This patch changes no progression/save data and moves
   no state: it only tags the sections that already exist and
   toggles which are visible, the exact technique
   monsterRanchCompactUi.js already proved out for the Companion/
   Ranch screen (which had the identical problem).

   Every section already carries its own root-level data marker
   (data-settlement-era, data-settlement-tavern, data-fishing, ...),
   so grouping is a plain selector->tab map -- no textContent
   sniffing needed. The categories reuse settlementUi4.js's own
   established groupings (探索・秘密施設 / 防衛・季節・政策 /
   遠征・終端ネットワーク / 訓練・記録・首都) rather than inventing
   a new taxonomy, plus a 拠点 tab for the town/building overview
   and a くらし tab for Tavern/Fortune-telling/Fishing, which
   previously had no heading of their own at all.
   ============================================================ */

import { ensureInserted } from './domSafety.js';

const TABS = [
  ['base', '拠点'],
  ['life', 'くらし'],
  ['explore', '探索'],
  ['defense', '防衛'],
  ['expedition', '遠征'],
  ['record', '記録'],
];

// [selector, tabId] -- selector is matched against DIRECT children of
// #settlementContent only (:scope > ...), since every section is already
// a top-level child. Anything not listed here is left unmatched and stays
// visible on every tab (safe fallback for a future section this map
// hasn't been updated for yet, rather than it silently disappearing).
const SELECTOR_TAB = [
  ['[data-settlement-era]', 'base'],
  ['[data-settlement-area]', 'base'],
  ['[data-settlement-residents]', 'base'],
  ['[data-settlement-ranch3]', 'base'],
  ['[data-settlement-tavern]', 'life'],
  ['[data-settlement-fortune]', 'life'],
  ['[data-fishing]', 'life'],
  ['[data-settlement-exploration]', 'explore'],
  ['[data-settlement-secrets]', 'explore'],
  ['[data-settlement-ui4-heading="exploration"]', 'explore'],
  ['[data-settlement-defense]', 'defense'],
  ['[data-settlement-seasons]', 'defense'],
  ['[data-settlement-identity]', 'defense'],
  ['[data-settlement-ui4-heading="defense"]', 'defense'],
  ['[data-settlement-expeditions]', 'expedition'],
  ['[data-settlement-endgame-network]', 'expedition'],
  ['[data-settlement-ui4-heading="expeditions"]', 'expedition'],
  ['[data-settlement-arena]', 'record'],
  ['[data-settlement-chronicle]', 'record'],
  ['[data-settlement-capital]', 'record'],
  ['[data-settlement-ui4-heading="arena"]', 'record'],
];

let activeTab = 'base';
let compactScheduled = false;

function ensureStyles() {
  if (document.querySelector('link[data-settlement-compact-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/settlementCompact.css';
  link.dataset.settlementCompactStyle = 'true';
  document.head.appendChild(link);
}

function installTabs(root) {
  ensureInserted(
    () => !!root.querySelector('.settlement-compact-nav'),
    () => {
      const nav = document.createElement('div');
      nav.className = 'settlement-compact-nav';
      nav.setAttribute('role', 'tablist');
      for (const [id, label] of TABS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'settlement-compact-tab';
        button.dataset.settlementTab = id;
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
    root.querySelectorAll(`:scope > ${selector}`).forEach((el) => { el.dataset.settlementTabGroup = tabId; });
  }
}

function applyTab(root) {
  root.dataset.settlementTab = activeTab;
  root.querySelectorAll('.settlement-compact-tab').forEach((btn) => {
    const active = btn.dataset.settlementTab === activeTab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

function applyCompactSettlement() {
  compactScheduled = false;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  ensureStyles();
  root.dataset.settlementCompact = 'true';
  installTabs(root);
  tagSections(root);
  applyTab(root);
}

function scheduleCompactSettlement() {
  if (compactScheduled) return;
  compactScheduled = true;
  queueMicrotask(applyCompactSettlement);
}

// Registered after every settlementContent-writing patch (see this file's
// own import position in homeNavigation.js): on any mutation, this
// observer's callback runs last among the ones watching the same root, so
// its scheduled microtask is enqueued after every other section's own
// re-render microtask -- by the time applyCompactSettlement() actually
// runs, the full section stack (including a fresh renderSettlement()
// rebuild after a building upgrade) has already been rebuilt.
const root = document.getElementById('settlementContent');
if (root && typeof MutationObserver !== 'undefined') {
  new MutationObserver(scheduleCompactSettlement).observe(root, { childList: true });
}
scheduleCompactSettlement();

export { applyCompactSettlement, TABS };
