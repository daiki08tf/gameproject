/* ============================================================
   Living World & Discovery C6-6 — Ranch collection UI
   ------------------------------------------------------------
   #companionContent's per-instance cards (renderCard() in
   monsterRanchUi.js, UNCHANGED beyond one new data-ranch-species
   attribute) stay flat direct children of the root --
   monsterRanchCompactUi.js's own tab/search/detail-collapse logic
   depends on that (:scope > .ranch-card). This file only inserts a
   species-summary header before each group of same-species cards
   and, when a species has more than one individual, collapses that
   group by default -- so opening the Ranch shows one line per
   species (owned count / grade / progress to next grade / habitat /
   role / traits / active-party status) instead of scrolling past
   every individual, per LIVING_WORLD_DISCOVERY_ROADMAP.md C6-6 --
   while every existing per-card action (favorite/slot/board/release,
   breeding, search, individual detail) keeps working exactly as it
   did before this file existed. No new save data, no new Home
   button, no new screen.

   DOM-safety (docs/MUTATION_OBSERVER_SAFETY.md): the observer below
   watches #companionContent with {childList:true} (no subtree), so
   it only reacts to renderMonsterRanch()'s own full innerHTML
   replace -- inserting a header the FIRST time for a species is the
   only real childList mutation this file performs, guarded by
   domSafety.js's ensureInserted(). Every other write
   (setHtmlIfChanged on the header's own innerHTML, card
   classList.toggle) mutates a child's own children/attributes, never
   root's own child list, so it cannot retrigger this observer even
   run unconditionally -- setHtmlIfChanged/classList.toggle(force) are
   self-guarding regardless (see domSafety.js's own header comment).
   ============================================================ */
import { state } from '../state.js';
import { getCompanionSpecies, companionTraitLabel } from '../data/companions.js';
import { ensureInserted, setHtmlIfChanged } from './domSafety.js';

function esc(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }

// Persists per-species collapse choice across renderMonsterRanch()'s full
// innerHTML replace (which happens on nearly every action -- favorite
// toggle, slot change, board purchase, release) so opening one species'
// individuals doesn't silently re-collapse on the player's very next click.
const expandedSpecies = new Set();

function groupBySpecies(root) {
  const groups = new Map();
  for (const card of root.querySelectorAll(':scope > .ranch-card')) {
    const speciesId = card.dataset.ranchSpecies;
    if (!speciesId) continue;
    if (!groups.has(speciesId)) groups.set(speciesId, []);
    groups.get(speciesId).push(card);
  }
  return groups;
}

function headerBodyHtml(speciesId, cards) {
  const species = getCompanionSpecies(speciesId);
  if (!species) return '';
  const grade = state.ranchSpeciesGrade?.(speciesId);
  const activeSlot = cards.some((c) => /編成\d/.test(c.querySelector('.forge-card-sub')?.textContent || ''));
  const traits = (species.traits || []).map(companionTraitLabel).join('・') || 'なし';
  const gradeText = grade ? `${esc(grade.label)}${grade.grade === 'mythic' ? ' ✦' : ''}${grade.nextLabel ? `（あと${grade.remaining}体で${esc(grade.nextLabel)}）` : '（最高グレード）'}${grade.traitMult > 1 ? ` / 特性威力 ×${grade.traitMult}` : ''}` : '';
  const isOpen = expandedSpecies.has(speciesId) || cards.length === 1;
  return `<div class="forge-card-top"><div class="forge-card-name">${esc(species.name)}${activeSlot ? ' <span class="hint">編成中</span>' : ''}</div><strong>${cards.length}体所有</strong></div>
    <div class="forge-card-sub">種族グレード: ${gradeText} / 生息地: ${esc(species.regionName || '不明')}${species.roleName ? ` / 役割: ${esc(species.roleName)}` : ''}</div>
    <div class="forge-card-sub">特性: ${esc(traits)}</div>
    ${cards.length > 1 ? `<button type="button" class="btn-sub ranch-species-toggle" data-species="${speciesId}">${isOpen ? '個体一覧を閉じる' : `個体一覧を開く（${cards.length}体）`}</button>` : ''}`;
}

function render() {
  const root = document.getElementById('companionContent');
  if (!root) return;
  const groups = groupBySpecies(root);
  if (!groups.size) return;

  for (const [speciesId, cards] of groups) {
    const selector = `:scope > [data-ranch-species-header="${speciesId}"]`;
    ensureInserted(
      () => !!root.querySelector(selector),
      () => {
        const header = document.createElement('div');
        header.className = 'forge-card ranch-species-header';
        header.dataset.ranchSpeciesHeader = speciesId;
        root.insertBefore(header, cards[0]);
      },
    );
    const header = root.querySelector(selector);
    // Only rebind the toggle listener when setHtmlIfChanged actually wrote
    // new innerHTML (a genuinely new button element) -- otherwise the old
    // button (with its listener already attached from a previous pass) is
    // untouched, and calling addEventListener again here would stack a
    // second listener on the same element every idempotent re-render.
    if (setHtmlIfChanged(header, headerBodyHtml(speciesId, cards))) {
      header.querySelector('.ranch-species-toggle')?.addEventListener('click', () => {
        if (expandedSpecies.has(speciesId)) expandedSpecies.delete(speciesId); else expandedSpecies.add(speciesId);
        render();
      });
    }
    const isOpen = expandedSpecies.has(speciesId) || cards.length === 1;
    for (const card of cards) card.classList.toggle('hidden', !isOpen);
  }

  // Drop headers for species with no cards left this render (e.g. the
  // last individual of that species was just released).
  root.querySelectorAll(':scope > .ranch-species-header').forEach((h) => {
    if (!groups.has(h.dataset.ranchSpeciesHeader)) h.remove();
  });
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('companionContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => { scheduled = false; render(); });
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
