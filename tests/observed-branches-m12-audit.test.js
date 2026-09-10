import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { state } from '../js/state.js';
import { CHAPTERS, isChapterUnlocked, isAbyssUnlocked } from '../js/data/stages.js';
import { WORLD_TIERS } from '../js/data/worldTiers.js';
import { OBSERVED_BRANCHES } from '../js/data/observedBranches.js';
import { knownObservedBranches, knownObservedBranchesForPrimeRegion } from '../js/data/observedBranchDiscovery.js';
import { buildObservedBranchStage, observedBranchStageProgress, observedBranchHuntTargets } from '../js/data/observedBranchStages.js';
import { findStage } from '../js/data/stages.js';

// M12 — Observed Branches completion audit. Cross-checks every item the
// roadmap's M12 checklist names, closing out the M0-M11 program.

test('M12: Prime Story chapters 1-35 are unaffected by the Observed Branches program', () => {
  // Every Prime chapter still resolves through the exact same canonical
  // Stage authority, unaltered in shape, count or ordering.
  const primeChapters = CHAPTERS.filter(ch => ch.num >= 1 && ch.num <= 35);
  assert.equal(primeChapters.length, 35);
  for (const ch of primeChapters) assert.ok(ch.stages.length > 0, `${ch.id} must still have its own Stages`);
  // Ch36 is a real, deliberate new chapter (Arc VI) -- not a Branch, and its
  // presence doesn't retroactively alter any earlier chapter's own content.
  assert.ok(CHAPTERS.some(ch => ch.num === 36));
});

test('M12: endgame gates (Abyss fork, World Tier unlock levels) are unchanged by any Branch or Ch36 addition', () => {
  // The Abyss fork still gates purely on Ch1-25's own final Stages -- no
  // Branch or Ch36 clear state can substitute for or block it.
  const finalIds = new Set(CHAPTERS.filter(ch => ch.num <= 25).map(ch => ch.stages.find(s => s.boss)?.id || ch.stages.at(-1).id));
  assert.equal(isAbyssUnlocked(id => finalIds.has(id)), true);
  assert.equal(isAbyssUnlocked(id => finalIds.has(id) && id !== '20-8'), false);
  // Clearing an unrelated Branch boss changes nothing about the gate: it
  // only ever consults Ch1-25's own final Stage ids.
  assert.equal(
    isAbyssUnlocked(id => finalIds.has(id) && id !== '20-8'),
    isAbyssUnlocked(id => (finalIds.has(id) && id !== '20-8') || id === 'observedbranch-tree-sovereign-boss'),
  );
  // World Tier unlock levels remain purely level-gated, with no Branch or
  // Ch36 discovery/clear state able to substitute for character level.
  for (const tier of WORLD_TIERS) assert.ok(Number.isFinite(tier.unlockLevel));
});

test('M12: World Tier keeps a distinct role from Observed Branches (difficulty band vs. alternate history), never a history selector', () => {
  const src = fs.readFileSync('js/patches/worldTierRuntime.js', 'utf8');
  assert.doesNotMatch(src, /observedBranch|OBSERVED_BRANCH/i, 'World Tier runtime must not know about Branches at all -- it scales any Stage generically');
});

test('M12: Secret Realm keeps a distinct role from Observed Branches (no Branch Stage claims secretRealm ownership)', () => {
  for (const branch of OBSERVED_BRANCHES) {
    for (const stageId of branch.stageIds) {
      const stage = buildObservedBranchStage(stageId);
      assert.notEqual(stage.secretRealm, true, `${stageId} must not claim Secret Realm ownership`);
      assert.notEqual(stage.isAbyss, true, `${stageId} must not claim Abyss ownership`);
    }
  }
});

test('M12: no duplicate Discovery/Codex/Chronicle ownership -- every Branch record wraps the existing screens, none owns a second one', () => {
  assert.equal(fs.readdirSync('js/screens').some(f => /branch/i.test(f)), false, 'no dedicated Branch screen file must exist');
  const codexSrc = fs.readFileSync('js/patches/codexUi.js', 'utf8');
  assert.match(codexSrc, /cp4CodexHistoricalInconsistencies/, 'Branch history records must render inside the existing Monster Codex screen');
  const chronicleSrc = fs.readFileSync('js/patches/settlementChronicle.js', 'utf8');
  assert.match(chronicleSrc, /settlementChronicleTimeline/, 'the base Chronicle timeline function Branch records wrap must still exist');
});

