import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMPANION_DISCOVERY_REACTIONS, companionDiscoveryReaction } from '../js/data/companionDiscoveryReactions.js';

function read(relPath) {
  return fs.readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
}

// ---- C6-8: Discovery integration -----------------------------------------
// Per LIVING_WORLD_DISCOVERY_ROADMAP.md C6-8: "identity-driven hints and
// reactions... not mandatory flat bonuses... reasons to care about
// collection breadth, not hard gates requiring one exact companion." So
// this is flavor only -- companionDiscoveryReaction() must never touch a
// reward/odds value, only return (or not return) a text line.

function companion(family, name = 'テスト個体') {
  return { id: 'test-id', species: { family, name }, instance: {} };
}

test('companionDiscoveryReaction returns null for an unknown kind (no silent fallback to some default reaction)', () => {
  assert.equal(companionDiscoveryReaction('notARealKind', [companion('undead')]), null);
});

test('companionDiscoveryReaction returns null when no active companion matches the required family', () => {
  assert.equal(companionDiscoveryReaction('archaeology', []), null);
  assert.equal(companionDiscoveryReaction('archaeology', [companion('beast'), companion('construct')]), null);
});

test('companionDiscoveryReaction matches archaeology -> undead and treasureHunt -> spirit, per the roadmap\'s own "ancient/ghost" and "scent/tracker" examples', () => {
  const archaeology = companionDiscoveryReaction('archaeology', [companion('beast'), companion('undead', '灰骸兵')]);
  assert.ok(archaeology);
  assert.equal(archaeology.companionName, '灰骸兵');
  assert.match(archaeology.text, /灰骸兵/);

  const treasureHunt = companionDiscoveryReaction('treasureHunt', [companion('spirit', 'コウモリ')]);
  assert.ok(treasureHunt);
  assert.equal(treasureHunt.companionName, 'コウモリ');
});

test('a companion instance nickname takes priority over the species name (matches every other companion-facing display in this codebase)', () => {
  const c = { id: 'x', species: { family: 'undead', name: '灰骸兵' }, instance: { nickname: 'シロ' } };
  const reaction = companionDiscoveryReaction('archaeology', [c]);
  assert.equal(reaction.companionName, 'シロ');
});

test('every declared reaction rule has real flavor text and targets a family or role that genuinely exists in the companion roster', () => {
  const companionsSrc = read('js/data/companions.js') + read('js/data/monsterRanchSpecies.js') + read('js/data/phase12CompanionPack.js');
  for (const [kind, rule] of Object.entries(COMPANION_DISCOVERY_REACTIONS)) {
    // A rule targets exactly one existing tag: a species family, or (since the
    // 2026-11 continuation) a species role. Either way it must already exist in
    // the roster -- the point of this test is "no invented categories".
    assert.equal(Number(typeof rule.family === 'string') + Number(typeof rule.role === 'string'), 1, `${kind} must target exactly one of family/role`);
    if (rule.family) assert.match(companionsSrc, new RegExp(`family:'${rule.family}'`), `family '${rule.family}' (used by ${kind}) must actually exist in the companion roster, not an invented category`);
    if (rule.role) assert.match(companionsSrc, new RegExp(`role:'${rule.role}'`), `role '${rule.role}' (used by ${kind}) must actually exist in the companion roster, not an invented category`);
    assert.equal(typeof rule.text('X'), 'string');
    assert.ok(rule.text('X').length > 0);
  }
});

test('C6-8: the reaction is wired into archaeology.js/treasureHunt.js as an EXTRA field on the existing result, never substituted for or mixed into gained/reward', () => {
  const archaeologyRuntime = read('js/patches/archaeology.js');
  assert.match(archaeologyRuntime, /import \{ companionDiscoveryReaction \} from '\.\.\/data\/companionDiscoveryReactions\.js';/);
  assert.match(archaeologyRuntime, /companionReaction\s*=\s*companionDiscoveryReaction\('archaeology',\s*state\.activeCompanions\?\.\(\)\s*\|\|\s*\[\]\)/);
  assert.match(archaeologyRuntime, /companionReaction\s*\}\s*;\s*\n\s*\};/, 'companionReaction must be a sibling field on the returned result object');

  const treasureHuntRuntime = read('js/patches/treasureHunt.js');
  assert.match(treasureHuntRuntime, /import \{ companionDiscoveryReaction \} from '\.\.\/data\/companionDiscoveryReactions\.js';/);
  assert.match(treasureHuntRuntime, /companionReaction\s*=\s*companionDiscoveryReaction\('treasureHunt',\s*state\.activeCompanions\?\.\(\)\s*\|\|\s*\[\]\)/);
});

test('No new save root, no new battle/loot authority: companionDiscoveryReactions.js is pure data with no state.js/DOM dependency', () => {
  const src = read('js/data/companionDiscoveryReactions.js');
  assert.doesNotMatch(src, /import .* from '\.\.\/state\.js'/);
  assert.doesNotMatch(src, /document\.|window\./);
  assert.doesNotMatch(src, /localStorage/);
});

test('No platform emoji introduced by the C6-8 reaction feature', () => {
  const PICTOGRAPH = /\p{Extended_Pictographic}/u;
  for (const file of ['js/data/companionDiscoveryReactions.js']) {
    assert.doesNotMatch(read(file), PICTOGRAPH, `${file} must not introduce platform emoji`);
  }
});

test('C6-8 continuation: fishing / region / settlement reactions match existing tags and stay flavor-only', () => {
  const aquatic = { id: 'a#1', species: { name: '飛沫駆け', family: 'aquatic' }, instance: {} };
  const guardian = { id: 'g#1', species: { name: '氷玻璃兵', family: 'construct', role: 'guardian' }, instance: {} };
  const support = { id: 's#1', species: { name: '夢喰い蝶', family: 'spirit', role: 'support' }, instance: {} };
  assert.match(companionDiscoveryReaction('fishing', [aquatic]).text, /飛沫駆け/);
  assert.equal(companionDiscoveryReaction('fishing', [guardian, support]), null);
  assert.match(companionDiscoveryReaction('region', [guardian]).text, /氷玻璃兵/);
  assert.equal(companionDiscoveryReaction('region', [aquatic]), null);
  assert.match(companionDiscoveryReaction('settlement', [support]).text, /夢喰い蝶/);
  // spirit-family support still triggers the family rule it already had
  assert.ok(companionDiscoveryReaction('treasureHunt', [support]));
  for (const [file, kind] of [['js/patches/fishing.js', 'fishing'], ['js/patches/settlementIncidents.js', 'settlement'], ['js/patches/regionCodexUi.js', 'region']]) {
    assert.match(read(file), new RegExp(`companionDiscoveryReaction\\('${kind}', state\\.activeCompanions\\?\\.\\(\\) \\|\\| \\[\\]\\)`), `${file} asks for the ${kind} reaction`);
  }
});
