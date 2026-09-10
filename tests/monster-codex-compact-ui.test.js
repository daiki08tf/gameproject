import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Monster Codex Navigation brush-up (user request 2026-09-09, follow-up to
// the Settlement compact UI): #monsterCodexContent is built by codexUi.js's
// own base renderer (a full innerHTML rewrite, not individually tagged)
// plus four add-on files each appending one top-level section. Same fix as
// Settlement: monsterCodexCompactUi.js retrofits the tabbed-navigation
// technique monsterRanchCompactUi.js/settlementCompactUi.js already proved
// out, without touching codexUi.js's own render function.

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

const src = read('js/patches/monsterCodexCompactUi.js');
const css = read('css/monsterCodexCompact.css');
const nav = read('js/patches/homeNavigation.js');

test('No platform emoji introduced by the Monster Codex Compact UI', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  assert.doesNotMatch(src, PICTOGRAPH);
  assert.doesNotMatch(css, PICTOGRAPH);
});

test('DOM-safety: the only childList mutation on the observed root (inserting the tab nav) is guarded by ensureInserted, matching docs/MUTATION_OBSERVER_SAFETY.md', () => {
  assert.match(src, /import\s*\{\s*ensureInserted\s*\}\s*from\s*'\.\/domSafety\.js'/);
  assert.match(src, /ensureInserted\(\s*\n?\s*\(\)\s*=>\s*!!root\.querySelector\('\.codex-compact-nav'\)/);
  assert.match(src, /root\.insertBefore\(nav, root\.firstChild\)/);
  // tagSections/applyTab only touch dataset/classList.toggle -- attribute
  // writes, not childList mutations -- so they cannot retrigger the
  // childList-only observer even though they run unconditionally every call.
  assert.match(src, /el\.dataset\.codexTabGroup\s*=\s*'base'/);
  assert.match(src, /classList\.toggle\('active', active\)/);
  assert.match(src, /observe\(root,\s*\{\s*childList:\s*true\s*\}\)/);
});

test('homeNavigation.js imports monsterCodexCompactUi.js after every settlement/fishing content-writing patch it bundles (contentPackIIE.js/systemDeepeningPackB.js decorate but don\'t need their own tab -- they render inside sections already claimed by another writer)', () => {
  const indexOf = (name) => nav.indexOf(`import './${name}';`);
  const compactIndex = indexOf('monsterCodexCompactUi.js');
  assert.ok(compactIndex > -1, 'homeNavigation.js must import monsterCodexCompactUi.js');
  // It only needs to run after the files it actually tags -- fishingCodexUi.js
  // and systemDeepeningPackC.js (which pulls in phase12FinaleRuntime.js).
  // enemy3CodexUi.js is not imported from homeNavigation.js at all (it comes
  // in via battle2RoadmapComplete.js, much earlier in main.js) so it isn't
  // part of this particular ordering check.
  for (const w of ['fishingCodexUi.js', 'archaeologyCodexUi.js', 'systemDeepeningPackC.js']) {
    const i = indexOf(w);
    assert.ok(i > -1, `homeNavigation.js must import ${w}`);
    assert.ok(compactIndex > i, `monsterCodexCompactUi.js must be imported after ${w}`);
  }
});

test('Every known add-on top-level marker (fish/archaeology/rumors/phase12/enemy3) is covered by SELECTOR_TAB, and codexUi.js\'s own unwrapped output falls back to the base tab', () => {
  const codexSrc = read('js/patches/codexUi.js');
  const fishingCodexSrc = read('js/patches/fishingCodexUi.js');
  const archaeologyCodexSrc = read('js/patches/archaeologyCodexUi.js');
  const packcSrc = read('js/patches/systemDeepeningPackC.js');
  const phase12Src = read('js/patches/phase12FinaleRuntime.js');
  const enemy3Src = read('js/patches/enemy3CodexUi.js');

  // Sanity: these are still the real markers the writer files render (guards
  // against this test silently passing after an unrelated rename there).
  assert.match(fishingCodexSrc, /dataset\.fishCodex\s*=\s*'1'/);
  assert.match(archaeologyCodexSrc, /dataset\.archaeologyCodex\s*=\s*'1'/);
  assert.match(packcSrc, /dataset\.packcRumors\s*=\s*'1'/);
  assert.match(phase12Src, /dataset\.phase12Codex\s*=\s*'1'/);
  assert.match(enemy3Src, /section\.id\s*=\s*'enemy3CodexAnalysis'/);
  // codexUi.js's own base renderer really is one flat innerHTML rewrite,
  // not individually tagged -- confirms the 'base' catch-all is load-bearing
  // rather than dead code.
  assert.match(codexSrc, /root\.innerHTML\s*=/);
  assert.doesNotMatch(codexSrc, /dataset\.codexTabGroup/);

  assert.match(src, /\['\[data-fish-codex\]', 'fish'\]/);
  assert.match(src, /\['\[data-archaeology-codex\]', 'rumors'\]/);
  assert.match(src, /\['\[data-packc-rumors\]', 'rumors'\]/);
  assert.match(src, /\['\[data-phase12-codex\]', 'tactics'\]/);
  assert.match(src, /\['#enemy3CodexAnalysis', 'tactics'\]/);
  // The catch-all itself.
  assert.match(src, /el\.dataset\.codexTabGroup = 'base'/);
});

test('Exactly 4 tabs, matching the CSS show-rules 1:1', () => {
  const tabIdsMatch = [...src.matchAll(/\['([a-z]+)', '[^']+'\]/g)].map((m) => m[1]).filter((id) => ['base', 'tactics', 'rumors', 'fish'].includes(id));
  assert.deepEqual(tabIdsMatch, ['base', 'tactics', 'rumors', 'fish']);
  for (const id of tabIdsMatch) {
    assert.match(css, new RegExp(`\\[data-codex-tab='${id}'\\] > \\[data-codex-tab-group='${id}'\\]\\{display:block\\}`));
  }
});

test('Introduces no new save root or calculation authority -- this is a pure DOM show/hide layer over existing rendered sections', () => {
  assert.doesNotMatch(src, /localStorage/);
  assert.doesNotMatch(src, /state\.data\./);
  assert.doesNotMatch(src, /state\.save\(\)/);
});
