import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const FILES = [
  'settlementArenaUi.js',
  'settlementCapitalUi.js',
  'settlementChronicleUi.js',
  'settlementDefenseUi.js',
  'settlementEndgameNetworkUi.js',
  'settlementExpeditionsUi.js',
  'settlementExplorationUi.js',
  'settlementIdentityUi.js',
  'settlementMarketUi.js',
  'settlementProductionUi.js',
  'settlementRanch3Ui.js',
  'settlementResearchUi.js',
  'settlementSeasonsUi.js',
  'settlementSecretsUi.js',
  'settlementUi.js',
  'settlementUi4.js',
  'adventureWorld4InvestigationUi.js',
];

const sources = Object.fromEntries(
  FILES.map((name) => [name, readFileSync(new URL(`../js/patches/${name}`, import.meta.url), 'utf8')])
);

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-6 batch 3 removes rendered-UI emoji from every Settlement facility panel', () => {
  for (const [name, source] of Object.entries(sources)) {
    assert.doesNotMatch(source, PICTOGRAPH, `js/patches/${name} must not render platform emoji`);
  }
});

test('UIX-6 batch 3 stops rendering data-object icon fields (era/area/role/rumor/facility) without touching the canonical data', () => {
  // Point-of-render fix, same policy as batches 1-2: these are presentation
  // metadata on canonical Settlement data objects (category 2 per the
  // UIX-0 migration decision framework) — the data files themselves
  // (js/data/settlement*.js) are untouched.
  for (const field of ['era.icon', 'nextEra.icon', 'area.icon', 'role?.icon', 'r.icon']) {
    assert.doesNotMatch(sources['settlementUi.js'], new RegExp(field.replace(/[.?]/g, '\\$&')));
  }
  assert.doesNotMatch(sources['settlementMarketUi.js'], /r\.icon/);
  assert.doesNotMatch(sources['settlementProductionUi.js'], /[fg]\.icon|good\?\.icon/);
  assert.doesNotMatch(sources['settlementResearchUi.js'], /d\.icon|x\.icon/);
  assert.doesNotMatch(sources['settlementDefenseUi.js'], /p\.icon|i\.icon/);
  assert.doesNotMatch(sources['settlementIdentityUi.js'], /p\.icon|f\.icon/);
  assert.doesNotMatch(sources['settlementSecretsUi.js'], /facility\.icon|quest\.icon/);
  assert.doesNotMatch(sources['settlementExplorationUi.js'], /location\.icon/);
  assert.doesNotMatch(sources['settlementEndgameNetworkUi.js'], /n\.icon/);
  assert.doesNotMatch(sources['settlementExpeditionsUi.js'], /m\.icon/);
  assert.doesNotMatch(sources['settlementCapitalUi.js'], /p\.icon|crisis\.icon/);
  assert.doesNotMatch(sources['settlementChronicleUi.js'], /x\.icon/);
  assert.doesNotMatch(sources['settlementArenaUi.js'], /mode\.icon/);
  // Found only by the live-viewport pass, not the literal-emoji static scan:
  // settlementSeasonsUi.js has zero emoji *literals* of its own but reads
  // SETTLEMENT_SEASONS/WEATHER/DAYPARTS/FESTIVALS' icon fields (16
  // pictographs in js/data/settlementSeasons.js, #5 on the UIX-0 top-owner
  // list) straight into a rendered <summary>. Same fix as everywhere else
  // in this batch: stop rendering the field, leave the data untouched.
  assert.doesNotMatch(sources['settlementSeasonsUi.js'], /\.icon/);
  assert.match(sources['settlementSeasonsUi.js'], /季節・天候 \$\{x\.season\.name\}/);
  // settlementUi.js's rewardText() also read SETTLEMENT_MATERIALS[k].icon
  // (🪵⛏️🧶🔷) — same category-2 fix, separate from the era/area/role sites.
  assert.doesNotMatch(sources['settlementUi.js'], /m\?\.icon/);
});

test('UIX-6 batch 3 drops decorative large icons (resident/evolution overlays) instead of replacing them with another glyph', () => {
  // Same reasoning as the UIX-6 batch 2 recruit-prompt fix: the name/title
  // renders immediately after, so a standalone icon carries no information.
  assert.doesNotMatch(sources['settlementUi.js'], /font-size:46px/);
  assert.doesNotMatch(sources['settlementUi.js'], /font-size:48px/);
});

test('UIX-6 batch 3 replaces subbar icon-only shortcut buttons with a visible text label', () => {
  // CLAUDE.md: "If an icon is necessary, use a restrained monochrome
  // SVG/CSS icon with a visible label" — these buttons had no label at all.
  assert.match(sources['settlementMarketUi.js'], /btn\.textContent='交易';btn\.title='交易市場'/);
  assert.match(sources['settlementProductionUi.js'], /btn\.textContent='生産';btn\.title='生産区'/);
  assert.match(sources['settlementResearchUi.js'], /btn\.textContent='研究';btn\.title='研究所'/);
});

test('UIX-6 batch 3 replaces the tavern request long/short-term icon and the policy-favored expedition marker with text tags', () => {
  assert.match(sources['settlementUi.js'], /r\.type==='long'\?'【長期】':''/);
  assert.match(sources['settlementExpeditionsUi.js'], /a\.policyFavored\?'【方針】':''/);
});

test('UIX-6 batch 3 folds settlementRanch3Ui.js (deferred from batch 2 on container-ownership grounds) into this batch\'s emoji-free contract', () => {
  assert.doesNotMatch(sources['settlementRanch3Ui.js'], PICTOGRAPH);
  assert.match(sources['settlementRanch3Ui.js'], /getElementById\('settlementContent'\)/);
});

test('UIX-6 batch 3 folds adventureWorld4InvestigationUi.js (renders into the Research sub-screen, found only by the live-viewport pass) into this batch\'s emoji-free contract', () => {
  // Not discovered by the initial file sweep (that grepped for
  // settlementContent/settlementScreen, which this file's target ids —
  // settlementResearchContent/settlementResearchScreen — don't match) —
  // only the live-viewport walk into the Research sub-screen surfaced its
  // 7 glyphs (🧩🔎🕯️🧳🧭). Confirms container ownership, not filename
  // convention, decides scope, same lesson as jobCodexUi.js/settlementRanch3Ui.js.
  assert.doesNotMatch(sources['adventureWorld4InvestigationUi.js'], PICTOGRAPH);
  assert.match(sources['adventureWorld4InvestigationUi.js'], /getElementById\('settlementResearchContent'\)/);
});

test('UIX-6 batch 3 introduces no new calculation authority — Settlement panels read and mutate existing settlement state only', () => {
  for (const source of Object.values(sources)) {
    assert.doesNotMatch(source, /localStorage/);
  }
  assert.match(sources['settlementUi.js'], /state\.settlementLevel\(/);
  assert.match(sources['settlementMarketUi.js'], /state\.settlementTradeRoutes/);
});
