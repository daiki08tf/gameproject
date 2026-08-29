import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }

const nav = read('js/patches/homeNavigation.js');

// Every Settlement 3.0 data/runtime/UI file that S1-S18 shipped. If any of
// these stops being imported, the whole system silently goes dark.
const SETTLEMENT_DATA_FILES = [
  'settlement', 'settlementMarket', 'settlementProduction', 'settlementResearch',
  'settlementTavern', 'settlementExploration', 'settlementSecrets', 'settlementDefense',
  'settlementSeasons', 'settlementIdentity', 'settlementExpeditions',
  'settlementEndgameNetwork', 'settlementRanch3', 'settlementCapital',
];
const SETTLEMENT_RUNTIME_FILES = [
  'settlementCore', 'settlementTavern', 'settlementProduction', 'settlementMarket',
  'settlementResearch', 'settlementExploration', 'settlementSecrets', 'settlementDefense',
  'settlementSeasons', 'settlementIdentity', 'settlementExpeditions',
  'settlementEndgameNetwork', 'settlementArena', 'settlementChronicle', 'settlementCapital',
];
const SETTLEMENT_UI_FILES = [
  'settlementUi', 'settlementProductionUi', 'settlementMarketUi', 'settlementResearchUi',
  'settlementExplorationUi', 'settlementSecretsUi', 'settlementDefenseUi', 'settlementSeasonsUi',
  'settlementIdentityUi', 'settlementExpeditionsUi', 'settlementEndgameNetworkUi',
  'settlementArenaUi', 'settlementChronicleUi', 'settlementCapitalUi', 'settlementRanch3Ui',
  'settlementUi4',
];

test('S19: every Settlement 3.0 runtime and UI patch is still imported from homeNavigation.js', () => {
  for (const name of SETTLEMENT_RUNTIME_FILES) assert.match(nav, new RegExp(`import '\\./${name}\\.js'`), `missing runtime import: ${name}`);
  for (const name of SETTLEMENT_UI_FILES) assert.match(nav, new RegExp(`import '\\./${name}\\.js'`), `missing UI import: ${name}`);
});

test('S19: every Settlement 3.0 data file backing those imports still exists', () => {
  for (const name of SETTLEMENT_DATA_FILES) assert.ok(fs.existsSync(`js/data/${name}.js`), `missing data file: ${name}.js`);
});

test('S19: Settlement still installs exactly one Home button across all S1-S19 systems', () => {
  const idAssignments = [];
  for (const name of SETTLEMENT_UI_FILES) {
    const src = read(`js/patches/${name}.js`);
    for (const m of src.matchAll(/\.id\s*=\s*'(goSettlement\w*Btn)'/g)) idAssignments.push(`${name}:${m[1]}`);
  }
  assert.equal(idAssignments.length, 1, `expected exactly one goSettlement*Btn assignment, found: ${idAssignments.join(', ')}`);
  assert.equal(idAssignments[0], 'settlementUi:goSettlementBtn');
});

test('S19: __settlement3 sub-systems each claim a distinct save key (no collisions)', () => {
  // Discovered by direct source audit of each file's ensure()-style initializer.
  const keyByFile = {
    settlementMarket: 'market2',
    settlementProduction: 'production',
    settlementResearch: 'research',
    settlementTavern: 'tavern',
    settlementIdentity: 'identity',
    settlementArena: 'arena',
    settlementCapital: 'capital',
    settlementDefense: 'defense',
    settlementEndgameNetwork: 'endgameNetwork',
    settlementExpeditions: 'expeditions',
    settlementExploration: 'exploration',
    settlementSeasons: 'seasons',
    settlementSecrets: 'secrets',
  };
  for (const [name, key] of Object.entries(keyByFile)) {
    const src = read(`js/patches/${name}.js`);
    assert.match(src, /__settlement3/, `${name}.js must nest its save data under __settlement3`);
    assert.match(src, new RegExp(`\\.${key}\\s*(?:=|\\|\\|=|\\?\\?=|;)`), `${name}.js no longer touches its expected sub-key '${key}'`);
  }
  const keys = Object.values(keyByFile);
  assert.equal(new Set(keys).size, keys.length, `duplicate __settlement3 sub-keys detected: ${JSON.stringify(keyByFile)}`);
});

test('S19: policy/seasons/exploration/defense/expeditions/endgame public APIs do not collide on the shared state object', () => {
  const files = [
    'settlementCore', 'settlementTavern', 'settlementProduction', 'settlementMarket',
    'settlementResearch', 'settlementExploration', 'settlementSecrets', 'settlementDefense',
    'settlementSeasons', 'settlementIdentity', 'settlementExpeditions',
    'settlementEndgameNetwork', 'settlementArena', 'settlementChronicle', 'settlementCapital',
    'settlementRanch3',
  ];
  const declaredBy = {};
  for (const name of files) {
    const src = read(`js/patches/${name}.js`);
    for (const m of src.matchAll(/state\.([a-zA-Z0-9]+)\s*=\s*function/g)) {
      const fn = m[1];
      assert.ok(!declaredBy[fn], `state.${fn} is declared in both ${declaredBy[fn]} and ${name}`);
      declaredBy[fn] = name;
    }
  }
  // Sanity: the scan actually found representative APIs from each named area.
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementPolic')));
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementSeason')));
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementExploration') || fn.startsWith('settlementHiddenFacilities')));
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementDefense')));
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementExpedition')));
  assert.ok(Object.keys(declaredBy).some((fn) => fn.startsWith('settlementEndgameNetwork') || fn.includes('EndgameNetwork')));
});

