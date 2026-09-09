import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Settlement Navigation brush-up (user request 2026-09-09): #settlementContent
// was built by 14 separate patch files each permanently appending their own
// top-level section -- reaching Fishing or the Tavern meant scrolling past a
// dozen unrelated systems first. settlementCompactUi.js retrofits the same
// tabbed-navigation technique monsterRanchCompactUi.js already proved out for
// the Companion/Ranch screen (which had the identical problem), without
// touching any of the 14 files that actually render the content.

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

const src = read('js/patches/settlementCompactUi.js');
const css = read('css/settlementCompact.css');
const nav = read('js/patches/homeNavigation.js');

test('No platform emoji introduced by the Settlement Compact UI', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  assert.doesNotMatch(src, PICTOGRAPH);
  assert.doesNotMatch(css, PICTOGRAPH);
});

test('DOM-safety: the only childList mutation on the observed root (inserting the tab nav) is guarded by ensureInserted, matching docs/MUTATION_OBSERVER_SAFETY.md', () => {
  // This file installs its own MutationObserver({childList:true}) on
  // #settlementContent and, from that same callback chain, inserts a nav
  // bar into that root -- exactly the shape that caused real freeze/OOM
  // bugs elsewhere in this codebase (see the doc) when done unconditionally.
  assert.match(src, /import\s*\{\s*ensureInserted\s*\}\s*from\s*'\.\/domSafety\.js'/);
  assert.match(src, /ensureInserted\(\s*\n?\s*\(\)\s*=>\s*!!root\.querySelector\('\.settlement-compact-nav'\)/);
  assert.match(src, /root\.insertBefore\(nav, root\.firstChild\)/);
  // tagSections/applyTab only touch dataset/classList.toggle -- attribute
  // writes, not childList mutations -- so they cannot retrigger the
  // childList-only observer even though they run unconditionally every call.
  assert.match(src, /el\.dataset\.settlementTabGroup\s*=\s*tabId/);
  assert.match(src, /classList\.toggle\('active', active\)/);
  assert.match(src, /observe\(root,\s*\{\s*childList:\s*true\s*\}\)/);
});

test('homeNavigation.js imports settlementCompactUi.js after every settlementContent-writing patch, so its observer registers (and thus applies) last', () => {
  // The microtask-ordering guarantee this file's own comment relies on
  // (each settlementContent-writer's re-render microtask runs before
  // applyCompactSettlement()'s) only holds if this file's observer is
  // registered after theirs -- i.e. imported later in homeNavigation.js.
  const writers = [
    'settlementUi.js', 'settlementExplorationUi.js', 'settlementSecretsUi.js', 'settlementDefenseUi.js',
    'settlementSeasonsUi.js', 'settlementIdentityUi.js', 'settlementExpeditionsUi.js', 'settlementEndgameNetworkUi.js',
    'settlementArenaUi.js', 'settlementChronicleUi.js', 'settlementCapitalUi.js', 'settlementUi4.js',
    'settlementFortuneTellingUi.js', 'fishingUi.js', 'settlementRanch3Ui.js',
  ];
  const indexOf = (name) => nav.indexOf(`import './${name}';`);
  const compactIndex = indexOf('settlementCompactUi.js');
  assert.ok(compactIndex > -1, 'homeNavigation.js must import settlementCompactUi.js');
  for (const w of writers) {
    const i = indexOf(w);
    assert.ok(i > -1, `homeNavigation.js must import ${w}`);
    assert.ok(compactIndex > i, `settlementCompactUi.js must be imported after ${w}`);
  }
});

test('Every data-settlement-*/data-fishing root marker actually rendered by the 14 settlementContent-writing files is covered by SELECTOR_TAB (no silently-unreachable section)', () => {
  const writerFiles = [
    'settlementUi.js', 'settlementExplorationUi.js', 'settlementSecretsUi.js', 'settlementDefenseUi.js',
    'settlementSeasonsUi.js', 'settlementIdentityUi.js', 'settlementExpeditionsUi.js', 'settlementEndgameNetworkUi.js',
    'settlementArenaUi.js', 'settlementChronicleUi.js', 'settlementCapitalUi.js', 'settlementUi4.js',
    'settlementFortuneTellingUi.js', 'fishingUi.js', 'settlementRanch3Ui.js', 'ch1RumorThreadsCampfireUi.js',
  ];
  const markerPattern = /dataset\.(settlement[A-Za-z]+|fishing|ch1Campfire)\s*=\s*['"]true['"]|data-settlement-area=|data-fishing-session-for=/g;
  const found = new Set();
  for (const file of writerFiles) {
    const source = read(`js/patches/${file}`);
    for (const m of source.matchAll(/dataset\.(settlement[A-Za-z]+|fishing|ch1Campfire)\s*=\s*['"]true['"]/g)) found.add(m[1]);
    if (/data-settlement-area=/.test(source)) found.add('settlementArea');
  }
  // Sanity: the scan itself must have found a realistic number of markers
  // (guards against the regex silently matching nothing after a refactor).
  assert.ok(found.size >= 12, `expected at least 12 top-level settlement section markers, found ${found.size}: ${[...found]}`);

  // Every marker found must appear as a selector inside settlementCompactUi.js's SELECTOR_TAB.
  for (const camel of found) {
    if (camel === 'fishing') { assert.match(src, /\[data-fishing\]/, 'data-fishing must be in SELECTOR_TAB'); continue; }
    if (camel === 'ch1Campfire') { assert.match(src, /\[data-ch1-campfire\]/, 'data-ch1-campfire must be in SELECTOR_TAB'); continue; }
    const kebab = camel.replace(/^settlement/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    const attr = `data-settlement-${kebab}`;
    assert.match(src, new RegExp(`\\[${attr}\\]`), `${attr} (from ${camel}) must be in SELECTOR_TAB`);
  }
});

test('Exactly 6 tabs, matching the CSS show-rules 1:1', () => {
  const tabIdsMatch = [...src.matchAll(/\['([a-z]+)', '[^']+'\]/g)].map((m) => m[1]);
  assert.deepEqual(tabIdsMatch, ['base', 'life', 'explore', 'defense', 'expedition', 'record']);
  for (const id of tabIdsMatch) {
    assert.match(css, new RegExp(`\\[data-settlement-tab='${id}'\\] > \\[data-settlement-tab-group='${id}'\\]\\{display:block\\}`));
  }
});

test('Introduces no new save root or calculation authority -- this is a pure DOM show/hide layer over existing rendered sections', () => {
  assert.doesNotMatch(src, /localStorage/);
  assert.doesNotMatch(src, /state\.data\./);
  assert.doesNotMatch(src, /state\.save\(\)/);
});
