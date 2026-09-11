/* ============================================================
   Living World & Discovery C8-1 — Region Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   Aggregates existing Fishing/Archaeology/Treasure Hunt/fauna data
   per region -- see data/regionCodex.js for the full rationale.
   ============================================================ */
import { state } from '../state.js';
import './regionCodex.js'; // guarantees state.regionCodexList() exists
import './fieldKnowledge.js'; // guarantees state.rareEncounterFieldNote()/secretClueFieldNote() exist

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

// C8-2: boss/hidden-threat identity. A boss/threat not yet unlocked keeps
// its `name` withheld (null, set in data/regionCodex.js) -- shown as
// '???', matching chapterSelect.js's own convention, never spoiling story
// content ahead of the player's own progress.
function bossLine(bosses) {
  if (!bosses.length) return null;
  const cleared = bosses.filter((b) => b.cleared).length;
  const next = bosses.find((b) => !b.cleared);
  const nextText = next ? `　次: ${escapeHtml(next.name ?? '???')}` : '';
  return `主脅威 討伐 ${cleared}/${bosses.length}${nextText}`;
}
function hiddenThreatLine(hiddenThreats) {
  if (!hiddenThreats.length) return null;
  const cleared = hiddenThreats.filter((h) => h.cleared).length;
  return `隠し脅威 討伐 ${cleared}/${hiddenThreats.length}`;
}

function regionCard(bundle) {
  const { region, faunaSeen, faunaTotal, fishingSpot, fishSeen, fishTotal, archaeologySite, treasureHunts, bosses, hiddenThreats, rareSeen, rareTotal, runesOwned, runesTotal } = bundle;
  const lines = [];
  lines.push(`既知の生物 ${faunaSeen}/${faunaTotal}`);
  if (fishingSpot) lines.push(`釣果（${escapeHtml(fishingSpot.name)}） ${fishSeen}/${fishTotal}`);
  if (archaeologySite) lines.push(`発掘記録（${escapeHtml(archaeologySite.name)}） ${archaeologySite.foundCount}/${archaeologySite.totalCount}${archaeologySite.recordUnlocked ? '（記録復元済み）' : ''}`);
  const resolvedHunts = treasureHunts.filter((h) => h.stage === 'resolved').length;
  if (treasureHunts.length) lines.push(`宝探し ${resolvedHunts}/${treasureHunts.length}`);
  const boss = bossLine(bosses || []);
  if (boss) lines.push(boss);
  const hiddenThreat = hiddenThreatLine(hiddenThreats || []);
  if (hiddenThreat) lines.push(hiddenThreat);
  if (rareTotal) lines.push(`レア個体 遭遇 ${rareSeen}/${rareTotal}`);
  if (runesTotal) lines.push(`ルーン 入手 ${runesOwned}/${runesTotal}`);
  // C9-3: a field note (flavor only, never a gate) appended once at least
  // one of this region's rare types has actually been encountered AND the
  // player has genuinely fought through roughly half the region's native
  // creatures -- see data/fieldKnowledge.js. Rare encounters have no
  // per-item text of their own (unlike a Record/chain/ヌシ), so the note
  // is appended after the whole region line instead of one item's text.
  const rareNote = rareTotal && rareSeen > 0 ? state.rareEncounterFieldNote?.(region.id) : null;
  // C9-4: mirrors rareNote exactly, for the region's own 隠し脅威 line --
  // appended once at least one hidden threat has actually had its chapter
  // unlocked (name revealed, never before) AND field knowledge is ready.
  // See data/fieldKnowledge.js's SECRET_CLUE_FIELD_NOTES comment.
  const secretNote = (hiddenThreats || []).some((h) => h.name) ? state.secretClueFieldNote?.(region.id) : null;
  const notes = [rareNote, secretNote].filter(Boolean).map((n) => `<br><span class="hint">${escapeHtml(n)}</span>`).join('');
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(region.name)}</b>　${escapeHtml(region.subtitle)}<br>${lines.join('　/　')}${notes}</div>`;
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-region-codex]')) return;
  const bundles = state.regionCodexList?.() || [];
  if (!bundles.length) return;
  const box = document.createElement('section');
  box.dataset.regionCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">地域の記録</div><div class="sub">生物・釣果・発掘・宝探し・主脅威・レア個体・ルーン ―― この地で分かっていることを、地域ごとにまとめて確認できる。</div>${bundles.map(regionCard).join('')}`;
  const heading = [...root.querySelectorAll('h3')].find((h) => h.textContent?.includes('魔物一覧')) || root.querySelector('h3');
  root.insertBefore(box, heading || root.firstChild?.nextSibling || null);
}

// Same "safe direct listener" reasoning as archaeologyCodexUi.js -- this
// file is only ever imported from within homeNavigation.js's own import
// list, after codexUi.js has already created #goMonsterCodexBtn/
// #monsterCodexContent synchronously.
document.getElementById('goMonsterCodexBtn')?.addEventListener('click', () => queueMicrotask(render));
if (typeof MutationObserver !== 'undefined') {
  const root = document.getElementById('monsterCodexContent');
  if (root) new MutationObserver(() => { if (root.childElementCount && !root.querySelector('[data-region-codex]')) queueMicrotask(render); }).observe(root, { childList: true });
}
render();
export { render as renderRegionCodex };
