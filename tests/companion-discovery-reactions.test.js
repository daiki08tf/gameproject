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

test('every declared reaction rule has real flavor text and targets a family that genuinely exists in the companion roster', () => {
  const companionsSrc = read('js/data/companions.js') + read('js/data/monsterRanchSpecies.js') + read('js/data/phase12CompanionPack.js');
  for (const [kind, rule] of Object.entries(COMPANION_DISCOVERY_REACTIONS)) {
    assert.equal(typeof rule.family, 'string', `${kind} must target a real family string`);
    assert.match(companionsSrc, new RegExp(`family:'${rule.family}'`), `family '${rule.family}' (used by ${kind}) must actually exist in the companion roster, not an invented category`);
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
