import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COMPANION_SPECIES,
  companionExpToNext,
  companionStats,
  companionTraitEffect,
  companionTraitLabel,
} from '../js/data/companions.js';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('companion species data stays usable and growth is monotonic', () => {
  for (const id of ['slime', 'goblin', 'bat']) {
    const species = COMPANION_SPECIES[id];
    assert.ok(species, `${id} should exist`);
    const lv1 = companionStats(species, { level: 1, nature: 'balanced', talent: {} });
    const lv10 = companionStats(species, { level: 10, nature: 'balanced', talent: {} });
    for (const stat of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) {
      assert.ok(lv1[stat] >= 1, `${id}.${stat} should be positive`);
      assert.ok(lv10[stat] >= lv1[stat], `${id}.${stat} should not shrink with level`);
    }
  }
});

test('companion traits have real effects and honest labels', () => {
  assert.deepEqual(companionTraitEffect('ぷにぷにボディ'), {
    kind: 'physicalMitigation', power: 0.10, desc: '通常攻撃の被ダメージ -10%',
  });
  assert.equal(companionTraitEffect('悪知恵').kind, 'lowHpDamage');
  assert.equal(companionTraitEffect('夜目').kind, 'initiativeSpd');
  assert.match(companionTraitLabel('夜目'), /SPD \+15%/);
});

test('companion EXP curve increases with level', () => {
  let prev = 0;
  for (let level = 1; level <= 100; level++) {
    const next = companionExpToNext(level);
    assert.ok(next > prev, `EXP requirement should increase at Lv.${level}`);
    prev = next;
  }
});

test('battle patch keeps final-hit, frozen, zero-XP, shared DEF, and SPD guards', async () => {
  const text = await source('js/patches/companionBattle.js');
  const frozenGuard = text.indexOf('enemy && enemy.frozenTurns > 0');
  const companionTargetBranch = text.indexOf('companionCanBeTargeted(this)');
  assert.ok(frozenGuard >= 0 && companionTargetBranch >= 0 && frozenGuard < companionTargetBranch,
    'frozen check must happen before companion targeting');
  assert.match(text, /\(enemy\.xp \|\| 0\) > 0/, 'zero-XP enemies must not grant companion EXP');
  assert.match(text, /this\.aliveEnemies\.length === 0[\s\S]*this\.checkBattleEnd\(\)/,
    'companion final hit must trigger battle-end recheck');
  assert.match(text, /defMitigationPct\(target\.def \|\| 0\)/,
    'companion damage must use the shared DEF mitigation rule');
  assert.match(text, /defMitigationPct\(companion\.def \|\| 0\)/,
    'damage to companions must use the shared DEF mitigation rule');
  assert.doesNotMatch(text, /\+ 55\)/, 'companion combat must not keep a private DEF constant');
  assert.match(text, /effectiveCompanionSpd\(c\) >= fastestEnemy/,
    'companion SPD must influence whether it acts before the enemy phase');
  assert.match(text, /originalRunEnemyPhase/, 'SPD ordering must integrate at the enemy phase boundary');
});

test('foundation keeps one-time starter and allows a truly empty roster', async () => {
  const text = await source('js/patches/companionFoundation.js');
  assert.match(text, /starterCompanionGranted/, 'starter grant must be persisted');
  assert.match(text, /this\.data\.companionParty\[0\] = null;[\s\S]*delete this\.data\.companionInstances\[instanceId\]/,
    'releasing active companion should clear party slot before deleting the instance');
  const outerGuard = text.indexOf('if (!state.data.starterCompanionGranted)');
  const emptyRosterCheck = text.indexOf('if (state.companionList().length === 0)', outerGuard);
  const starterCreate = text.indexOf("state.createCompanion('slime'", emptyRosterCheck);
  const flagSet = text.indexOf('state.data.starterCompanionGranted = true', starterCreate);
  assert.ok(outerGuard >= 0 && emptyRosterCheck > outerGuard && starterCreate > emptyRosterCheck && flagSet > starterCreate,
    'empty-roster starter creation must be nested inside the persisted one-time grant guard');
  assert.match(text, /map\(companionTraitLabel\)/, 'companion screen should describe actual trait effects');
});

test('recruitment is type-based and elite recruits have a rarity floor', async () => {
  const text = await source('js/patches/companionRecruitment.js');
  assert.match(text, /grunt:\s*'goblin'/);
  assert.match(text, /fast:\s*'bat'/);
  assert.match(text, /RECRUIT_SPECIES_BY_ENEMY_TYPE\[enemy\.type\]/,
    'recruitment must use enemy type, not localized display name');
  assert.match(text, /minRarity:\s*'rare'/, 'elite recruitment should guarantee Rare or better');
  assert.match(text, /let resolved = false[\s\S]*if \(resolved\) return;/,
    'recruit prompt should guard double taps');
});

test('weapon patch keeps same-base material and cleanup behavior', async () => {
  const text = await source('js/patches/weaponInstanceFoundation.js');
  assert.match(text, /baseItemId\(id\) !== targetBase/);
  assert.match(text, /this\.isItemLocked\(id\) \|\| this\.isItemFavorite\(id\)/);
  assert.match(text, /clearInstanceData\(itemId\)/);
  assert.match(text, /weaponItemPower/);
});

test('main imports all integration patches in stable order', async () => {
  const text = await source('js/main.js');
  const order = [
    "./patches/weaponInstanceFoundation.js",
    "./patches/companionFoundation.js",
    "./patches/companionBattle.js",
    "./patches/companionRecruitment.js",
  ].map((s) => text.indexOf(s));
  assert.ok(order.every((n) => n >= 0), 'all integration patches must be imported');
  assert.ok(order.every((n, i) => i === 0 || n > order[i - 1]), 'patch imports must stay ordered');
});

test('character dashboard keeps basic, equipment, and detail views', async () => {
  const text = await source('js/screens/status.js');
  assert.match(text, /\['basic','基本'\]/);
  assert.match(text, /\['equipment','装備'\]/);
  assert.match(text, /\['detail','詳細'\]/);
  assert.match(text, /state\.getStatBreakdown\(key\)/, 'stat breakdown must reuse shared state calculation');
  assert.match(text, /state\.weaponItemPower/, 'equipment tab should surface weapon Item Power');
  assert.match(text, /characterDashboardCss/, 'dashboard stylesheet should be loaded once');
});

test('revival spell serializes the whole state payload', async () => {
  const text = await source('js/screens/spellScreen.js');
  assert.match(text, /encodeSpell\(state\.data\)/,
    'companion fields must stay included in revival spell serialization');
});