test('S19: every __settlement3 sub-system backfills a missing/legacy save shape instead of throwing on read', () => {
  // Old saves may predate S9-S18 entirely: settlementBuildings exists (Settlement 1.0)
  // but settlementBuildings.__settlement3 does not. Every ensure()-style initializer
  // must tolerate that, not assume the key already exists.
  const files = [
    'settlementMarket', 'settlementProduction', 'settlementResearch', 'settlementTavern',
    'settlementIdentity', 'settlementArena', 'settlementCapital', 'settlementDefense',
    'settlementEndgameNetwork', 'settlementExpeditions', 'settlementExploration',
    'settlementSeasons', 'settlementSecrets',
  ];
  for (const name of files) {
    const src = read(`js/patches/${name}.js`);
    assert.match(
      src,
      /\[META_KEY\]\s*\?\?=|if\(!root\|\|typeof root!=='object'|__settlement3\s*\|\|\(/,
      `${name}.js must guard the case where __settlement3 itself is missing`,
    );
  }
});

test('S19: Settlement UI container/screen ids stay unique across every sub-screen', () => {
  const ids = [];
  for (const name of SETTLEMENT_UI_FILES) {
    const path = `js/patches/${name}.js`;
    if (!fs.existsSync(path)) continue;
    const src = read(path);
    for (const m of src.matchAll(/\bid\s*=\s*'([a-zA-Z0-9]+(?:Screen|Content))'/g)) ids.push(m[1]);
  }
  assert.ok(ids.length >= 4, 'expected to find the core Settlement/Market/Production/Research sub-screens');
  assert.equal(new Set(ids).size, ids.length, `duplicate container id detected: ${ids.join(', ')}`);
});

test('S19: Settlement UI never prints a raw internal id as visible player-facing text', () => {
  for (const name of SETTLEMENT_UI_FILES) {
    const path = `js/patches/${name}.js`;
    if (!fs.existsSync(path)) continue;
    const src = read(path);
    // A `${x.id}` interpolation landing right after a `>` is HTML text content
    // (not an attribute value or a plain JS object-key lookup), so it would
    // leak an internal identifier (e.g. "beastRaid") straight into the UI
    // instead of a translated/localized label.
    for (const m of src.matchAll(/>\s*\$\{[a-zA-Z0-9_.?()]*\.id\}/g)) {
      assert.fail(`${name}.js leaks a raw .id into visible HTML text: ...${src.slice(Math.max(0, m.index - 20), m.index + m[0].length)}...`);
    }
  }
});

test('S19: no Settlement sub-system reimplements BattleEngine or a competing combat loop', () => {
  for (const name of SETTLEMENT_RUNTIME_FILES) {
    const src = read(`js/patches/${name}.js`);
    assert.doesNotMatch(src, /class BattleEngine|new BattleEngine\(/, `${name}.js must not construct its own battle engine`);
  }
});

test('S19: Settlement UI never claims a pending encounter has already been resolved into combat', () => {
  // "pending"/"waiting" framing is fine (Capital, Secrets); claiming the hand-off
  // to the existing battle system already *happened* when only a pending flag
  // was set is the exact bug class this test locks in against regressing.
  for (const name of ['settlementDefenseUi', 'settlementCapitalUi', 'settlementSecretsUi']) {
    const src = read(`js/patches/${name}.js`);
    assert.doesNotMatch(src, /渡した。|開始した。|戦闘を開始しました/, `${name}.js must not assert a battle already started/was handed off`);
  }
});

test('S19: coexistence (魔物共生) policy actually influences Ranch/Expeditions, not just declared in data', () => {
  const identityData = read('js/data/settlementIdentity.js');
  assert.match(identityData, /id:'coexistence'/);
  const ranch3 = read('js/patches/settlementRanch3.js');
  const expeditions = read('js/patches/settlementExpeditions.js');
  assert.match(ranch3, /settlementPolicyBias\?\.\('ranch'\)/, 'settlementRanch3.js must read the ranch-focused policy bias');
  assert.match(expeditions, /settlementPolicyBias\?\.\('ranch'\)/, 'settlementExpeditions.js must read the ranch-focused policy bias');
  assert.match(expeditions, /recordSettlementFactionActivity\?\.\('tamers'/, 'a companion-led expedition must record 共生会/tamers faction activity');
});

test('S19: UI 4.0 category dividers are idempotent and touch no save state', () => {
  const ui4 = read('js/patches/settlementUi4.js');
  assert.match(ui4, /settlementUi4Heading/);
  assert.doesNotMatch(ui4, /__settlement3|state\.save\(\)/, 'settlementUi4.js must be presentation-only');
  assert.match(ui4, /if\(host\.querySelector\(`\[data-settlement-ui4-heading="\$\{cat\.key\}"\]`\)\)continue;/);
});

test('S19: roadmap marks S17-S19 complete', () => {
  const roadmap = read('SETTLEMENT_3_LIVING_FRONTIER_ROADMAP.md');
  assert.match(roadmap, /## \[x\] S17 — Monuments, Museum & Chronicle/);
  assert.match(roadmap, /## \[x\] S18 — Frontier Capital Endgame/);
  assert.match(roadmap, /## \[x\] S19 — UI 4\.0 \+ Full Integration Regression/);
});