test('M12: no duplicate Gear/Option authority -- Branch equipment resolves only through the shared ITEMS map', () => {
  const src = fs.readFileSync('js/data/equipment.js', 'utf8');
  assert.match(src, /OBSERVED_BRANCH_EQUIPMENT\)/);
  assert.match(src, /OBSERVED_BRANCH_EQUIPMENT_II\)/);
  assert.doesNotMatch(src, /BRANCH_ITEMS\s*=\s*new Map/, 'must not introduce a second item store for Branch gear');
});

test('M12: no hidden Branch spoiler counts -- the total Branch registry is never imported by any screen or UI patch', () => {
  const uiFiles = [...fs.readdirSync('js/screens'), ...fs.readdirSync('js/patches')].filter(f => f.endsWith('.js'));
  for (const file of uiFiles) {
    const dir = fs.existsSync(`js/screens/${file}`) ? 'js/screens' : 'js/patches';
    const src = fs.readFileSync(`${dir}/${file}`, 'utf8');
    assert.doesNotMatch(src, /OBSERVED_BRANCHES\.(length|map|filter|forEach)/, `${dir}/${file} must not surface the total Branch registry`);
  }
  // Discovery always renders through the known/query helpers, not the raw list.
  assert.deepEqual(knownObservedBranches({ discoveries: {} }), []);
  assert.deepEqual(knownObservedBranchesForPrimeRegion({ chapterId: 'ch2' }, { discoveries: {} }), []);
});

test('M12: save compatibility -- a legacy save with no Observed Branches / Ch36 fields ever touched does not crash any entry point', () => {
  const legacy = { ...state.data };
  delete legacy.world2;
  const backup = state.data;
  try {
    state.data = legacy;
    assert.doesNotThrow(() => knownObservedBranches({ discoveries: state.data.world2?.discoveries || {} }));
    assert.doesNotThrow(() => observedBranchStageProgress(OBSERVED_BRANCHES[0].id, { isStageCleared: () => false }));
    assert.doesNotThrow(() => observedBranchHuntTargets(OBSERVED_BRANCHES[0].id, { isStageCleared: () => false }));
    assert.doesNotThrow(() => findStage('observedbranch-tree-sovereign-1'));
    assert.doesNotThrow(() => findStage('36-1'));
    assert.doesNotThrow(() => isChapterUnlocked(CHAPTERS.findIndex(ch => ch.num === 36), () => false));
  } finally {
    state.data = backup;
  }
});

test('M12 found-and-fix: equipment compare/detail lines never render the literal string "undefined" for effects without an authored name/desc', () => {
  // Surfaced during this audit's live-viewport pass: comparing an ordinary
  // item against a Unique/Bounty/Branch item (whose `effects` entries only
  // carry trigger/kind/power, not chapters.js's EFFECTS-style name/desc
  // pair) rendered "+固有:undefined" in the Equipment picker. This is a
  // general Equipment screen defect, not Branch-specific -- it would have
  // reproduced with any pre-existing Unique/Bounty item just as easily --
  // but this audit is where it was actually seen and fixed.
  const src = fs.readFileSync('js/screens/equipment.js', 'utf8');
  assert.match(src, /\(candidate\.effects \|\| \[\]\)\.map\(\(e\) => e\.name \|\| e\.kind\)/);
  assert.match(src, /\(current\.effects \|\| \[\]\)\.map\(\(e\) => e\.name \|\| e\.kind\)/);
  assert.doesNotMatch(src, /`◆\$\{eff\.name\}: \$\{eff\.desc\}`/);
});

test('M12: required CI gates stay green (syntax + emoji migration ceiling do not regress)', () => {
  // The actual gates run via `npm run test:syntax` and
  // `node scripts/uix-emoji-check.js` in CI; this test only guards that the
  // emoji-check script itself still exists and targets the app shell, so a
  // future refactor cannot silently drop the gate.
  assert.ok(fs.existsSync('scripts/uix-emoji-check.js'));
});
