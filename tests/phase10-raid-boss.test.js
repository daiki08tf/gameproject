import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RAID_BOSSES, buildRaidStage, raidBossUnlocked } from '../js/data/raidBosses.js';
import { findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';
import { getItem } from '../js/data/equipment.js';

test('Official Phase 10-E exposes at least one real raid descriptor', () => {
  assert.ok(RAID_BOSSES.length >= 1);
  const raid = RAID_BOSSES[0];
  assert.equal(raid.id, 'raid-archeon');
  assert.ok(raid.recLevel >= 3000);
  assert.ok(raid.itemPowerTarget > 0);
  assert.ok(raid.requiredAbyssDepth > 0);
  assert.ok(raid.dangerTags.includes('Break'));
  assert.match(raid.mechanic, /Break/);
  assert.match(raid.counterHint, /Break/);
});

test('raid unlock is tied to Abyss progress without a new currency', () => {
  const raid = RAID_BOSSES[0];
  assert.equal(raidBossUnlocked(raid, raid.requiredAbyssDepth - 1), false);
  assert.equal(raidBossUnlocked(raid, raid.requiredAbyssDepth), true);
  assert.equal(raidBossUnlocked(raid, raid.requiredAbyssDepth + 100), true);
  assert.equal('currency' in raid, false);
});

test('raid stage resolves through the canonical findStage route', () => {
  const direct = buildRaidStage('raid-archeon');
  const found = findStage('raid-archeon');
  assert.ok(direct);
  assert.ok(found);
  assert.equal(found.chapter, null);
  assert.equal(found.stage.id, direct.id);
  assert.equal(found.stage.raid, true);
  assert.equal(found.stage.boss, true);
  assert.equal(found.stage.waves.at(-1).type, 'raid_archeon');
});

test('raid reuses existing equipment economy and valid rewards', () => {
  const stage = buildRaidStage('raid-archeon');
  assert.ok(stage.rewards.exp > 0);
  assert.ok(stage.rewards.gold > 0);
  assert.ok(getItem(stage.firstClear.itemId), `missing first-clear item ${stage.firstClear.itemId}`);
  for (const drop of stage.dropTable) assert.ok(getItem(drop.itemId), `missing raid drop ${drop.itemId}`);
});

test('raid enemy is a moderate numeric step, not an HP-only sponge', () => {
  const base = ENEMY_TYPES.ch25_boss;
  const raid = ENEMY_TYPES.raid_archeon;
  assert.ok(raid && raid.raid && raid.boss);
  assert.ok(raid.hp > base.hp);
  assert.ok(raid.hp / base.hp <= 2);
  assert.ok(raid.atk > base.atk);
  assert.ok(raid.def > base.def);
});

test('raid boss profile has escorts, multiple phases and shrinking Break windows', () => {
  const profile = bossEncounterProfile('raid_archeon');
  assert.ok(profile);
  assert.ok(profile.startEscorts.some(escort => escort.guard));
  assert.ok(profile.phases.length >= 4);
  const breakWindows = profile.phases.map(phase => phase.breakGaugePct).filter(Number.isFinite);
  assert.ok(breakWindows.length >= 3);
  assert.ok(breakWindows.at(-1) < breakWindows[0]);
});

test('raid UI lives inside endgame flow and exposes preparation detail', () => {
  const abyssUi = fs.readFileSync(new URL('../js/screens/abyss.js', import.meta.url), 'utf8');
  const confirmUi = fs.readFileSync(new URL('../js/screens/stageSelect.js', import.meta.url), 'utf8');
  const home = fs.readFileSync(new URL('../js/screens/home.js', import.meta.url), 'utf8');
  assert.match(abyssUi, /renderRaids/);
  assert.match(abyssUi, /requiredAbyssDepth/);
  assert.match(confirmUi, /RAID PREPARATION/);
  assert.match(confirmUi, /raidCounterHint/);
  assert.doesNotMatch(home, /raid-archeon|goRaidBtn|Raid Boss/);
});
